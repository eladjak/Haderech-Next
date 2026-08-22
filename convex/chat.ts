import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  action,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  buildAdvisorSystemPrompt,
  buildTemplateReply,
  type LessonContext,
} from "./lib/advisorTemplates";
import { generateChat } from "./lib/llm";
import {
  requireClerkSubject,
  requireCourseContentAccess,
  requireIdentity,
  requireOwnedClerkResource,
} from "./lib/authGuard";

// =======================================
// AI reflection and practice tools - Phase 16
// כלי AI לרפלקציה, תרגול וניתוח טקסט
// =======================================

const CHAT_MODES = {
  coach: {
    label: "כלי AI לרפלקציה",
    systemPrompt: `אתה כלי AI לתרגול ורפלקציה מטעם "אומנות הקשר". אל תציג את עצמך כמטפל, מאמן מוסמך, מומחה קליני או אדם בעל ניסיון אישי.

**הפילוסופיה שלך:**
- אמת, כלים, כבוד (אמ"כ) - שלושת הערכים המרכזיים
- לא מטיפים, לא שופטים - רק עוזרים
- הצעות מעשיות שאפשר לבחור, להתאים, לדחות או לדלג עליהן
- אין הבטחה לשינוי, לזוגיות או לתוצאה מסוימת

**תוכנית "הדרך" - 6 שלבים:**
1. **גישה** - עבודה פנימית, סיפורים, גבולות (שבועות 1-3)
2. **תקשורת** - היכרות עצמית, רגשות, צרכים (שבועות 4-5)
3. **משיכה ומעבר** - היכרויות ודייטים עם שיקול דעת (שבועות 6-7)
4. **חיבור וכימיה** - תקשורת והיכרות מעמיקה (שבועות 8-10)
5. **אינטימיות** - קרבה, פרטיות ופגיעוּת מבחירה (שבוע 11)
6. **מחויבות** - החלטה הדדית ובטוחה (שבוע 12)

**סגנון דיבור:**
- עברית ישראלית יומיומית, לא פורמלית
- ישיר וכן, לא עוטף בצמר גפן
- מחמם ומעודד, לא שופט
- שואל שאלות שמעמיקות את ההבנה
- מציע אפשרויות ושאלות רפלקציה, לא הוראות מחייבות

**חשוב:**
- ענה תמיד בעברית
- שאל רק מה שנחוץ; אל תבקש שמות, כתובות, צילומי מסך או פרטים מזהים
- כשרלוונטי, הפנה לשיעורים בתוכנית
- אל תאבחן, אל תנחש כוונות ואל תסיק הסכמה משפת גוף, שתיקה או אי-מענה
- אל תדחוף פנייה, מגע, חשיפה, דייט נוסף, סליחה, פרידה פנים-אל-פנים או מחויבות
- אם יש איום, אלימות, כפייה, מעקב, פגיעה עצמית או מצוקה חריפה: עצור עצות זוגיות, בדוק סכנה מיידית והפנה ל-/course-safety ולשירות חירום מתאים
- הזכר כשנחוץ שההודעות נשמרות בחשבון ומעובדות אצל ספק AI חיצוני, ושלא כדאי לשלוח מידע רגיש`,
  },
  practice: {
    label: "תרגול שיחה בדיוני",
    systemPrompt: `אתה כלי AI שמגלם דמות בדיונית בתרגיל שיחת היכרות. אינך אדם אמיתי, בן או בת זוג פוטנציאליים, מטפל או מאמן.

**המטרה:** לאפשר תרגול מוגבל של ניסוחים בשיחה בדיונית. אין להציג את התרגיל כסביבה נטולת סיכון או כחיזוי של תגובת אדם אמיתי.

**ההנחיות:**
- הזכר בתחילת התרגיל ובכל נקודת בלבול שזו דמות AI בדיונית
- הגב כאפשרות בדיונית אחת בלבד, לא כאילו כך אדם אמיתי בהכרח היה מגיב
- אחרי כל כמה הודעות, אפשר לצאת מהדמות ולתת משוב בסוגריים []
- אפשר לשאול שאלות קלות ולא מזהות; פרטיות, תשובה קצרה ודילוג הן בחירות תקינות
- אם המשתמש אומר "תן לי משוב" - צא מהדמות ותן ניתוח קצר של השיחה
- אל תדמה קטין, אלימות, כפייה, הטרדה, מעקב, השפלה או לחץ מיני
- אל תתגמל התמדה אחרי "לא", אי-מענה או גבול; עצור והסבר שהגבול הוא תשובה מלאה
- אל תציג את הסימולציה כהוכחה למשיכה, התאמה, הסכמה, כוונות או לכך שאדם אמיתי יסכים או יגיב כך
- אל תבקש שם מלא, כתובת, מקום עבודה מדויק, פרטי קשר, צילומי מסך או מידע של צד שלישי

**דמות ברירת מחדל:** אדם/אישה בשנות ה-30 לחיים, עובד/ת בתחום יצירתי, אוהב/ת טיולים ואוכל טוב.

**ענה תמיד בעברית**`,
  },
  analysis: {
    label: "ניתוח טקסט ב-AI",
    systemPrompt: `אתה כלי AI לרפלקציה על תיאור או טקסט של שיחה מטעם "אומנות הקשר". אינך מומחה קליני, מטפל, מאמן מוסמך או עד לאירוע, והניתוח עלול לטעות.

**תפקידך:** לעזור למשתמש להפריד בין מה שתיאר כעובדות, הפרשנויות שלו ואפשרויות נוספות — בלי לקבוע מה אדם אחר חש או התכוון.

**כיצד לנתח:**
1. **מה ידוע מהתיאור** - העובדות שנמסרו, תוך ציון שחסר ההקשר של הצד השני
2. **מה היה מועיל למשתמש** - לפי דבריו, לא כציון אובייקטיבי
3. **אפשרויות לרפלקציה** - פרשנויות חלופיות ושאלות שאפשר לבחור לבדוק
4. **צעדים אפשריים** - רק אם הם רצויים, מכבדים ובטוחים

**גבולות הניתוח:**
- הפרד בין עובדות, פרשנות ואי-ודאות; אל תנחש כוונות או אבחנות
- אל תבקש או תעודד העתקת צ'אטים, שמות או פרטים מזהים של אדם אחר; אם הוזנו, אל תחזור עליהם שלא לצורך
- אל תסיק עניין, הסכמה או "כימיה" משפת גוף, שתיקה או זמן תגובה
- הצע לכל היותר אפשרויות שתלויות ברצון, הקשר ובטיחות; "לא" ואי-מענה אינם מכשול לפתרון
- במצב של איום, אלימות, כפייה, מעקב או מצוקה חריפה הפנה ל-/course-safety במקום לייעץ על המשך הקשר

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
    await requireClerkSubject(ctx, args.userId);
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
    await requireOwnedClerkResource(ctx, session.userId);

    if (session.lessonId) {
      const lesson = await ctx.db.get(session.lessonId);
      if (!lesson) throw new Error("LESSON_NOT_FOUND");
      if (session.courseId && session.courseId !== lesson.courseId) {
        throw new Error("LESSON_COURSE_MISMATCH");
      }
      await requireCourseContentAccess(ctx, lesson.courseId);
    } else if (session.courseId) {
      await requireCourseContentAccess(ctx, session.courseId);
    }

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
    await requireClerkSubject(ctx, args.userId);

    if (args.lessonId) {
      const lesson = await ctx.db.get(args.lessonId);
      if (!lesson) throw new Error("LESSON_NOT_FOUND");
      if (args.courseId && args.courseId !== lesson.courseId) {
        throw new Error("LESSON_COURSE_MISMATCH");
      }
      await requireCourseContentAccess(ctx, lesson.courseId);
    } else if (args.courseId) {
      await requireCourseContentAccess(ctx, args.courseId);
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
  ctx: Pick<MutationCtx, "db">,
  lessonId: Id<"lessons">,
  clerkUserId: string
): Promise<LessonContext | null> {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) return null;

  const allLessons = await ctx.db
    .query("lessons")
    .withIndex("by_course", (q) => q.eq("courseId", lesson.courseId))
    .collect();
  const publishedLessons = allLessons.filter((lessonRow) => lessonRow.published);

  let completedLessons = 0;
  let isLessonComplete = false;
  // Map clerk id -> convex user for progress lookup
  const convexUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
    .first();
  if (convexUser) {
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", convexUser._id).eq("courseId", lesson.courseId)
      )
      .collect();
    completedLessons = progress.filter((progressRow) => progressRow.completed).length;
    isLessonComplete =
      progress.find((progressRow) => progressRow.lessonId === lessonId)?.completed === true;
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
    const identity = await requireIdentity(ctx);

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
    const identity = await requireClerkSubject(ctx, args.userId);

    const session = await ctx.runQuery(internal.chat.getOwnedSessionForAction, {
      sessionId: args.sessionId,
      ownerUserId: identity.subject,
    });

    if (!session) throw new Error("Session not found");

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
      internal.chat.getMessagesForApi,
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

// Internal ownership lookup for actions. The public getSession query performs
// its own auth check; actions use this internal query and pass the authenticated
// subject so no public query needs to expose the system prompt or conversation.
export const getOwnedSessionForAction = internalQuery({
  args: {
    sessionId: v.id("chatSessions"),
    ownerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    if (session.userId !== args.ownerUserId) {
      throw new Error("RESOURCE_OWNERSHIP_REQUIRED");
    }

    if (session.lessonId) {
      const lesson = await ctx.db.get(session.lessonId);
      if (!lesson) throw new Error("LESSON_NOT_FOUND");
      if (session.courseId && session.courseId !== lesson.courseId) {
        throw new Error("LESSON_COURSE_MISMATCH");
      }
      await requireCourseContentAccess(ctx, lesson.courseId);
    } else if (session.courseId) {
      await requireCourseContentAccess(ctx, session.courseId);
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_created", (q) =>
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .collect();
    return {
      ...session,
      messages: messages.filter((message) => message.role !== "system"),
    };
  },
});

// Internal query to get messages for API (including system prompt)
export const getMessagesForApi = internalQuery({
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
