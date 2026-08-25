import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { readLlmKeys, hasLlmKey } from "./lib/llm";
import { buildDeepDebrief, type DeepDebrief } from "./lib/simulatorScoring";
import { updateConnection, buildDirectorNote } from "./lib/director";
import { embedQuery, MIN_SCORE } from "./lib/retrieval";
import { detectHighRisk, HIGH_RISK_RESPONSE } from "./lib/aiSafety";
import {
  limitSimulatorHistory,
  SIMULATOR_HOURLY_USER_MESSAGE_LIMIT,
  SIMULATOR_HOURLY_SESSION_LIMIT,
  SIMULATOR_MAX_HISTORY_TURNS,
  SIMULATOR_MAX_USER_TURNS_PER_SESSION,
} from "./lib/simulatorLimits";
import {
  requireIdentity,
  requireOwnedClerkResource,
  requireUser,
} from "./lib/authGuard";
import {
  claimSimulatorTrialUnit,
  decideSimulatorAccess,
  settleSimulatorTrialUnit,
  SIMULATOR_TRIAL_POLICY,
  SIMULATOR_TRIAL_LOCKED_ERROR,
  type SimulatorAccessDecision,
  type SimulatorTrialState,
} from "./lib/simulatorTrialPolicy";

// ==========================================
// Simulator - Phase 17
// Dating simulation with AI personas
// ==========================================

type SimulatorDbCtx = QueryCtx | MutationCtx;
type SimulatorSendResult = {
  content: string;
  source: "live" | "template" | "safety";
  access: SimulatorAccessDecision;
};

async function getSimulatorAccessFacts(
  ctx: SimulatorDbCtx,
  user: Doc<"users">,
) {
  const now = Date.now();
  const entitlements = await ctx.db
    .query("courseEntitlements")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
  const activeEntitlements = entitlements.filter(
    (entitlement) =>
      entitlement.status === "active" &&
      (entitlement.validUntil === undefined || entitlement.validUntil > now),
  );
  const entitledCourses = await Promise.all(
    activeEntitlements.map((entitlement) => ctx.db.get(entitlement.courseId)),
  );
  const hasTrustedEntitlement = entitledCourses.some(
    (course) =>
      course?.title.trim() === SIMULATOR_TRIAL_POLICY.entitlementCourseTitle,
  );
  const usage = await ctx.db
    .query("simulatorTrialUsage")
    .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
    .unique();
  const state: SimulatorTrialState = usage
    ? {
        consumedUnits: usage.consumedUnits,
        reservations: usage.reservations,
      }
    : { consumedUnits: 0, reservations: [] };
  return {
    now,
    usage,
    state,
    isAdmin: user.role === "admin",
    hasTrustedEntitlement,
  };
}

async function getSimulatorAccessDecision(
  ctx: SimulatorDbCtx,
  user: Doc<"users">,
) {
  const facts = await getSimulatorAccessFacts(ctx, user);
  return decideSimulatorAccess({
    isAdmin: facts.isAdmin,
    hasTrustedEntitlement: facts.hasTrustedEntitlement,
    state: facts.state,
    now: facts.now,
  });
}

// One small, learner-safe status object. It reveals no entitlement source,
// course identity, payment row, role detail or reservation token.
export const getAccessStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await getSimulatorAccessDecision(ctx, user);
  },
});

export const getAccessStatusForAction = internalQuery({
  args: { ownerUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.ownerUserId))
      .unique();
    if (!user) throw new Error("USER_RECORD_REQUIRED");
    return await getSimulatorAccessDecision(ctx, user);
  },
});

export const claimTrialUnit = internalMutation({
  args: { ownerUserId: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.ownerUserId))
      .unique();
    if (!user) throw new Error("USER_RECORD_REQUIRED");
    const facts = await getSimulatorAccessFacts(ctx, user);
    const claim = claimSimulatorTrialUnit({
      state: facts.state,
      now: facts.now,
      token: args.token,
      isAdmin: facts.isAdmin,
      hasTrustedEntitlement: facts.hasTrustedEntitlement,
    });
    if (!claim.allowed) return claim;
    if (claim.grant.kind === "trial") {
      if (facts.usage) {
        await ctx.db.patch(facts.usage._id, {
          reservations: claim.state.reservations,
          updatedAt: facts.now,
        });
      } else {
        await ctx.db.insert("simulatorTrialUsage", {
          userId: user.clerkId,
          consumedUnits: claim.state.consumedUnits,
          reservations: claim.state.reservations,
          updatedAt: facts.now,
        });
      }
    }
    return claim;
  },
});

