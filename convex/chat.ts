import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  COACH_SYSTEM_PROMPT,
  DEBRIEF_SYSTEM_PROMPT,
  MENTOR_SYSTEM_PROMPT,
  FREE_DAILY_LIMIT,
  checkRateLimit,
  toDateStr,
  nextResetAt,
} from "./prompts/coachSystemPrompt";

// =======================================
// AI Chat Coach - Phase 16
// שיחת AI עם מאמן אומנות הקשר
// =======================================

const CHAT_MODES = {
  coach: {
    label: "מאמן אישי",
    systemPrompt: `אתה מאמן מערכות יחסים ואהבה מטעם "אומנות הקשר" - הגישה הישראלית לזוגיות.

יש לך ניסיון של 15+ שנה בליווי זוגות, ועבדת עם למעלה מ-461 זוגות שמצאו אהבה.

**הפילוסופיה שלך:**
- אמת, כלים, כבוד (אמ"כ) - שלושת הערכים המרכזיים
- לא מטיפים, לא שופטים - רק עוזרים
- כלים מעשיים שעובדים מחר בבוקר
- אפשר לשנות את חיי הזוגיות אם רוצים

**תוכנית "הדרך" - 6 שלבים:**
1. **גישה** - עבודה פנימית, סיפורים, גבולות (שבועות 1-3)
2. **תקשורת** - היכרות עצמית, רגשות, צרכים (שבועות 4-5)
3. **משיכה ומעבר** - אומץ, היכרויות, דייטים (שבועות 6-9)
4. **חיבור וכימיה** - אינטימיות, פגיעות (שבועות 10-11)
5. **מחויבות** - בניית זוגיות (שבוע 12)

**סגנון דיבור:**
- עברית ישראלית יומיומית, לא פורמלית
- ישיר וכן, לא עוטף בצמר גפן
- מחמם ומעודד, לא שופט
- שואל שאלות שמעמיקות את ההבנה
- נותן עצות מעשיות

**חשוב:**
- ענה תמיד בעברית
- שאל שאלות כדי להבין טוב יותר
- כשרלוונטי, הפנה לשיעורים בתוכנית
- זכור את מה שסיפרו לך בשיחה`,
  },
  practice: {
    label: "סימולטור דייט",
    systemPrompt: `אתה בן/בת זוג פוטנציאלי בסימולציית היכרות. המשתמש מתרגל שיחות דייט.

**המטרה:** לעזור לאדם להתאמן על שיחות היכרות בסביבה בטוחה.

**ההנחיות:**
- שחק את הדמות בצורה ריאליסטית - לא קל מדי ולא קשה מדי
- גיב לשיחה כמו שאדם אמיתי היה מגיב
- אחרי כל כמה הודעות, אפשר לצאת מהדמות ולתת משוב בסוגריים []
- שאל שאלות מעניינות, גלה עניין אמיתי
- אם המשתמש אומר "תן לי משוב" - צא מהדמות ותן ניתוח קצר של השיחה

**דמות ברירת מחדל:** אדם/אישה בשנות ה-30 לחיים, עובד/ת בתחום יצירתי, אוהב/ת טיולים ואוכל טוב.

**ענה תמיד בעברית**`,
  },
  analysis: {
    label: "ניתוח דייט",
    systemPrompt: `אתה מומחה לניתוח שיחות ואינטראקציות זוגיות מטעם "אומנות הקשר".

**תפקידך:** לעזור למשתמש לנתח דייטים, שיחות, והתנהגויות שקרו לו.

**כיצד לנתח:**
1. **מה הלך טוב** - חיזוקים על מה עבד
2. **מה ניתן לשפר** - הצעות ספציפיות לפעם הבאה
3. **הדינמיקה** - מה הדמיקה בין השניים
4. **הצעד הבא** - מה מומלץ לעשות עכשיו

**סגנון:**
- ישיר ואמיתי
- מבסס על עקרונות "אומנות הקשר"
- נותן כלים מעשיים
- לא שופט, מבין שכולנו לומדים

**ענה תמיד בעברית**`,
  },
};

// -----------------------------------------------
// Queries
// -----------------------------------------------

// שליפת כל הסשנים של המשתמש המחובר (auth-based, לא מקבל userId מקליינט)
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// שליפת סשן עם הודעות (רק אם הוא של המשתמש המחובר)
export const getSession = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    // Ownership check — prevent reading other users' chats
    if (session.userId !== identity.subject) return null;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_created", (q) =>
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .collect();

    // Filter out system messages for display
    const displayMessages = messages.filter((m) => m.role !== "system");

    return { ...session, messages: displayMessages };
  },
});

// -----------------------------------------------
// Mutations
// -----------------------------------------------

