import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  buildAdvisorSystemPrompt,
  buildTemplateReply,
  type LessonContext,
} from "./lib/advisorTemplates";
import { generateChat } from "./lib/llm";

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

// שליפת כל הסשנים של משתמש
export const listSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return sessions;
  },
});

// שליפת סשן עם הודעות
export const getSession = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

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

// יצירת סשן חדש
export const createSession = mutation({
  args: {
    userId: v.string(),
    mode: v.union(
      v.literal("coach"),
      v.literal("practice"),
      v.literal("analysis")
    ),
    title: v.optional(v.string()),
    // Phase 18: optional lesson context — when opened from a lesson,
    // the coach becomes lesson-aware (advisor <-> course sync).
    lessonId: v.optional(v.id("lessons")),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Not authorized to create a session for another user");
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("chatSessions", {
      userId: args.userId,
      mode: args.mode,
      title: args.title,
      lessonId: args.lessonId,
      courseId: args.courseId,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Build the system prompt. For coach mode with a lesson, use the
    // lesson-aware advisor prompt; otherwise fall back to the static mode prompt.
    let systemPrompt = CHAT_MODES[args.mode].systemPrompt;
    if (args.mode === "coach" && args.lessonId) {
      const lessonCtx = await resolveLessonContext(ctx, args.lessonId, args.userId);
      if (lessonCtx) {
        systemPrompt = buildAdvisorSystemPrompt(lessonCtx);
      }
    }

    await ctx.db.insert("chatMessages", {
      sessionId,
      role: "system",
      content: systemPrompt,
      createdAt: now,
    });

    return sessionId;
  },
});

// Helper: resolve lesson context from inside a mutation/query ctx.
// Mirrors advisor.getLessonContext but usable in the createSession mutation.
async function resolveLessonContext(
  ctx: { db: any },
  lessonId: any,
  clerkUserId: string
): Promise<LessonContext | null> {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) return null;

  const allLessons = await ctx.db
    .query("lessons")
    .withIndex("by_course", (q: any) => q.eq("courseId", lesson.courseId))
    .collect();
  const publishedLessons = allLessons.filter((l: any) => l.published);

  let completedLessons = 0;
  let isLessonComplete = false;
  // Map clerk id -> convex user for progress lookup
  const convexUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkUserId))
    .first();
  if (convexUser) {
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q: any) =>
        q.eq("userId", convexUser._id).eq("courseId", lesson.courseId)
      )
      .collect();
    completedLessons = progress.filter((p: any) => p.completed).length;
    isLessonComplete =
      progress.find((p: any) => p.lessonId === lessonId)?.completed === true;
  }

  return {
    lessonTitle: lesson.title,
    lessonDescription: lesson.description,
    weekNumber: lesson.weekNumber,
    phaseNumber: lesson.phaseNumber,
    phaseName: lesson.phaseName,
    completedLessons,
    totalLessons: publishedLessons.length,
    isLessonComplete,
  };
}

// שמירת הודעת משתמש (internal — נקרא רק מתוך sendMessage)
export const addUserMessage = internalMutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

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

// שמירת תשובת AI (internal — נקרא רק מתוך sendMessage)
export const addAssistantMessage = internalMutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
    updateTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

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

// Cost hardening (Phase 14, salvaged from worktree thirsty-blackwell-e44426):
// per-user hourly rate limit + input size cap — prevent runaway AI cost.
const HOURLY_MESSAGE_LIMIT = 60;
const MAX_MESSAGE_CHARS = 4000;

export const sendMessage = action({
  args: {
    sessionId: v.id("chatSessions"),
    userMessage: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // 0. Auth: caller must be signed in and own the session
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.runQuery(api.chat.getSession, {
      sessionId: args.sessionId,
    });

    if (!session) throw new Error("Session not found");
    if (session.userId !== identity.subject) {
      throw new Error("Not authorized to send messages in this session");
    }

    // 0b. Input validation — reject empty / oversized messages.
    const trimmed = args.userMessage.trim();
    if (!trimmed) throw new Error("Empty message");
    if (trimmed.length > MAX_MESSAGE_CHARS) {
      throw new Error(`הודעה ארוכה מדי (מקסימום ${MAX_MESSAGE_CHARS} תווים)`);
    }

    // 0c. Rate-limit: count this user's messages in the last hour
    // across all sessions (cost hardening — prevent runaway spend).
    const recent = await ctx.runQuery(internal.chat.countRecentUserMessages, {
      userId: identity.subject,
      sinceMs: Date.now() - 60 * 60 * 1000,
    });
    if (recent >= HOURLY_MESSAGE_LIMIT) {
      throw new Error(
        `הגעת למגבלת ${HOURLY_MESSAGE_LIMIT} הודעות לשעה. נסה שוב בעוד שעה.`
      );
    }

    // 1. Save user message
    await ctx.runMutation(internal.chat.addUserMessage, {
      sessionId: args.sessionId,
      content: trimmed,
    });

    // 3. Get all messages (including system) for API call
    const allMessages = await ctx.runQuery(
      api.chat.getMessagesForApi,
      { sessionId: args.sessionId }
    );

    // 4. Call live AI — with FREE-DEGRADATION.
    // Phase 19: Gemini free-tier preferred, then Claude; no token (or any
    // failure) -> deterministic template reply, lesson-aware when this
    // session was opened from a lesson.

    // Build a lesson-aware template fallback once.
    const fallbackLessonCtx: LessonContext | null = session.lessonId
      ? await ctx.runQuery(api.advisor.getLessonContext, {
          lessonId: session.lessonId,
        }).then((r) => r?.context ?? null)
      : null;
    const templateReply = buildTemplateReply(trimmed, fallbackLessonCtx);

    const ai = await generateChat({
      system: allMessages.systemPrompt,
      messages: allMessages.conversationMessages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      maxTokens: 1024,
    });
    const assistantContent = ai?.text ?? templateReply.text;

    // 5. Auto-generate title from first exchange if no title yet
    let updateTitle: string | undefined;
    if (!session.title && session.messageCount <= 2) {
      updateTitle = trimmed.slice(0, 50);
      if (trimmed.length > 50) updateTitle += "...";
    }

    // 6. Save assistant response
    await ctx.runMutation(internal.chat.addAssistantMessage, {
      sessionId: args.sessionId,
      content: assistantContent,
      updateTitle,
    });

    return assistantContent;
  },
});

// Count user-role messages across all of a user's sessions since a
// timestamp. Used by sendMessage for hourly rate-limiting (internal —
// not exposed to clients).
export const countRecentUserMessages = internalQuery({
  args: { userId: v.string(), sinceMs: v.number() },
  handler: async (ctx, args): Promise<number> => {
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let total = 0;
    for (const s of sessions) {
      const msgs = await ctx.db
        .query("chatMessages")
        .withIndex("by_session_created", (q) =>
          q.eq("sessionId", s._id).gte("createdAt", args.sinceMs)
        )
        .collect();
      total += msgs.filter((m) => m.role === "user").length;
      if (total >= HOURLY_MESSAGE_LIMIT) return total; // short-circuit
    }
    return total;
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