export const releaseTrialUnit = internalMutation({
  args: { ownerUserId: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("simulatorTrialUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerUserId))
      .unique();
    if (!usage) return;
    await ctx.db.patch(usage._id, {
      reservations: usage.reservations.filter(
        (reservation) => reservation.token !== args.token,
      ),
      updatedAt: Date.now(),
    });
  },
});

// List all published scenarios
export const listScenarios = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const scenarios = await ctx.db
      .query("simulatorScenarios")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    return scenarios
      .filter(
        (scenario) =>
          Number.isInteger(scenario.personaAge) &&
          scenario.personaAge >= 18 &&
          scenario.personaAge <= 100,
      )
      .sort((a, b) => a.order - b.order);
  },
});

// Get single scenario by ID
export const getScenario = query({
  args: { scenarioId: v.id("simulatorScenarios") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario?.published) return null;
    if (
      !Number.isInteger(scenario.personaAge) ||
      scenario.personaAge < 18 ||
      scenario.personaAge > 100
    ) {
      return null;
    }
    return scenario;
  },
});

// Get session with all its messages
export const getSession = query({
  args: { sessionId: v.id("simulatorSessions") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    if (session.userId !== identity.subject) return null;

    const messages = await ctx.db
      .query("simulatorMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const sorted = messages.sort((a, b) => a.createdAt - b.createdAt);
    const scenario = await ctx.db.get(session.scenarioId);

    return {
      ...session,
      messages: sorted,
      scenario,
    };
  },
});

// Internal equivalent for actions. The owner subject comes from the action's
// authenticated identity; clients cannot call this function directly.
export const getOwnedSessionForAction = internalQuery({
  args: {
    sessionId: v.id("simulatorSessions"),
    ownerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    if (session.userId !== args.ownerUserId) {
      return null;
    }
    const messages = await ctx.db
      .query("simulatorMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2 + 1);
    return {
      ...session,
      messages: messages.reverse(),
      scenario: await ctx.db.get(session.scenarioId),
    };
  },
});

// List all sessions for the current user
export const listUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    const sessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const sorted = sessions.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      sorted.map(async (session) => {
        const scenario = await ctx.db.get(session.scenarioId);
        return {
          ...session,
          scenarioTitle: scenario?.title ?? "תרחיש לא נמצא",
          scenarioDifficulty: scenario?.difficulty ?? "easy",
          personaName: scenario?.personaName ?? "",
        };
      }),
    );
  },
});

// Start a new simulator session
export const startSession = mutation({
  args: {
    scenarioId: v.id("simulatorScenarios"),
    // Phase 18: optional lesson context — links practice to the lesson
    // the learner came from (advisor/course <-> simulator sync).
    lessonId: v.optional(v.id("lessons")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const access = await getSimulatorAccessDecision(ctx, user);
    if (access.mode === "locked") {
      throw new Error(SIMULATOR_TRIAL_LOCKED_ERROR);
    }

    const activeSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user.clerkId).eq("status", "active"),
      )
      .take(3);
    if (activeSessions.length >= 3) {
      throw new Error(
        "אפשר להפעיל עד שלושה תרגולים במקביל. סיימו תרגול פתוח לפני שמתחילים חדש.",
      );
    }
    const recentSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
      .order("desc")
      .take(SIMULATOR_HOURLY_SESSION_LIMIT);
    if (
      recentSessions.length >= SIMULATOR_HOURLY_SESSION_LIMIT &&
      recentSessions.every(
        (session) => session.createdAt >= Date.now() - 60 * 60 * 1000,
      )
    ) {
      throw new Error(
        `אפשר לפתוח עד ${SIMULATOR_HOURLY_SESSION_LIMIT} תרגולים בשעה. אפשר לחזור בעוד שעה.`,
      );
    }

    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    if (!scenario.published) throw new Error("Scenario is not published");
    if (
      !Number.isInteger(scenario.personaAge) ||
      scenario.personaAge < 18 ||
      scenario.personaAge > 100
    ) {
      throw new Error("Simulator personas must be adults");
    }

    const now = Date.now();

    const sessionId = await ctx.db.insert("simulatorSessions", {
      userId: user.clerkId,
      scenarioId: args.scenarioId,
      lessonId: args.lessonId,
      status: "active",
      messageCount: 0,
      createdAt: now,
    });

    // Add narrator opening message
    await ctx.db.insert("simulatorMessages", {
      sessionId,
      role: "narrator",
      content: scenario.scenarioContext,
      createdAt: now,
    });

    return sessionId;
  },
});