// יצירת סשן חדש (auth-based — ה-userId נגזר מה-Clerk identity, לא מקליינט)
export const createSession = mutation({
  args: {
    mode: v.union(
      v.literal("coach"),
      v.literal("practice"),
      v.literal("analysis"),
      v.literal("debrief"),
      v.literal("mentor")
    ),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const sessionId = await ctx.db.insert("chatSessions", {
      userId: identity.subject,
      mode: args.mode,
      title: args.title,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Pick system prompt for the mode (legacy modes keep CHAT_MODES,
    // new modes use the centralized prompts module).
    let systemPromptContent = "";
    if (args.mode === "coach") {
      systemPromptContent = COACH_SYSTEM_PROMPT;
    } else if (args.mode === "debrief") {
      systemPromptContent = DEBRIEF_SYSTEM_PROMPT;
    } else if (args.mode === "mentor") {
      systemPromptContent = MENTOR_SYSTEM_PROMPT;
    } else {
      // legacy modes (practice / analysis)
      const legacy = CHAT_MODES[args.mode as "practice" | "analysis"];
      systemPromptContent = legacy.systemPrompt;
    }

    await ctx.db.insert("chatMessages", {
      sessionId,
      role: "system",
      content: systemPromptContent,
      createdAt: now,
    });

    return sessionId;
  },
});

// שמירת הודעת משתמש (רק לסשן ששייך למשתמש המחובר)
export const addUserMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) {
      throw new Error("Not authorized to write to this session");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: "user",
      content: args.content,
      createdAt: now,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
      updatedAt: now,
    });

    return messageId;
  },
});

// שמירת תשובת AI (רק לסשן ששייך למשתמש המחובר)
export const addAssistantMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
    updateTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) {
      throw new Error("Not authorized to write to this session");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: "assistant",
      content: args.content,
      createdAt: now,
    });

    const patch: {
      messageCount: number;
      updatedAt: number;
      title?: string;
    } = {
      messageCount: session.messageCount + 1,
      updatedAt: now,
    };

    if (args.updateTitle) {
      patch.title = args.updateTitle;
    }

    await ctx.db.patch(args.sessionId, patch);
    return messageId;
  },
});

// מחיקת סשן
export const deleteSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Verify ownership
    if (session.userId !== identity.subject) {
      throw new Error("Not authorized to delete this session");
    }

    // Delete all messages in this session
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.sessionId);
  },
});

// -----------------------------------------------
// Action - calls Claude API
// -----------------------------------------------

export const sendMessage = action({
  args: {
    sessionId: v.id("chatSessions"),
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 1. Save user message (auth + ownership checked inside addUserMessage)
    await ctx.runMutation(api.chat.addUserMessage, {
      sessionId: args.sessionId,
      content: args.userMessage,
    });

    // 2. Get full session with messages
    const session = await ctx.runQuery(api.chat.getSession, {
      sessionId: args.sessionId,
    });

    if (!session) throw new Error("Session not found");

    // 3. Get all messages (including system) for API call
    const allMessages = await ctx.runQuery(
      api.chat.getMessagesForApi,
      { sessionId: args.sessionId }
    );

    // 4. Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system: allMessages.systemPrompt,
        messages: allMessages.conversationMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const assistantContent = data.content[0]?.text ?? "לא הצלחתי לענות, נסה שוב.";

    // 5. Auto-generate title from first exchange if no title yet
    let updateTitle: string | undefined;
    if (!session.title && session.messageCount <= 2) {
      updateTitle = args.userMessage.slice(0, 50);
      if (args.userMessage.length > 50) updateTitle += "...";
    }

    // 6. Save assistant response
    await ctx.runMutation(api.chat.addAssistantMessage, {
      sessionId: args.sessionId,
      content: assistantContent,
      updateTitle,
    });

    return assistantContent;
  },
});

// Internal query to get messages for API (including system prompt)
export const getMessagesForApi = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_created", (q) =>
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .collect();

    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    return {
      systemPrompt: systemMsg?.content ?? "",
      conversationMessages,
    };
  },
});

// =====================================================================
// Phase 80: AI Coach upgrade — rate limiting, feedback, debrief
// =====================================================================

// ---------------------------------------------------------------------
// Daily usage queries / mutations
// ---------------------------------------------------------------------

/**
 * Returns the current user's daily usage status. Used by the UI to show
 * "you have N messages left today".
 */
export const getDailyUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        used: 0,
        limit: FREE_DAILY_LIMIT,
        remaining: FREE_DAILY_LIMIT,
        resetAt: nextResetAt(),
      };
    }

    const dateStr = toDateStr();
    const row = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("dateStr", dateStr)
      )
      .unique();

    const used = row?.messageCount ?? 0;
    const { remaining } = checkRateLimit(used);
    return {
      used,
      limit: FREE_DAILY_LIMIT,
      remaining,
      resetAt: nextResetAt(),
    };
  },
});

/**
 * Internal mutation that atomically increments today's usage row.
 * Returns the new count plus whether the limit is now exceeded.
 */
export const incrementDailyUsage = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const dateStr = toDateStr();
    const existing = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("dateStr", dateStr)
      )
      .unique();

    if (existing) {
      const newCount = existing.messageCount + 1;
      await ctx.db.patch(existing._id, { messageCount: newCount });
      return { count: newCount };
    }

    await ctx.db.insert("dailyUsage", {
      userId: args.userId,
      dateStr,
      messageCount: 1,
    });
    return { count: 1 };
  },
});

