import {
  query,
  mutation,
  internalMutation,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  buildAdvisorSystemPrompt,
  buildTemplateReply,
  type LessonContext,
} from "./lib/advisorTemplates";

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

    // 1. Save user message
    await ctx.runMutation(internal.chat.addUserMessage, {
      sessionId: args.sessionId,
      content: args.userMessage,
    });

    // 3. Get all messages (including system) for API call
    const allMessages = await ctx.runQuery(
      api.chat.getMessagesForApi,
      { sessionId: args.sessionId }
    );

    // 4. Call Claude API — with FREE-DEGRADATION.
    // Phase 18: no key (or any failure) -> deterministic template reply,
    // lesson-aware when this session was opened from a lesson.
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Build a lesson-aware template fallback once.
    const fallbackLessonCtx: LessonContext | null = session.lessonId
      ? await ctx.runQuery(api.advisor.getLessonContext, {
          lessonId: session.lessonId,
        }).then((r) => r?.context ?? null)
      : null;
    const templateReply = buildTemplateReply(args.userMessage, fallbackLessonCtx);

    let assistantContent: string;

    if (!apiKey) {
      assistantContent = templateReply.text;
    } else {
      // Phase 14: claude-haiku-4-5-20251001 primary, sonnet fallback on 429/5xx.
      const PRIMARY_MODEL = "claude-haiku-4-5-20251001";
      const FALLBACK_MODEL = "claude-sonnet-4-6-20251022";

      async function callClaude(model: string): Promise<Response> {
        return fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey as string,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: allMessages.systemPrompt,
            messages: allMessages.conversationMessages,
          }),
        });
      }

      try {
        let response = await callClaude(PRIMARY_MODEL);
        if (!response.ok && (response.status === 429 || response.status >= 500)) {
          response = await callClaude(FALLBACK_MODEL);
        }
        if (!response.ok) {
          // Degrade gracefully to the template instead of erroring out.
          assistantContent = templateReply.text;
        } else {
          const data = (await response.json()) as {
            content: Array<{ type: string; text: string }>;
          };
          assistantContent =
            data.content[0]?.text ?? templateReply.text;
        }
      } catch {
        assistantContent = templateReply.text;
      }
    }

    // 5. Auto-generate title from first exchange if no title yet
    let updateTitle: string | undefined;
    if (!session.title && session.messageCount <= 2) {
      updateTitle = args.userMessage.slice(0, 50);
      if (args.userMessage.length > 50) updateTitle += "...";
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