// Internal mutation: save user message and return conversation context for AI
export const saveUserMessage = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    content: v.string(),
    createdAt: v.number(),
    ownerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }
    if (session.status !== "active") throw new Error("Session is not active");
    if (session.messageCount >= SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2 - 1) {
      throw new Error(
        "התרגול הגיע למספר ההודעות המרבי. אפשר לסיים ולקבל משוב.",
      );
    }

    await ctx.db.insert("simulatorMessages", {
      sessionId: args.sessionId,
      role: "user",
      content: args.content,
      createdAt: args.createdAt,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
    });

    // Return only a bounded recent window for the provider context.
    const recentMessages = await ctx.db
      .query("simulatorMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(SIMULATOR_MAX_HISTORY_TURNS + 2);

    return {
      scenario: await ctx.db.get(session.scenarioId),
      messages: recentMessages.reverse(),
    };
  },
});

// Internal mutation (Phase 22): persist the director's emotional-arc state
export const updateDirectorState = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    connection: v.number(),
    turn: v.number(),
    ownerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }
    if (session.status !== "active") throw new Error("Session is not active");
    if (session.messageCount >= SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2) {
      throw new Error(
        "התרגול הגיע למספר ההודעות המרבי. אפשר לסיים ולקבל משוב.",
      );
    }
    const log = (session.connectionLog ?? []).slice(
      -(SIMULATOR_MAX_USER_TURNS_PER_SESSION - 1),
    );
    await ctx.db.patch(args.sessionId, {
      currentConnection: args.connection,
      connectionLog: [...log, { turn: args.turn, connection: args.connection }],
    });
  },
});

// Internal mutation: save AI persona response
export const savePersonaResponse = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    content: v.string(),
    createdAt: v.number(),
    ownerUserId: v.string(),
    accessGrant: v.union(
      v.object({ kind: v.literal("safety") }),
      v.object({ kind: v.literal("full") }),
      v.object({ kind: v.literal("trial"), token: v.string() }),
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }
    if (session.status !== "active") throw new Error("Session is not active");
    if (session.messageCount >= SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2) {
      throw new Error(
        "התרגול הגיע למספר ההודעות המרבי. אפשר לסיים ולקבל משוב.",
      );
    }

    let settledAccess: SimulatorAccessDecision | null = null;
    if (args.accessGrant.kind === "full") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.ownerUserId))
        .unique();
      if (!user) throw new Error("USER_RECORD_REQUIRED");
      const access = await getSimulatorAccessDecision(ctx, user);
      if (!access.hasFullAccess) throw new Error(SIMULATOR_TRIAL_LOCKED_ERROR);
      settledAccess = access;
    } else if (args.accessGrant.kind === "trial") {
      const usage = await ctx.db
        .query("simulatorTrialUsage")
        .withIndex("by_user", (q) => q.eq("userId", args.ownerUserId))
        .unique();
      if (!usage) throw new Error("SIMULATOR_TRIAL_RESERVATION_REQUIRED");
      const settled = settleSimulatorTrialUnit({
        state: {
          consumedUnits: usage.consumedUnits,
          reservations: usage.reservations,
        },
        token: args.accessGrant.token,
        delivered: true,
        now: args.createdAt,
      });
      settledAccess = settled.access;
      await ctx.db.patch(usage._id, {
        consumedUnits: settled.state.consumedUnits,
        reservations: settled.state.reservations,
        updatedAt: args.createdAt,
      });
    }

    await ctx.db.insert("simulatorMessages", {
      sessionId: args.sessionId,
      role: "persona",
      content: args.content,
      createdAt: args.createdAt,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
    });
    return { access: settledAccess };
  },
});

// Internal mutation: save analysis results after session ends
export const saveAnalysis = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    score: v.number(),
    feedback: v.string(),
    strengths: v.array(v.string()),
    improvements: v.array(v.string()),
    completedAt: v.number(),
    ownerUserId: v.string(),
    // Phase 22 — deep debrief (all optional/additive)
    keyMoments: v.optional(
      v.array(
        v.object({
          quote: v.string(),
          analysis: v.string(),
          better: v.string(),
        }),
      ),
    ),
    skillRadar: v.optional(
      v.object({
        initiative: v.number(),
        emotion: v.number(),
        courage: v.number(),
        depth: v.number(),
        leading: v.number(),
      }),
    ),
    drill: v.optional(v.string()),
    recommendedLesson: v.optional(
      v.object({
        lessonId: v.id("lessons"),
        courseId: v.id("courses"),
        title: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }
    if (session.status !== "completed")
      throw new Error("Session is not completed");
    const { sessionId, ownerUserId: _ownerUserId, ...fields } = args;
    void _ownerUserId;
    await ctx.db.patch(sessionId, fields);
  },
});

