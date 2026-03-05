import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns day-of-year for a given Date (1–365/366) */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/** Structured daily content object returned by queries */
interface DailySet {
  dayOfYear: number;
  tip: { _id: string; content: string; category: string } | null;
  quote: { _id: string; content: string; author?: string; category: string } | null;
  challenge: { _id: string; content: string; category: string } | null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** מחזיר את כל תוכן היום: טיפ, ציטוט ואתגר */
export const getTodayContent = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const year = today.getFullYear();

    // Get all entries for today's day
    let entries = await ctx.db
      .query("dailyContent")
      .withIndex("by_day", (q) => q.eq("dayOfYear", dayOfYear))
      .collect();

    // Fallback: use modulo if exact day not found
    if (entries.length === 0) {
      const all = await ctx.db.query("dailyContent").collect();
      if (all.length === 0) return null;
      // Group by dayOfYear and pick wrapped day
      const days = [...new Set(all.map((e) => e.dayOfYear))].sort((a, b) => a - b);
      const wrappedDay = days[(dayOfYear - 1) % days.length];
      if (wrappedDay !== undefined) {
        entries = all.filter((e) => e.dayOfYear === wrappedDay);
      }
      if (entries.length === 0) entries = all.slice(0, 3);
    }

    const tip = entries.find((e) => e.type === "tip") ?? null;
    const quote = entries.find((e) => e.type === "quote") ?? null;
    const challenge = entries.find((e) => e.type === "challenge") ?? null;

    return {
      dayOfYear,
      year,
      tip: tip ? { _id: tip._id, content: tip.content, category: tip.category } : null,
      quote: quote
        ? { _id: quote._id, content: quote.content, author: quote.author, category: quote.category }
        : null,
      challenge: challenge
        ? { _id: challenge._id, content: challenge.content, category: challenge.category }
        : null,
    };
  },
});

/** מחזיר תוכן לפי תאריך ספציפי */
export const getContentByDate = query({
  args: { year: v.number(), dayOfYear: v.number() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("dailyContent")
      .withIndex("by_day", (q) => q.eq("dayOfYear", args.dayOfYear))
      .collect();

    const tip = entries.find((e) => e.type === "tip") ?? null;
    const quote = entries.find((e) => e.type === "quote") ?? null;
    const challenge = entries.find((e) => e.type === "challenge") ?? null;

    return {
      dayOfYear: args.dayOfYear,
      year: args.year,
      tip: tip ? { _id: tip._id, content: tip.content, category: tip.category } : null,
      quote: quote
        ? { _id: quote._id, content: quote.content, author: quote.author, category: quote.category }
        : null,
      challenge: challenge
        ? { _id: challenge._id, content: challenge.content, category: challenge.category }
        : null,
    };
  },
});

/** מחזיר היסטוריית תוכן יומי - 7 ימים אחרונים */
export const getContentHistory = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const todayDoy = getDayOfYear(today);
    const year = today.getFullYear();
    const results: DailySet[] = [];

    for (let i = 0; i < 7; i++) {
      let doy = todayDoy - i;
      let y = year;
      if (doy <= 0) {
        // Previous year
        y = year - 1;
        doy = 365 + doy;
      }

      const entries = await ctx.db
        .query("dailyContent")
        .withIndex("by_day", (q) => q.eq("dayOfYear", doy))
        .collect();

      const all = entries.length === 0
        ? await ctx.db.query("dailyContent").collect()
        : [];

      const sourceEntries = entries.length > 0
        ? entries
        : all.filter((e) => {
            const days = [...new Set(all.map((x) => x.dayOfYear))].sort((a, b) => a - b);
            const wrapped = days[(doy - 1) % Math.max(days.length, 1)];
            return e.dayOfYear === wrapped;
          });

      const tip = sourceEntries.find((e) => e.type === "tip") ?? null;
      const quote = sourceEntries.find((e) => e.type === "quote") ?? null;
      const challenge = sourceEntries.find((e) => e.type === "challenge") ?? null;

      results.push({
        dayOfYear: doy,
        tip: tip ? { _id: tip._id, content: tip.content, category: tip.category } : null,
        quote: quote
          ? { _id: quote._id, content: quote.content, author: quote.author, category: quote.category }
          : null,
        challenge: challenge
          ? { _id: challenge._id, content: challenge.content, category: challenge.category }
          : null,
      });
    }

    return results;
  },
});

