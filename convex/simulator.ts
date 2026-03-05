import { query, mutation, internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

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
  args: { scenarioId: v.id("simulatorScenarios") },
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      score: args.score,
      feedback: args.feedback,
      strengths: args.strengths,
      improvements: args.improvements,
      completedAt: args.completedAt,
    });
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let personaResponse: string;

    if (!apiKey) {
      // Fallback without AI
      const fallbacks = [
        "אה, זה מעניין מה שאמרת... ספר/י לי יותר.",
        "כן, אני מבין/ה. ומה עוד?",
        "זה נשמע מעניין. רוצה לשמוע עוד על זה.",
        "אממ, נחמד. ספר/י לי על עצמך.",
      ];
      personaResponse =
        fallbacks[Math.floor(Math.random() * fallbacks.length)] ??
        fallbacks[0];
    } else {
      personaResponse = await ctx.runAction(
        internal.aiSimulator.getPersonaResponse,
        {
          apiKey,
          persona: {
            personaName: context.scenario.personaName,
            personaAge: context.scenario.personaAge,
            personaGender: context.scenario.personaGender,
            personaBackground: context.scenario.personaBackground,
            personaPersonality: context.scenario.personaPersonality,
            scenarioContext: context.scenario.scenarioContext,
            difficulty: context.scenario.difficulty,
          },
          conversationHistory,
        }
      );
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

// Action: end a session and get AI analysis
export const endSession = action({
  args: { sessionId: v.id("simulatorSessions") },
  handler: async (ctx, args): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> => {
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

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const analysis = {
        score: 65,
        feedback: "סיימת את הסימולציה. המשך להתאמן כדי לשפר את הכישורים שלך.",
        strengths: ["השלמת את הסימולציה", "ניסית לנהל שיחה"],
        improvements: [
          "שאל/י יותר שאלות פתוחות",
          "הראה/י עניין אישי",
          "שמור/י על שיחה זורמת",
        ],
      };
      await ctx.runMutation(internal.simulator.saveAnalysis, {
        sessionId: args.sessionId,
        ...analysis,
        completedAt: now,
      });
      return analysis;
    }

    const analysis: { score: number; feedback: string; strengths: string[]; improvements: string[] } = await ctx.runAction(
      internal.aiSimulator.analyzeConversation,
      {
        apiKey,
        scenarioTitle: session.scenario?.title ?? "תרחיש",
        difficulty: session.scenario?.difficulty ?? "easy",
        conversationHistory,
      }
    );

    await ctx.runMutation(internal.simulator.saveAnalysis, {
      sessionId: args.sessionId,
      score: analysis.score,
      feedback: analysis.feedback,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      completedAt: now,
    });

    return analysis;
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
  args: { scenarioId: v.id("dialogueScenarios") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    if (!scenario.published) throw new Error("Scenario is not published");

    const sessionId = await ctx.db.insert("dialogueSessions", {
      userId: identity.subject,
      scenarioId: args.scenarioId,
      status: "active",
      currentStep: 0,
      choices: [],
      createdAt: Date.now(),
    });

    return sessionId;
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