// Bounded durable guard without adding a counter table: inspect only the newest
// sessions and a capped message window from each one.
export const countRecentUserMessages = internalQuery({
  args: { ownerUserId: v.string(), sinceMs: v.number() },
  handler: async (ctx, args) => {
    const newest = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerUserId))
      .order("desc")
      .take(SIMULATOR_HOURLY_SESSION_LIMIT);
    const active = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.ownerUserId).eq("status", "active"),
      )
      .take(20);
    const sessions = [
      ...new Map([...active, ...newest].map((s) => [s._id, s])).values(),
    ];

    let count = 0;
    for (const session of sessions) {
      const messages = await ctx.db
        .query("simulatorMessages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .order("desc")
        .take(SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2 + 1);
      count += messages.filter(
        (message) =>
          message.createdAt >= args.sinceMs &&
          (message.role === "user" ||
            (message.role === "persona" &&
              message.content === HIGH_RISK_RESPONSE)),
      ).length;
      if (count >= SIMULATOR_HOURLY_USER_MESSAGE_LIMIT) break;
    }
    return count;
  },
});

// Internal query (Phase 22): resolve a lesson by its order in the canonical
// course — used to turn a RAG chunk (lessonOrder) into a deep link.
export const getLessonByOrder = internalQuery({
  args: { lessonOrder: v.number() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), "הדרך - אומנות הקשר"))
      .first();
    if (!course) return null;
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) =>
        q.eq("courseId", course._id).eq("order", args.lessonOrder),
      )
      .first();
    if (!lesson) return null;
    return { lessonId: lesson._id, courseId: course._id, title: lesson.title };
  },
});