/** בדיקה אם האתגר של היום הושלם על ידי המשתמש */
export const getTodayChallengeStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { completed: false, dayOfYear: 0 };

    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const year = today.getFullYear();

    const completion = await ctx.db
      .query("dailyChallengeCompletions")
      .withIndex("by_user_day_year", (q) =>
        q.eq("userId", identity.subject).eq("dayOfYear", dayOfYear).eq("year", year)
      )
      .first();

    return { completed: !!completion, dayOfYear, year };
  },
});

/** מחזיר סטטוס השלמה ל-7 הימים האחרונים */
export const getWeeklyChallengeStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const today = new Date();
    const todayDoy = getDayOfYear(today);
    const year = today.getFullYear();

    const results: Array<{ dayOfYear: number; year: number; completed: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      let doy = todayDoy - i;
      let y = year;
      if (doy <= 0) {
        y = year - 1;
        doy = 365 + doy;
      }

      const completion = await ctx.db
        .query("dailyChallengeCompletions")
        .withIndex("by_user_day_year", (q) =>
          q.eq("userId", identity.subject).eq("dayOfYear", doy).eq("year", y)
        )
        .first();

      results.push({ dayOfYear: doy, year: y, completed: !!completion });
    }

    return results;
  },
});

/** מחזיר את הסטריק הנוכחי של האתגרים היומיים */
export const getChallengeStreak = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };

    const completions = await ctx.db
      .query("dailyChallengeCompletions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };
    }

    // Sort completions by date (most recent first)
    const sorted = completions
      .map((c) => ({ doy: c.dayOfYear, year: c.year }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.doy - a.doy;
      });

    const today = new Date();
    const todayDoy = getDayOfYear(today);
    const todayYear = today.getFullYear();

    // Calculate current streak
    let currentStreak = 0;
    let checkDoy = todayDoy;
    let checkYear = todayYear;

    for (let i = 0; i < 365; i++) {
      const found = sorted.find((c) => c.doy === checkDoy && c.year === checkYear);
      if (found) {
        currentStreak++;
        checkDoy--;
        if (checkDoy <= 0) {
          checkYear--;
          checkDoy = 365;
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (!prev || !curr) continue;
      const prevAbsolute = prev.year * 365 + prev.doy;
      const currAbsolute = curr.year * 365 + curr.doy;
      if (prevAbsolute - currAbsolute === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);

    return {
      currentStreak,
      longestStreak,
      totalCompleted: completions.length,
    };
  },
});

/** מחזיר את כל התוכן (לניהול) */
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyContent").order("asc").collect();
  },
});

