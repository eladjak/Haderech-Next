import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { readLlmKeys, hasLlmKey } from "./lib/llm";
import { buildDeepDebrief, type DeepDebrief } from "./lib/simulatorScoring";
import { updateConnection, buildDirectorNote } from "./lib/director";
import { embedQuery, MIN_SCORE } from "./lib/retrieval";

// ==========================================
// Simulator - Phase 17
// Dating simulation with AI personas
// ==========================================

// List all published scenarios
export const listScenarios = query({
  args: {},
  handler: async (ctx) => {
    const scenarios = await ctx.db
      .query("simulatorScenarios")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    return scenarios.sort((a, b) => a.order - b.order);
  },
});

// Get single scenario by ID
export const getScenario = query({
  args: { scenarioId: v.id("simulatorScenarios") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scenarioId);
  },
});

// Get session with all its messages
export const getSession = query({
  args: { sessionId: v.id("simulatorSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

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

// List all sessions for the current user
export const listUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

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
      })
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    if (!scenario.published) throw new Error("Scenario is not published");

    const now = Date.now();

    const sessionId = await ctx.db.insert("simulatorSessions", {
      userId: identity.subject,
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
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.insert("simulatorMessages", {
      sessionId: args.sessionId,
      role: "user",
      content: args.content,
      createdAt: args.createdAt,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
    });

    // Return all messages for conversation history
    const allMessages = await ctx.db
      .query("simulatorMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const sorted = allMessages.sort((a, b) => a.createdAt - b.createdAt);

    return {
      scenario: await ctx.db.get(session.scenarioId),
      messages: sorted,
    };
  },
});

// Internal mutation (Phase 22): persist the director's emotional-arc state
export const updateDirectorState = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    connection: v.number(),
    turn: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    const log = session.connectionLog ?? [];
    await ctx.db.patch(args.sessionId, {
      currentConnection: args.connection,
      connectionLog: [
        ...log,
        { turn: args.turn, connection: args.connection },
      ],
    });
  },
});

// Internal mutation: save AI persona response
export const savePersonaResponse = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    content: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.insert("simulatorMessages", {
      sessionId: args.sessionId,
      role: "persona",
      content: args.content,
      createdAt: args.createdAt,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
    });
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
    // Phase 22 — deep debrief (all optional/additive)
    keyMoments: v.optional(
      v.array(
        v.object({
          quote: v.string(),
          analysis: v.string(),
          better: v.string(),
        })
      )
    ),
    skillRadar: v.optional(
      v.object({
        initiative: v.number(),
        emotion: v.number(),
        courage: v.number(),
        depth: v.number(),
        leading: v.number(),
      })
    ),
    drill: v.optional(v.string()),
    recommendedLesson: v.optional(
      v.object({
        lessonId: v.id("lessons"),
        courseId: v.id("courses"),
        title: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...fields } = args;
    await ctx.db.patch(sessionId, fields);
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
        q.eq("courseId", course._id).eq("order", args.lessonOrder)
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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate
    const trimmed = args.content.trim();
    if (!trimmed) throw new Error("Message cannot be empty");
    if (trimmed.length > 1000) throw new Error("Message too long");

    const session = await ctx.runQuery(api.simulator.getSession, {
      sessionId: args.sessionId,
    });
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) throw new Error("Not authorized");
    if (session.status !== "active") throw new Error("Session is not active");

    const now = Date.now();

    // Save user message and get updated context
    const context = await ctx.runMutation(
      internal.simulator.saveUserMessage,
      {
        sessionId: args.sessionId,
        content: trimmed,
        createdAt: now,
      }
    );

    if (!context.scenario) throw new Error("Scenario not found");

    // Build conversation history (exclude narrator messages)
    const conversationHistory = context.messages
      .filter((m: { role: string; content: string }) => m.role !== "narrator")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    // --- Director (Phase 22): move the connection meter for this turn ---
    // Deterministic + free. The persona then ACTS the updated state.
    const turn = conversationHistory.filter((m) => m.role === "user").length;
    const prevConnection = session.currentConnection ?? 50;
    const arc = updateConnection(
      prevConnection,
      trimmed,
      context.scenario.triggers ?? []
    );
    await ctx.runMutation(internal.simulator.updateDirectorState, {
      sessionId: args.sessionId,
      connection: arc.connection,
      turn,
    });
    const directorNote = buildDirectorNote(
      arc.connection,
      turn,
      context.scenario.beats ?? []
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
      const opensWell = lastUser.length > 25;

      const earlyTurn = [
        `נעים מאוד, אני ${name}. אהבתי שפתחת ככה — ספר/י לי קצת עליך, מה מביא אותך לכאן?`,
        `היי! ${askedQuestion ? "שאלה טובה, " : ""}אני ${name}. אני סקרן/ית לשמוע עוד — מה התחביבים שלך?`,
      ];
      const warmTurn = [
        `מעניין מה שאמרת. ${askedQuestion ? "ואצלך? " : "ומה גרם לך להתעניין בזה?"}`,
        `אהבתי את הכנות. ${opensWell ? "אתה/את נשמע/ת אמיתי/ת." : "ספר/י לי עוד, אני מקשיב/ה."}`,
        `${askedQuestion ? "כן, לגמרי — " : ""}זה אומר עליך משהו טוב. מה הכי חשוב לך בקשר?`,
      ];
      const coolTurn = [
        `המ... אוקיי. ${askedQuestion ? "כן." : ""} [${name} מציצה לרגע בטלפון]`,
        `יכול להיות. תקשיב/י, אני קצת עייפ/ה היום... על מה עוד רצית לדבר?`,
        `${askedQuestion ? "לא יודע/ת, לא חשבתי על זה. " : ""}נו, ספר/י אתה משהו.`,
      ];
      const pool =
        turn <= 1 ? earlyTurn : arc.connection < 40 ? coolTurn : warmTurn;
      personaResponse = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
    }

    // Save persona response
    await ctx.runMutation(internal.simulator.savePersonaResponse, {
      sessionId: args.sessionId,
      content: personaResponse,
      createdAt: Date.now(),
    });

    return personaResponse;
  },
});