// Action: send a user message and get AI persona response
export const sendMessage = action({
  args: {
    sessionId: v.id("simulatorSessions"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<SimulatorSendResult> => {
    const identity = await requireIdentity(ctx);

    // Validate
    const trimmed = args.content.trim();
    if (!trimmed) throw new Error("Message cannot be empty");
    if (trimmed.length > 1000) throw new Error("Message too long");

    const session = await ctx.runQuery(
      internal.simulator.getOwnedSessionForAction,
      {
        sessionId: args.sessionId,
        ownerUserId: identity.subject,
      },
    );
    if (!session) throw new Error("Session not found");
    if (session.status !== "active") throw new Error("Session is not active");
    const access = await ctx.runQuery(
      internal.simulator.getAccessStatusForAction,
      { ownerUserId: identity.subject },
    );

    const recentUserMessages = await ctx.runQuery(
      internal.simulator.countRecentUserMessages,
      {
        ownerUserId: identity.subject,
        sinceMs: Date.now() - 60 * 60 * 1000,
      },
    );
    if (recentUserMessages >= SIMULATOR_HOURLY_USER_MESSAGE_LIMIT) {
      throw new Error(
        `הגעת למגבלת ${SIMULATOR_HOURLY_USER_MESSAGE_LIMIT} הודעות תרגול לשעה. אפשר לחזור בעוד שעה.`,
      );
    }
    if (session.messageCount >= SIMULATOR_MAX_USER_TURNS_PER_SESSION * 2 - 1) {
      throw new Error(
        "התרגול הגיע למספר ההודעות המרבי. אפשר לסיים ולקבל משוב.",
      );
    }

    // Safety routing stays free, but it still shares the existing durable
    // per-user and per-session storage/rate boundaries.
    if (detectHighRisk(trimmed)) {
      await ctx.runMutation(internal.simulator.savePersonaResponse, {
        sessionId: args.sessionId,
        ownerUserId: identity.subject,
        content: HIGH_RISK_RESPONSE,
        createdAt: Date.now(),
        accessGrant: { kind: "safety" },
      });
      return { content: HIGH_RISK_RESPONSE, source: "safety" as const, access };
    }

    const reservationToken = crypto.randomUUID();
    const claim = await ctx.runMutation(internal.simulator.claimTrialUnit, {
      ownerUserId: identity.subject,
      token: reservationToken,
    });
    if (!claim.allowed) throw new Error(SIMULATOR_TRIAL_LOCKED_ERROR);

    try {
      const now = Date.now();

      // Save user message and get updated context
      const context = await ctx.runMutation(
        internal.simulator.saveUserMessage,
        {
          sessionId: args.sessionId,
          content: trimmed,
          createdAt: now,
          ownerUserId: identity.subject,
        },
      );

      if (!context.scenario) throw new Error("Scenario not found");
      if (
        !Number.isInteger(context.scenario.personaAge) ||
        context.scenario.personaAge < 18 ||
        context.scenario.personaAge > 100
      ) {
        throw new Error("Simulator personas must be adults");
      }

      // Build conversation history (exclude narrator messages)
      const conversationHistory = limitSimulatorHistory(
        context.messages
          .filter(
            (m: { role: string; content: string }) => m.role !== "narrator",
          )
          .map((m: { role: string; content: string }) => ({
            role:
              m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: m.content,
          })),
      );

      // --- Director (Phase 22): move the connection meter for this turn ---
      // Deterministic + free. The persona then ACTS the updated state.
      const turn = conversationHistory.filter((m) => m.role === "user").length;
      const prevConnection = session.currentConnection ?? 50;
      const arc = updateConnection(
        prevConnection,
        trimmed,
        context.scenario.triggers ?? [],
      );
      await ctx.runMutation(internal.simulator.updateDirectorState, {
        sessionId: args.sessionId,
        connection: arc.connection,
        turn,
        ownerUserId: identity.subject,
      });
      const directorNote = buildDirectorNote(
        arc.connection,
        turn,
        context.scenario.beats ?? [],
      );

      // Live AI (Gemini free-tier preferred, then Claude) when a provider
      // token is set; otherwise (or on failure) a persona-flavored template.
      const keys = readLlmKeys();
      const aiResponse = hasLlmKey(keys)
        ? await ctx.runAction(internal.aiSimulator.getPersonaResponse, {
            geminiKey: keys.geminiKey,
            anthropicKey: keys.anthropicKey,
            persona: {
              personaName: context.scenario.personaName,
              personaAge: context.scenario.personaAge,
              personaGender: context.scenario.personaGender,
              personaBackground: context.scenario.personaBackground,
              personaPersonality: context.scenario.personaPersonality,
              scenarioContext: context.scenario.scenarioContext,
              difficulty: context.scenario.difficulty,
              personaArchetype: context.scenario.personaArchetype,
              attractionProfile: context.scenario.attractionProfile,
              openers: context.scenario.openers,
              triggers: context.scenario.triggers,
            },
            conversationHistory,
            directorNote,
          })
        : null;

      let personaResponse: string;
      if (aiResponse) {
        personaResponse = aiResponse;
      } else {
        // Free-degradation: persona-flavored, turn-aware fallback that now
        // also reflects the director's connection meter (cool vs warm pools).
        const name = context.scenario.personaName;
        const lastUser = trimmed;
        const askedQuestion = /\?|מה |איך |למה |איפה |מתי |האם /.test(lastUser);
        const wantsToStop =
          /רוצה לעצור|בוא נעצור|בואי נעצור|לא מתאים לי להמשיך|לא רוצה להמשיך/.test(
            lastUser,
          );

        const earlyTurn = [
          `נעים מאוד, אני ${name}. זה תרחיש AI בדיוני; אפשר לבחור נושא שנוח לך ולשנות או לעצור בכל רגע.`,
          `היי, אני ${name}. ${askedQuestion ? "אפשר לענות על זה בקצרה, " : ""}ואפשר גם לבחור נושא אחר לתרגול.`,
        ];
        const warmTurn = [
          `שמעתי את מה שאמרת. ${askedQuestion ? "אענה לפי ההקשר הבדיוני, " : ""}ואפשר להמשיך רק אם מתאים לך.`,
          `תודה על הניסוח הברור. אפשר להישאר בנושא הזה, להחליף נושא או לעצור.`,
          `${askedQuestion ? "זו שאלה שאפשר לתרגל כאן. " : ""}אין צורך לשתף יותר ממה שנוח לך.`,
        ];
        const coolTurn = [
          `אני מעדיפ/ה לא להיכנס לנושא הזה. אפשר לבחור נושא אחר או לסיים כאן.`,
          `לא בטוח/ה שמתאים לי להמשיך בכיוון הזה. אין צורך לשכנע אותי.`,
          `${askedQuestion ? "אני בוחר/ת לא לענות על זה. " : ""}אפשר לכבד את הגבול ולהמשיך רק אם שני הצדדים רוצים.`,
        ];
        if (wantsToStop) {
          personaResponse =
            "ברור, נעצור כאן. אין צורך להסביר או להמשיך את התרגול.";
        } else {
          const pool =
            turn <= 1 ? earlyTurn : arc.connection < 40 ? coolTurn : warmTurn;
          personaResponse =
            pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
        }
        personaResponse = `תגובה אוטומטית בסיסית: ${personaResponse}`;
      }

      // Save persona response
      const settlement = await ctx.runMutation(
        internal.simulator.savePersonaResponse,
        {
          sessionId: args.sessionId,
          content: personaResponse,
          createdAt: Date.now(),
          ownerUserId: identity.subject,
          accessGrant: claim.grant,
        },
      );

      return {
        content: personaResponse,
        source: aiResponse ? ("live" as const) : ("template" as const),
        access: {
          ...(settlement.access ?? claim.access),
        },
      };
    } catch (error) {
      if (claim.grant.kind === "trial") {
        await ctx.runMutation(internal.simulator.releaseTrialUnit, {
          ownerUserId: identity.subject,
          token: claim.grant.token,
        });
      }
      throw error;
    }
  },
});

// Action: end a session and get the coach's deep debrief (Phase 22)
export const endSession = action({
  args: { sessionId: v.id("simulatorSessions") },
  handler: async (
    ctx,
    args,
  ): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> => {
    const identity = await requireIdentity(ctx);

    const session = await ctx.runQuery(
      internal.simulator.getOwnedSessionForAction,
      {
        sessionId: args.sessionId,
        ownerUserId: identity.subject,
      },
    );
    if (!session) throw new Error("Session not found");
    if (session.status !== "active") throw new Error("Session is not active");
    const access = await ctx.runQuery(
      internal.simulator.getAccessStatusForAction,
      { ownerUserId: identity.subject },
    );

    const now = Date.now();

    // Mark as completed first
    await ctx.runMutation(internal.simulator.markCompleted, {
      sessionId: args.sessionId,
      completedAt: now,
      ownerUserId: identity.subject,
    });

    const conversationHistory = limitSimulatorHistory(
      session.messages
        .filter((m: { role: string; content: string }) => m.role !== "narrator")
        .map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
    );

    // If very short session, return minimal analysis
    if (
      conversationHistory.filter((m: { role: string }) => m.role === "user")
        .length < 2
    ) {
      const analysis = {
        score: 50,
        feedback:
          "משוב אוטומטי בסיסי: אין מספיק טקסט למשוב מפורט. עצירה מוקדמת או תשובה קצרה אינן כישלון, והמספר כאן אינו ציון ליכולת זוגית.",
        strengths: ["בחרת את אורך התרגול שמתאים לך"],
        improvements: [
          "אם מתאים לך, אפשר לנסות ניסוח חלופי בתרחיש בדיוני נוסף",
        ],
      };
      await ctx.runMutation(internal.simulator.saveAnalysis, {
        sessionId: args.sessionId,
        ...analysis,
        completedAt: now,
        ownerUserId: identity.subject,
      });
      return analysis;
    }

    const userMessages = session.messages.filter(
      (m: { role: string }) => m.role === "user",
    );

    // Deterministic deep debrief — the free-degradation feedback loop,
    // and the fallback if live-AI analysis is unavailable or unparseable.
    // Always computed: it also fills any field the AI analysis omits.
    const heuristic: DeepDebrief = buildDeepDebrief(userMessages);

    // Trial users receive the clearly labelled local heuristic. Provider-backed
    // debrief and RAG are reserved for admin/trusted-entitlement access.
    const keys = readLlmKeys();
    const aiAnalysis =
      access.hasFullAccess && hasLlmKey(keys)
        ? await ctx.runAction(internal.aiSimulator.analyzeConversation, {
            geminiKey: keys.geminiKey,
            anthropicKey: keys.anthropicKey,
            scenarioTitle: session.scenario?.title ?? "תרחיש",
            difficulty: session.scenario?.difficulty ?? "easy",
            conversationHistory,
          })
        : null;

    const analysis = {
      score: aiAnalysis?.score ?? heuristic.score,
      feedback:
        aiAnalysis?.feedback ?? `משוב אוטומטי בסיסי: ${heuristic.feedback}`,
      strengths: aiAnalysis?.strengths?.length
        ? aiAnalysis.strengths
        : heuristic.strengths,
      improvements: aiAnalysis?.improvements?.length
        ? aiAnalysis.improvements
        : heuristic.improvements,
      keyMoments: aiAnalysis?.keyMoments?.length
        ? aiAnalysis.keyMoments
        : heuristic.keyMoments,
      skillRadar: aiAnalysis?.skillRadar ?? heuristic.skillRadar,
      drill: aiAnalysis?.drill ?? heuristic.drill,
    };

    // RAG bridge (Phase 22): find the ONE course lesson that teaches what
    // the learner missed, and attach it as a deep link. Degrades silently.
    let recommendedLesson:
      | {
          lessonId: import("./_generated/dataModel").Id<"lessons">;
          courseId: import("./_generated/dataModel").Id<"courses">;
          title: string;
        }
      | undefined;
    if (access.hasFullAccess && keys.geminiKey) {
      const gapText = [analysis.drill, ...analysis.improvements].join(" · ");
      const qVec = await embedQuery(keys.geminiKey, gapText);
      if (qVec) {
        const hits = await ctx.vectorSearch("knowledgeChunks", "by_embedding", {
          vector: qVec,
          limit: 4,
          filter: (q) => q.eq("source", "lesson"),
        });
        const best = hits.find((h) => h._score >= MIN_SCORE);
        if (best) {
          const chunks = await ctx.runQuery(internal.knowledge.getChunksByIds, {
            ids: [best._id],
          });
          const order = chunks[0]?.lessonOrder;
          if (typeof order === "number") {
            const lesson = await ctx.runQuery(
              internal.simulator.getLessonByOrder,
              { lessonOrder: order },
            );
            if (lesson) recommendedLesson = lesson;
          }
        }
      }
    }

    await ctx.runMutation(internal.simulator.saveAnalysis, {
      sessionId: args.sessionId,
      score: analysis.score,
      feedback: analysis.feedback,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      keyMoments: analysis.keyMoments,
      skillRadar: analysis.skillRadar,
      drill: analysis.drill,
      ...(recommendedLesson ? { recommendedLesson } : {}),
      completedAt: now,
      ownerUserId: identity.subject,
    });

    return {
      score: analysis.score,
      feedback: analysis.feedback,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
    };
  },
});

// ==========================================
// Structured Dialogue Simulator (Phase 68)
// ==========================================

// Legacy choice-and-grade scenarios still contain unreviewed normative and
// coercive feedback. Keep every read/write path fail-closed until the scenario
// contract, copy and historical data have passed the same consent review as the
// free-chat simulator. This is deliberately not controlled by environment data.
const STRUCTURED_DIALOGUE_AVAILABLE: boolean = false;

function requireStructuredDialogueAvailable(): void {
  if (!STRUCTURED_DIALOGUE_AVAILABLE) {
    throw new Error("Structured dialogue simulator is unavailable");
  }
}

// List all published dialogue scenarios
export const listDialogueScenarios = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return [];
    const scenarios = await ctx.db
      .query("dialogueScenarios")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    return scenarios.sort((a, b) => a.order - b.order);
  },
});