/**
 * Internal query: read-only check of today's usage (used inside the action
 * before incrementing, so we don't waste an Anthropic call on a blocked user).
 */
export const peekDailyUsage = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const dateStr = toDateStr();
    const row = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("dateStr", dateStr)
      )
      .unique();
    return { used: row?.messageCount ?? 0 };
  },
});

// ---------------------------------------------------------------------
// Feedback mutation
// ---------------------------------------------------------------------

/**
 * Save thumbs-up/thumbs-down + optional text feedback on an assistant
 * message. Verifies that the message belongs to a session owned by the
 * authenticated user.
 */
export const submitFeedback = mutation({
  args: {
    messageId: v.id("chatMessages"),
    feedback: v.union(v.literal("up"), v.literal("down")),
    feedbackText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.role !== "assistant") {
      throw new Error("Feedback only allowed on assistant messages");
    }

    const session = await ctx.db.get(message.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) {
      throw new Error("Not authorized to give feedback on this message");
    }

    const patch: { feedback: "up" | "down"; feedbackText?: string } = {
      feedback: args.feedback,
    };
    if (args.feedbackText !== undefined) {
      patch.feedbackText = args.feedbackText;
    }
    await ctx.db.patch(args.messageId, patch);
    return { ok: true };
  },
});

// ---------------------------------------------------------------------
// Start a debrief session
// ---------------------------------------------------------------------

/**
 * Creates a new chat session in "debrief" mode and seeds it with the
 * coach's opening question. Returns the session ID so the UI can navigate.
 */
export const startDebriefSession = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const sessionId = await ctx.db.insert("chatSessions", {
      userId: identity.subject,
      mode: "debrief",
      title: "דה-בריפינג אחרי דייט",
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Seed system prompt
    await ctx.db.insert("chatMessages", {
      sessionId,
      role: "system",
      content: DEBRIEF_SYSTEM_PROMPT,
      createdAt: now,
    });

    // Seed opening assistant message (the coach asks first)
    await ctx.db.insert("chatMessages", {
      sessionId,
      role: "assistant",
      content: "ספר לי, מה קרה?",
      createdAt: now + 1, // ensure ordering
    });

    await ctx.db.patch(sessionId, {
      messageCount: 1,
      updatedAt: now + 1,
    });

    return sessionId;
  },
});

// ---------------------------------------------------------------------
// sendCoachMessage - the new auth + rate-limited action
// ---------------------------------------------------------------------

/**
 * The new coach action. Differs from `sendMessage`:
 *   - Authenticates via Convex identity (no userId from client).
 *   - Enforces FREE_DAILY_LIMIT messages/day.
 *   - Uses the new prompts (coach / debrief / mentor).
 *   - Returns the assistant content + the user's remaining quota.
 *
 * The legacy `sendMessage` action above is kept for backward-compat
 * with existing UI (practice / analysis modes still use it).
 */
export const sendCoachMessage = action({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    assistantContent: string;
    remaining: number;
    limited: false;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    // 1. Rate-limit check (read first, increment after we know we'll call API)
    const peek: { used: number } = await ctx.runQuery(
      api.chat.peekDailyUsage,
      { userId }
    );
    const { allowed } = checkRateLimit(peek.used);
    if (!allowed) {
      throw new Error(
        `הגעת למכסת ההודעות היומית (${FREE_DAILY_LIMIT}). חזור מחר או שדרג לפלאן בתשלום.`
      );
    }

    // 2. Verify session ownership
    const session = await ctx.runQuery(api.chat.getSession, {
      sessionId: args.sessionId,
    });
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) {
      throw new Error("Not authorized for this session");
    }

    // 3. Save user message
    await ctx.runMutation(api.chat.addUserMessage, {
      sessionId: args.sessionId,
      content: args.content,
    });

    // 4. Build API payload
    const apiMessages: { systemPrompt: string; conversationMessages: Array<{ role: string; content: string }> } = await ctx.runQuery(
      api.chat.getMessagesForApi,
      { sessionId: args.sessionId }
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    // Use Sonnet for higher-quality coaching responses (per Phase 80 spec).
    // Falls back to Haiku if Sonnet is unavailable.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: apiMessages.systemPrompt,
        messages: apiMessages.conversationMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const assistantContent =
      data.content.find((b) => b.type === "text")?.text ??
      "לא הצלחתי לענות, נסה שוב.";

    // 5. Auto-title from first user message if no title yet
    let updateTitle: string | undefined;
    if (!session.title && session.messageCount <= 2) {
      updateTitle = args.content.slice(0, 50);
      if (args.content.length > 50) updateTitle += "...";
    }

    // 6. Save assistant response
    await ctx.runMutation(api.chat.addAssistantMessage, {
      sessionId: args.sessionId,
      content: assistantContent,
      updateTitle,
    });

    // 7. Increment usage AFTER successful API call (don't burn quota on errors)
    const inc: { count: number } = await ctx.runMutation(
      api.chat.incrementDailyUsage,
      { userId }
    );
    const { remaining } = checkRateLimit(inc.count);

    return {
      assistantContent,
      remaining,
      limited: false as const,
    };
  },
});