// Action: end a session and get the coach's deep debrief (Phase 22)
export const endSession = action({
  args: { sessionId: v.id("simulatorSessions") },
  handler: async (
    ctx,
    args
  ): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.runQuery(api.simulator.getSession, {
      sessionId: args.sessionId,
    });
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) throw new Error("Not authorized");
    if (session.status !== "active") throw new Error("Session is not active");

    const now = Date.now();

    // Mark as completed first
    await ctx.runMutation(internal.simulator.markCompleted, {
      sessionId: args.sessionId,
      completedAt: now,
    });

    const conversationHistory = session.messages
      .filter((m: { role: string; content: string }) => m.role !== "narrator")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    // If very short session, return minimal analysis
    if (conversationHistory.filter((m: { role: string }) => m.role === "user").length < 2) {
      const analysis = {
        score: 30,
        feedback: "השיחה הייתה קצרה מדי לניתוח מלא. נסה/י לנהל שיחה ארוכה יותר.",
        strengths: ["התחלת את הסימולציה"],
        improvements: [
          "שאל/י יותר שאלות",
          "נהל/י שיחה ארוכה יותר",
          "הראה/י עניין בפרסונה",
        ],
      };
      await ctx.runMutation(internal.simulator.saveAnalysis, {
        sessionId: args.sessionId,
        ...analysis,
        completedAt: now,
      });
      return analysis;
    }

    const userMessages = session.messages.filter(
      (m: { role: string }) => m.role === "user"
    );

    // Deterministic deep debrief — the free-degradation feedback loop,
    // and the fallback if live-AI analysis is unavailable or unparseable.
    // Always computed: it also fills any field the AI analysis omits.
    const heuristic: DeepDebrief = buildDeepDebrief(userMessages);

    // Live coach analysis when a provider (Gemini free / Claude) is set.
    const keys = readLlmKeys();
    const aiAnalysis = hasLlmKey(keys)
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
      feedback: aiAnalysis?.feedback ?? heuristic.feedback,
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
      | { lessonId: import("./_generated/dataModel").Id<"lessons">; courseId: import("./_generated/dataModel").Id<"courses">; title: string }
      | undefined;
    if (keys.geminiKey) {
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
              { lessonOrder: order }
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

// List all published dialogue scenarios
export const listDialogueScenarios = query({
  args: {},
  handler: async (ctx) => {
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
    return await ctx.db.get(args.scenarioId);
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    if (!scenario.published) throw new Error("Scenario is not published");

    const sessionId = await ctx.db.insert("dialogueSessions", {
      userId: identity.subject,
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
// (both simulator types), and the best structured-dialogue score. Surfaced
// on the lesson's Smart Advisor to close the lesson <-> simulator loop.
export const getLessonPracticeStats = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { total: 0, completed: 0, bestScore: null as number | null };
    }

    const chatSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const dialogueSessions = await ctx.db
      .query("dialogueSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const chatForLesson = chatSessions.filter(
      (s) => s.lessonId === args.lessonId
    );
    const dialogueForLesson = dialogueSessions.filter(
      (s) => s.lessonId === args.lessonId
    );

    const total = chatForLesson.length + dialogueForLesson.length;
    const completed =
      chatForLesson.filter((s) => s.status === "completed").length +
      dialogueForLesson.filter((s) => s.status === "completed").length;

    const scores: number[] = [
      ...chatForLesson
        .map((s) => s.score)
        .filter((n): n is number => typeof n === "number"),
      ...dialogueForLesson
        .map((s) => s.totalScore)
        .filter((n): n is number => typeof n === "number"),
    ];
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    return { total, completed, bestScore };
  },
});

// Get an active dialogue session
export const getDialogueSession = query({
  args: { sessionId: v.id("dialogueSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) throw new Error("Not authorized");
    if (session.status !== "active") throw new Error("Session is not active");

    const scenario = await ctx.db.get(session.scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    const dialoguePoint = scenario.dialoguePoints.find(
      (dp) => dp.id === args.stepId
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

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
      })
    );
  },
});

// Get best score per scenario for a user (for leaderboard display on scenario cards)
export const getUserBestScores = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

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
    const sessions = await ctx.db
      .query("dialogueSessions")
      .withIndex("by_scenario", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();

    const completed = sessions.filter(
      (s) => s.status === "completed" && s.totalScore !== undefined
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
        userId: entry.userId,
      }));
  },
});

// Internal mutation: mark session as completed
export const markCompleted = internalMutation({
  args: {
    sessionId: v.id("simulatorSessions"),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: args.completedAt,
    });
  },
});