// Get a single dialogue scenario with full data
export const getDialogueScenario = query({
  args: { scenarioId: v.id("dialogueScenarios") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return null;
    const scenario = await ctx.db.get(args.scenarioId);
    return scenario?.published ? scenario : null;
  },
});

// Start a structured dialogue simulation
export const startSimulation = mutation({
  args: {
    scenarioId: v.id("dialogueScenarios"),
    // Phase 19: optional lesson context — links practice to the lesson the
    // learner came from (symmetric with the free-chat simulator).
    lessonId: v.optional(v.id("lessons")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    requireStructuredDialogueAvailable();

    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    if (!scenario.published) throw new Error("Scenario is not published");

    const sessionId = await ctx.db.insert("dialogueSessions", {
      userId: user.clerkId,
      scenarioId: args.scenarioId,
      lessonId: args.lessonId,
      status: "active",
      currentStep: 0,
      choices: [],
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

// Phase 19: how many practice sessions this user ran from a given lesson
// (free-chat simulator only while the structured legacy path is contained).
// on the lesson's Smart Advisor to close the lesson <-> simulator loop.
export const getLessonPracticeStats = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const chatSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const chatForLesson = chatSessions.filter(
      (s) => s.lessonId === args.lessonId,
    );

    return {
      total: chatForLesson.length,
      completed: chatForLesson.filter((s) => s.status === "completed").length,
      bestScore: null,
    };
  },
});

// Get an active dialogue session
export const getDialogueSession = query({
  args: { sessionId: v.id("dialogueSessions") },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return null;
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    await requireOwnedClerkResource(ctx, session.userId);
    const scenario = await ctx.db.get(session.scenarioId);
    return { ...session, scenario };
  },
});

// Submit a choice at a dialogue point
export const submitChoice = mutation({
  args: {
    sessionId: v.id("dialogueSessions"),
    stepId: v.string(),
    choiceIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    requireStructuredDialogueAvailable();

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) throw new Error("Not authorized");
    if (session.status !== "active") throw new Error("Session is not active");

    const scenario = await ctx.db.get(session.scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    const dialoguePoint = scenario.dialoguePoints.find(
      (dp) => dp.id === args.stepId,
    );
    if (!dialoguePoint) throw new Error("Dialogue point not found");

    const option = dialoguePoint.options[args.choiceIndex];
    if (!option) throw new Error("Invalid choice index");

    const newChoice = {
      stepId: args.stepId,
      choiceIndex: args.choiceIndex,
      score: option.score,
      feedback: option.feedback,
    };

    const updatedChoices = [...session.choices, newChoice];
    const nextStep = session.currentStep + 1;

    await ctx.db.patch(args.sessionId, {
      choices: updatedChoices,
      currentStep: nextStep,
    });

    return {
      score: option.score,
      feedback: option.feedback,
      tip: dialoguePoint.tip,
      isLast: nextStep >= scenario.dialoguePoints.length,
    };
  },
});

// Complete simulation and calculate final score
export const completeSimulation = mutation({
  args: { sessionId: v.id("dialogueSessions") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    requireStructuredDialogueAvailable();

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) throw new Error("Not authorized");
    if (session.status !== "active") throw new Error("Session is not active");

    const scenario = await ctx.db.get(session.scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    // Each option max score is 3, so max per step = 3
    const maxPossibleScore = scenario.dialoguePoints.length * 3;
    const totalRawScore = session.choices.reduce((sum, c) => sum + c.score, 0);
    const totalScore = Math.round((totalRawScore / maxPossibleScore) * 100);

    let grade: string;
    let summaryFeedback: string;

    if (totalScore >= 90) {
      grade = "A+";
      summaryFeedback =
        "ביצועים מעולים! אתה מדגים הבנה עמוקה של תקשורת בינאישית ויצירת קשר. המשך כך!";
    } else if (totalScore >= 80) {
      grade = "A";
      summaryFeedback =
        "מצוין! הצלחת לנהל את השיחה בצורה טובה מאוד. יש מקום קטן לשיפור בכמה נקודות.";
    } else if (totalScore >= 70) {
      grade = "B";
      summaryFeedback =
        "טוב מאוד! הראית הבנה טובה של הדינמיקה הבינאישית. עוד קצת תרגול ותגיע לשלמות.";
    } else if (totalScore >= 60) {
      grade = "C";
      summaryFeedback =
        "לא רע! יש לך בסיס טוב. שים לב לרגעים שבהם כדאי להקשיב יותר ולדבר פחות.";
    } else if (totalScore >= 50) {
      grade = "D";
      summaryFeedback =
        "אתה בדרך הנכונה, אבל יש מה לשפר. נסה לשים לב יותר לצרכי הצד השני.";
    } else {
      grade = "F";
      summaryFeedback =
        "יש מקום לשיפור משמעותי. נסה שוב עם תשומת לב לרגשות ולצרכים של הצד השני.";
    }

    await ctx.db.patch(args.sessionId, {
      status: "completed",
      totalScore,
      maxPossibleScore,
      grade,
      summaryFeedback,
      completedAt: Date.now(),
    });

    return { totalScore, maxPossibleScore, grade, summaryFeedback };
  },
});

// Get user's dialogue simulation history
export const getSimulationHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return [];

    const sessions = await ctx.db
      .query("dialogueSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const sorted = sessions.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      sorted.map(async (session) => {
        const scenario = await ctx.db.get(session.scenarioId);
        return {
          ...session,
          scenarioTitle: scenario?.title ?? "תרחיש לא נמצא",
          scenarioDifficulty: scenario?.difficulty ?? "easy",
          personaName: scenario?.personaName ?? "",
          personaEmoji: scenario?.personaEmoji ?? "👤",
        };
      }),
    );
  },
});