/** מחזיר תוכן לפי יום ספציפי */
export const getContentByDay = query({
  args: { dayOfYear: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyContent")
      .withIndex("by_day", (q) => q.eq("dayOfYear", args.dayOfYear))
      .first();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/** סימון אתגר יומי כהושלם */
export const markChallengeCompleted = mutation({
  args: { dayOfYear: v.number(), year: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("לא מחובר");

    // Check if already completed
    const existing = await ctx.db
      .query("dailyChallengeCompletions")
      .withIndex("by_user_day_year", (q) =>
        q.eq("userId", identity.subject).eq("dayOfYear", args.dayOfYear).eq("year", args.year)
      )
      .first();

    if (existing) {
      // Toggle: remove if already done
      await ctx.db.delete(existing._id);
      return { completed: false };
    }

    await ctx.db.insert("dailyChallengeCompletions", {
      userId: identity.subject,
      dayOfYear: args.dayOfYear,
      year: args.year,
      completedAt: Date.now(),
    });

    return { completed: true };
  },
});

/** הוספת פריט תוכן חדש (מנהל בלבד) */
export const addContent = mutation({
  args: {
    type: v.union(v.literal("tip"), v.literal("quote"), v.literal("challenge")),
    content: v.string(),
    author: v.optional(v.string()),
    category: v.string(),
    dayOfYear: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("לא מחובר");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") throw new Error("אין הרשאות מנהל");

    return await ctx.db.insert("dailyContent", {
      type: args.type,
      content: args.content,
      author: args.author,
      category: args.category,
      dayOfYear: args.dayOfYear,
      createdAt: Date.now(),
    });
  },
});

/** זריעת 30 ימי תוכן יומי בעברית - כל יום עם טיפ, ציטוט ואתגר */
export const seedDailyContent = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("dailyContent").first();
    if (existing) return { message: "תוכן יומי כבר קיים במערכת", count: 0 };

    const now = Date.now();

    const items: Array<{
      type: "tip" | "quote" | "challenge";
      content: string;
      author?: string;
      category: string;
      dayOfYear: number;
    }> = [
      // ── יום 1 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הקשבה פעילה מתחילה בשתיקה. תן לבן/בת הזוג לסיים את המשפט לפני שאתה מגיב.",
        category: "תקשורת",
        dayOfYear: 1,
      },
      {
        type: "quote",
        content: "אהבה אמיתית לא מוצאת אותך - אתה בונה אותה",
        author: "ד\"ר ג'ון גוטמן",
        category: "אהבה",
        dayOfYear: 1,
      },
      {
        type: "challenge",
        content: "היום, שאל/י את בן/בת הזוג שלך 'איך היה היום שלך?' והקשב/י 5 דקות בלי להפריע.",
        category: "חיבור",
        dayOfYear: 1,
      },
      // ── יום 2 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "במקום לנסות לרשים, נסה להתעניין. שאל שאלות פתוחות שמגלות סקרנות אמיתית - אנשים זוכרים את מי שגרם להם להרגיש מעניינים.",
        category: "שיחה",
        dayOfYear: 2,
      },
      {
        type: "quote",
        content: "אנחנו מקבלים את האהבה שאנחנו חושבים שאנחנו ראויים לה.",
        author: "סטיבן צ'בוסקי",
        category: "ערך עצמי",
        dayOfYear: 2,
      },
      {
        type: "challenge",
        content: "כתוב/י 3 תכונות שאתה/את אוהב/ת בעצמך - לא הישגים, אלא תכונות אופי. קרא/י אותן בקול.",
        category: "אהבה עצמית",
        dayOfYear: 2,
      },
      // ── יום 3 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "גבולות בריאים הם ביטוי לאהבה עצמית, לא דחייה. אמירת 'לא' ברגע הנכון מעידה על כנות ובגרות.",
        category: "גבולות",
        dayOfYear: 3,
      },
      {
        type: "quote",
        content: "פגיעות היא לא חולשה - היא האומץ הגדול ביותר שיש.",
        author: "ברנה בראון",
        category: "פגיעות",
        dayOfYear: 3,
      },
      {
        type: "challenge",
        content: "שלח/י הודעה לאדם שלא דיברת איתו הרבה זמן, רק כדי לשאול מה שלומו. ללא כוונות.",
        category: "חיבור",
        dayOfYear: 3,
      },
      // ── יום 4 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "שפת הגוף מעבירה 55% מהמסר. שמור/י על קשר עין טבעי, הישאר/י פתוח/ה בתנוחת גוף.",
        category: "שפת גוף",
        dayOfYear: 4,
      },
      {
        type: "quote",
        content: "אל תחפש/י אדם שישלים אותך, חפש/י אדם שיסייע לך להיות שלם/ה יותר.",
        category: "בחירת פרטנר",
        dayOfYear: 4,
      },
      {
        type: "challenge",
        content: "בשיחה הבאה שלך - הקשב/י 80% מהזמן ודבר/י 20%. בסוף, ספר/י מה למדת על האדם.",
        category: "הקשבה",
        dayOfYear: 4,
      },
      // ── יום 5 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אם אתה/את מרגיש/ה חרדה חברתית, שאל/י: 'מה אני יכול/ה לתת לאדם הזה?' - זה מעביר את הפוקוס מפחד להדדיות.",
        category: "ביטחון עצמי",
        dayOfYear: 5,
      },
      {
        type: "quote",
        content: "זוגיות טובה לא קורית - היא נבנית, יום אחרי יום, בחירה אחרי בחירה.",
        category: "מערכת יחסים",
        dayOfYear: 5,
      },
      {
        type: "challenge",
        content: "נסח/י הודעת פתיחה לאפליקציית היכרויות שמבטאת סקרנות אמיתית כלפי הפרופיל, לא מחמאה כללית.",
        category: "היכרויות",
        dayOfYear: 5,
      },
      // ── יום 6 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הומור הוא כלי מדהים, אבל הזמנה חשובה מהבדיחה. למד/י לקרוא את החדר - מתי להיות קל, מתי לעמוד ברצינות.",
        category: "שיחה",
        dayOfYear: 6,
      },
      {
        type: "quote",
        content: "השיחה הכי חשובה שתנהל/י אי פעם היא זו עם עצמך.",
        category: "ביטחון עצמי",
        dayOfYear: 6,
      },
      {
        type: "challenge",
        content: "היום, בכל שיחה שאתה/את מנהל/ת - שמור/י על קשר עין טבעי. שים/שימי לב כמה פעמים אתה/את מוסח/ת.",
        category: "נוכחות",
        dayOfYear: 6,
      },
      // ── יום 7 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחרי דייט, בדוק/י: האם שמחתי ברגע כשהוא/היא כתב/ה לי? האם השיחה זרמה? הרגשות שלך הם מצפן אמין.",
        category: "דייטינג",
        dayOfYear: 7,
      },
      {
        type: "quote",
        content: "כשאתה/את אוהב/ת את עצמך, אתה/את מגדיר/ה מה אהבה אמיתית נראית עבורך.",
        category: "אהבה עצמית",
        dayOfYear: 7,
      },
      {
        type: "challenge",
        content: "תן/תני מחמאה כנה למישהו - לא על מראה, אלא על אופי, כישרון, או מאמץ. שים/שימי לב לתגובה.",
        category: "חיבור",
        dayOfYear: 7,
      },
      // ── יום 8 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אל תחפש/י את 'הסול-מייט' השלם/ה - חפש/י אדם שאתה/את מתפתח/ת לצידו. זוגיות טובה היא פרויקט משותף.",
        category: "בחירת פרטנר",
        dayOfYear: 8,
      },
      {
        type: "quote",
        content: "הכי טוב שאני יכול/ה להיות בשביל האחר הוא הגרסה הטובה ביותר של עצמי.",
        category: "התפתחות אישית",
        dayOfYear: 8,
      },
      {
        type: "challenge",
        content: "כתוב/י את הסיפור שאתה/את מספר/ת לעצמך על כך שאתה/את לא מוצא/ת זוגיות. עכשיו כתוב/י גרסה חיובית יותר.",
        category: "חשיבה חיובית",
        dayOfYear: 8,
      },
      // ── יום 9 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחרות מושכת. לא כדאי לנסות 'לנצח' ולהיות תמיד זמין. תן/תני לאדם מולך מרחב לחשוב עלייך בינתיים.",
        category: "משיכה",
        dayOfYear: 9,
      },
      {
        type: "quote",
        content: "הסיכון הגדול ביותר הוא לא לקחת שום סיכון.",
        author: "מארק זאקרברג",
        category: "אומץ",
        dayOfYear: 9,
      },
      {
        type: "challenge",
        content: "הסתכל/י על הפרופיל שלך באפליקציית היכרויות מנקודת מבט של מישהו שלא מכיר/ה אותך. האם הוא מציג את הגרסה הטובה ביותר שלך?",
        category: "היכרויות",
        dayOfYear: 9,
      },
      // ── יום 10 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הקשבה פעילה פירושה לא רק לשמוע מילים, אלא לזהות את הרגש שמאחוריהן. שאל/י את עצמך: מה הוא/היא מרגיש/ה עכשיו?",
        category: "תקשורת",
        dayOfYear: 10,
      },
      {
        type: "quote",
        content: "הדרך היחידה ל-love story הטובה - להיות מוכן/ה לספר אותה בכנות.",
        author: "ברנה בראון",
        category: "אהבה",
        dayOfYear: 10,
      },
      {
        type: "challenge",
        content: "הזמן/י חבר/ה טוב/ה לפעילות חדשה שמעולם לא ניסיתם יחד. חוויות משותפות מחזקות קשרים.",
        category: "חברויות",
        dayOfYear: 10,
      },
      // ── יום 11 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "רגשות קשים בזוגיות הם לא בעיה - הם הזדמנות לחיבור עמוק יותר. במקום להימנע מהם, למד/י להכיל אותם יחד.",
        category: "אינטימיות רגשית",
        dayOfYear: 11,
      },
      {
        type: "quote",
        content: "לא תמיד תמצא/י את מי שמחפש/ת אותך - לפעמים תיתקל/י בו/בה.",
        category: "פגישות",
        dayOfYear: 11,
      },
      {
        type: "challenge",
        content: "בסוף היום, כתוב/י 3 מצבים חברתיים שניהלת היום. בכל אחד - מה הלך טוב, ומה תעשה/תעשי אחרת?",
        category: "חשיבה חיובית",
        dayOfYear: 11,
      },
      // ── יום 12 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כשאתה/את מבטא/ת צרכים, השתמש/י ב-'אני' ולא ב-'אתה/את'. 'אני מרגיש/ה בודד/ה' - לא 'אתה/את לא שם/ה לב אלי'.",
        category: "תקשורת",
        dayOfYear: 12,
      },
      {
        type: "quote",
        content: "אהבה היא לא רגש - היא מחויבות לפעול לטובת האחר.",
        author: "פסיכולוגים זוגיים",
        category: "מחויבות",
        dayOfYear: 12,
      },
      {
        type: "challenge",
        content: "היום, נסה/י לפתור ויכוח קטן ללא העלאת קול. דבר/י רק על הרגשות שלך, לא על מה שהאחר/ת 'עשה/תה'.",
        category: "ניהול קונפליקטים",
        dayOfYear: 12,
      },
      // ── יום 13 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כדי ליצור אינטימיות, שאל/י שאלות שמאפשרות פגיעות. 'מה הדבר שהכי מפחיד אותך עכשיו בחייך?' פותח דלתות שמחמאות לא פותחות.",
        category: "אינטימיות",
        dayOfYear: 13,
      },
      {
        type: "quote",
        content: "כשאנחנו מקשיבים באמת, אנחנו נותנים לאדם מולנו מתנה של קיום.",
        author: "קרל רוג'רס",
        category: "הקשבה",
        dayOfYear: 13,
      },
      {
        type: "challenge",
        content: "שאל/י היום שאלה אחת עמוקה שבדרך כלל לא שואל/ת. עמוד/י בפגיעות של לא לדעת את התשובה מראש.",
        category: "פגיעות",
        dayOfYear: 13,
      },
      // ── יום 14 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "ביטחון עצמי לא אומר 'אני מושלם/ת' - זה אומר 'אני מספיק/ה טוב/ה גם עם החסרונות שלי'. הקבלה עצמית מושכת אנשים.",
        category: "ביטחון עצמי",
        dayOfYear: 14,
      },
      {
        type: "quote",
        content: "הקשר הכי חשוב שתקיים/י בחייך הוא הקשר עם עצמך.",
        category: "אהבה עצמית",
        dayOfYear: 14,
      },
      {
        type: "challenge",
        content: "כתוב/י מכתב קצר לעצמך על הדרך שעשית עד היום. הכר/י בהתפתחות שלך, לא רק בחסרונות.",
        category: "התפתחות אישית",
        dayOfYear: 14,
      },
      // ── יום 15 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחת הטעויות הנפוצות בדייטינג: לנסות להיות מי שהאחר/ת רוצה. הדרך לקשר אמיתי עוברת דרך הצגת מי שאתה/את באמת.",
        category: "אותנטיות",
        dayOfYear: 15,
      },
      {
        type: "quote",
        content: "בכל מחלוקת יש שני אנשים שצודקים ושני אנשים שטועים. האמת נמצאת בתווך.",
        category: "ניהול קונפליקטים",
        dayOfYear: 15,
      },
      {
        type: "challenge",
        content: "בפעם הבאה שמישהו מספר לך על בעיה - התאפק/י מלתת עצה. פשוט שאל/י: 'מה הכי קשה לך בזה?'",
        category: "הקשבה",
        dayOfYear: 15,
      },
      // ── יום 16 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כדי להתמודד עם דחייה: זכור/י שדחייה היא מידע, לא פסיקה על ערכך. לא כל חיבור מתאים לכל אחד.",
        category: "התמודדות עם דחייה",
        dayOfYear: 16,
      },
      {
        type: "quote",
        content: "לצמוח זה לא להיות חסין מכאב - זה ללמוד שאתה/את יכול/ה להחזיק כאב ועדיין לנוע קדימה.",
        category: "התפתחות אישית",
        dayOfYear: 16,
      },
      {
        type: "challenge",
        content: "זהה/י פחד אחד שמונע ממך לגשת לאדם שמעניין אותך. כתוב/י אותו ואז שאל/י: 'מה הגרוע שיכול לקרות?'",
        category: "ביטחון עצמי",
        dayOfYear: 16,
      },
      // ── יום 17 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "שפות אהבה: כולנו נותנים ומקבלים אהבה בדרכים שונות - מגע, מילים, מתנות, שירות, זמן איכות. גלה/גלי מה שפת האהבה שלך.",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      {
        type: "quote",
        content: "הדרך לאהוב היא לאהוב בדרך שהאהוב/ה שלך מרגיש/ה - לא בדרך שנוחה לך.",
        author: "ד\"ר גארי צ'פמן",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      {
        type: "challenge",
        content: "גלה/גלי היום מהי שפת האהבה שלך. אחרי כן, עשה/עשי משהו אחד בשפת האהבה של אדם קרוב אליך.",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      // ── יום 18 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "בדייט הראשון: הצג/י סקרנות כנה, לא חקירה. הבדל בין 'כמה אחים יש לך?' לבין 'מה הזיכרון הכי אהוב שלך מהילדות?'",
        category: "דייטינג",
        dayOfYear: 18,
      },
      {
        type: "quote",
        content: "אמינות היא הבסיס של כל מערכת יחסים. בלעדיה, גם הרגש העמוק ביותר לא יחזיק.",
        category: "אמינות",
        dayOfYear: 18,
      },
      {
        type: "challenge",
        content: "הכן/הכיני 3 שאלות מעניינות לדייט הבא. שאלות שיגלו משהו אמיתי על האדם, לא נתונים ביוגרפיים.",
        category: "דייטינג",
        dayOfYear: 18,
      },
      // ── יום 19 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כשאתה/את כועס/ת - הכלל הזהוב: עצור/עצרי לפני שאתה/את מגיב/ה. נשום/נשמי עמוק. הרגשות בעת כעס מטים שיפוט.",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      {
        type: "quote",
        content: "בין גירוי לתגובה יש מרחב. במרחב הזה נמצאת חירותנו.",
        author: "ויקטור פרנקל",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      {
        type: "challenge",
        content: "כשתרגיש/י תסכול היום, נסה/י לנשום 4 שניות פנימה, לעצור 4 שניות, ולנשוף 6 שניות. חזור/חזרי פעמיים.",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      // ── יום 20 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "עצמאות רגשית היא המפתח לזוגיות בריאה. אם אתה/את מסתמך/ת על הפרטנר שלך למאה אחוז מהאושר שלך, זו אינטימיות שיכולה לחנוק.",
        category: "עצמאות רגשית",
        dayOfYear: 20,
      },
      {
        type: "quote",
        content: "שני אנשים שלמים יוצרים שותפות - לא שני חצאים שמחפשים להתחבר.",
        category: "בריאות זוגית",
        dayOfYear: 20,
      },
      {
        type: "challenge",
        content: "עשה/עשי היום משהו שאתה/את אוהב/ת לעשות לבד. השקע/י בעצמך כאדם עצמאי מחוץ לזוגיות/יחסים.",
        category: "עצמאות רגשית",
        dayOfYear: 20,
      },
      // ── יום 21 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אינטימיות לא מגיעה רק מנושאים כבדים. ריטואלים קטנים - קפה בבוקר יחד, הלוויה ידיים בהליכה - בונים חיבור עמוק לאורך זמן.",
        category: "אינטימיות",
        dayOfYear: 21,
      },
      {
        type: "quote",
        content: "הדבר הכי רומנטי הוא לראות את הפרטנר שלך ולדעת שזה הבית שלך.",
        category: "זוגיות",
        dayOfYear: 21,
      },
      {
        type: "challenge",
        content: "צור/צרי ריטואל קטן חדש - ריטואל יומי שיזכיר לאדם הקרוב אליך שאתה/את רואה אותו/ה ואיכפת לך.",
        category: "אינטימיות",
        dayOfYear: 21,
      },
      // ── יום 22 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כשמישהו חולק איתך רגש קשה, העיקרון הוא: קודם הכר/י ברגש, אחר כך טפל/י בבעיה. 'אני שומע/ת שזה היה קשה' לפני 'הנה הפתרון'.",
        category: "תמיכה רגשית",
        dayOfYear: 22,
      },
      {
        type: "quote",
        content: "אמפתיה לא פירושה להסכים עם האדם - פירושו להבין את עולמו.",
        category: "אמפתיה",
        dayOfYear: 22,
      },
      {
        type: "challenge",
        content: "היום כשמישהו יספר לך על קושי, התאפק/י מלפתור. אמור/אמרי רק: 'זה נשמע ממש קשה. ספר/י לי יותר.'",
        category: "תמיכה רגשית",
        dayOfYear: 22,
      },
      // ── יום 23 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחד הכישורים החשובים בזוגיות: לדעת מתי לסגת. לא כל ויכוח צריך להגמר היום. לפעמים 'בוא נשוחח על זה מחר' זו בחירה חכמה.",
        category: "ניהול קונפליקטים",
        dayOfYear: 23,
      },
      {
        type: "quote",
        content: "לא כל מה שאתה/את מרגיש/ה צריך לבוא לידי ביטוי. לא כל מה שאתה/את חושב/ת צריך לנאמר.",
        category: "שליטה עצמית",
        dayOfYear: 23,
      },
      {
        type: "challenge",
        content: "זהה/י נושא אחד שגורם לך לקצר/קצרת פתיל. כתוב/י מה קורה בפנים כשהנושא הזה עולה, ומה הצורך שמסתתר מאחוריו.",
        category: "ניהול רגשות",
        dayOfYear: 23,
      },
      // ── יום 24 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כדי לשמור על אטרקטיביות בזוגיות ארוכת טווח: אל תפסיק/י להשתפר, לחלום ולחפש חוויות חדשות. אדם שמתפתח מעניין יותר.",
        category: "משיכה",
        dayOfYear: 24,
      },
      {
        type: "quote",
        content: "הזוגות המאושרים לא מוצאים את השותף המושלם - הם מחליטים לאהוב את השותף שמצאו.",
        category: "מחויבות",
        dayOfYear: 24,
      },
      {
        type: "challenge",
        content: "הכן/הכיני רשימה של 5 דברים שתמיד רצית לנסות. בחר/י את הקל ביותר ותכנן/תכנני מתי תעשה/תעשי אותו השבוע.",
        category: "התפתחות אישית",
        dayOfYear: 24,
      },
      // ── יום 25 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הכרת תודה מחזקת מערכות יחסים. לא פעם בחגים - אלא כהרגל יומי. 'תודה שהכנת קפה' משמעותי יותר ממה שנדמה.",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      {
        type: "quote",
        content: "הכרת תודה הופכת את מה שיש לנו להספקה.",
        author: "ד\"ר מרטין סליגמן",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      {
        type: "challenge",
        content: "אמור/אמרי 'תודה' היום לשלושה אנשים שונים - אבל עם פירוט ספציפי. לא 'תודה' סתם, אלא 'תודה על...'",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      // ── יום 26 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הראה/הראי אכפתיות בדרכים ספציפיות. 'איך הפגישה שלך הלכה?' כשאתה/את זוכר/ת שהייתה לה פגישה - זה אהבה בפעולה.",
        category: "אכפתיות",
        dayOfYear: 26,
      },
      {
        type: "quote",
        content: "לזכור את הפרטים הקטנים על האדם שאתה/את אוהב/ת - זה אחד המעשים הרומנטיים ביותר שקיימים.",
        category: "תשומת לב",
        dayOfYear: 26,
      },
      {
        type: "challenge",
        content: "זכור/זכרי משהו שאמר לך אדם קרוב בשבוע האחרון. שאל/י אותו/ה היום שאלת המשך שתראה שזכרת.",
        category: "אכפתיות",
        dayOfYear: 26,
      },
      // ── יום 27 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "פחד מנטישה מכונן דפוסי התנהגות שדוחים אנשים. אם אתה/את מרגיש/ה שאתה/את נאחז/ת חזק מדי, זה אות שכדאי לעבוד על ביטחון עצמי.",
        category: "ביטחון עצמי",
        dayOfYear: 27,
      },
      {
        type: "quote",
        content: "החרדה לאהבה נובעת מהצורך בה, לא מהרגש עצמו.",
        category: "בריאות רגשית",
        dayOfYear: 27,
      },
      {
        type: "challenge",
        content: "זהה/י דפוס אחד בזוגיות שחוזר על עצמו ולא עובד לך. כתוב/י מה הצורך הבסיסי שמאחוריו ואיך אפשר לענות עליו אחרת.",
        category: "דפוסים",
        dayOfYear: 27,
      },
      // ── יום 28 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחת הדרכים הטובות ביותר לפגוש אנשים: עשה/עשי דברים שאתה/את אוהב/ת, לא רק לשם המטרה. הסביבה הנכונה מייצרת חיבורים טבעיים.",
        category: "פגישות",
        dayOfYear: 28,
      },
      {
        type: "quote",
        content: "אתה/את לא פוגש/ת אנשים במקרה - כל אחד שנכנס לחייך מביא איתו מסר.",
        category: "חיבורים",
        dayOfYear: 28,
      },
      {
        type: "challenge",
        content: "כתוב/י רשימה של ההתנהגויות שלך בשלב ה'חיזור'. האם יש בהן דברים שאתה/את עושה/ה מפחד, לא מרצון? בחר/י אחד ושנה/שני אותו.",
        category: "אותנטיות",
        dayOfYear: 28,
      },
      // ── יום 29 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "זוגיות בריאה כוללת גם מרחב אישי. כל אחד צריך זמן לעצמו, תחביבים משלו, חברויות נפרדות. קרבה לא אומרת מיזוג.",
        category: "גבולות בריאים",
        dayOfYear: 29,
      },
      {
        type: "quote",
        content: "תן/תני לאדם שאתה/את אוהב/ת מרחב לנשום - ותגלה/תגלי שהוא/היא חוזר/ת אליך שוב ושוב.",
        category: "מרחב אישי",
        dayOfYear: 29,
      },
      {
        type: "challenge",
        content: "תכנן/תכנני שעה אחת השבוע שהיא רק לך - בלי פלאפון, בלי חובות. עשה/עשי משהו שאתה/את אוהב/ת לגמרי לבד.",
        category: "טיפול עצמי",
        dayOfYear: 29,
      },
      // ── יום 30 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הצלחה בזוגיות לא נמדדת בהיעדר קונפליקטים, אלא ביכולת לפתור אותם בכבוד. הזוגות המאושרים גם רבים - הם פשוט יודעים לחזור אחד לשני.",
        category: "ניהול קונפליקטים",
        dayOfYear: 30,
      },
      {
        type: "quote",
        content: "כל מסע של אלף מיל מתחיל בצעד אחד.",
        author: "לאו טסה",
        category: "התחלות",
        dayOfYear: 30,
      },
      {
        type: "challenge",
        content: "שקף/שקפי את ה-30 הימים האחרונים: מה למדת על עצמך? מה השתנה בגישה שלך לזוגיות ולחיבורים? כתוב/י 3 תובנות שתשאר/תשארי איתן.",
        category: "רפלקציה",
        dayOfYear: 30,
      },
    ];

    let count = 0;
    for (const item of items) {
      await ctx.db.insert("dailyContent", { ...item, createdAt: now });
      count++;
    }

    return { message: `נוספו ${count} פריטי תוכן יומי בהצלחה (${count / 3} ימים מלאים)`, count };
  },
});

/** internalMutation for seeding from cron/admin (alias) */
export const seedDailyContentInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("dailyContent").first();
    if (existing) return { message: "תוכן יומי כבר קיים", count: 0 };
    // Delegate to seed logic
    return { message: "Use seedDailyContent mutation instead", count: 0 };
  },
});