// Get best score per scenario for a user (for leaderboard display on scenario cards)
export const getUserBestScores = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return {};

    const sessions = await ctx.db
      .query("dialogueSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const bestScores: Record<string, number> = {};
    for (const session of sessions) {
      if (session.status === "completed" && session.totalScore !== undefined) {
        const scenarioId = session.scenarioId;
        const existing = bestScores[scenarioId];
        if (existing === undefined || session.totalScore > existing) {
          bestScores[scenarioId] = session.totalScore;
        }
      }
    }

    return bestScores;
  },
});

// Get leaderboard for a scenario
export const getLeaderboard = query({
  args: { scenarioId: v.id("dialogueScenarios") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    if (!STRUCTURED_DIALOGUE_AVAILABLE) return [];
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario?.published) return [];
    const sessions = await ctx.db
      .query("dialogueSessions")
      .withIndex("by_scenario", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();

    const completed = sessions.filter(
      (s) => s.status === "completed" && s.totalScore !== undefined,
    );

    // Get best score per user
    const bestPerUser: Record<string, { userId: string; score: number }> = {};
    for (const session of completed) {
      const existing = bestPerUser[session.userId];
      if (!existing || (session.totalScore ?? 0) > existing.score) {
        bestPerUser[session.userId] = {
          userId: session.userId,
          score: session.totalScore ?? 0,
        };
      }
    }

    return Object.values(bestPerUser)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({
        rank: index + 1,
        score: entry.score,
      }));
  },
});

// Internal mutation: mark session as completed
export const markCompleted = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    completedAt: v.number(),
    ownerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }
    if (session.status !== "active") throw new Error("Session is not active");
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: args.completedAt,
    });
  },
});
