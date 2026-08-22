import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";
import { assertSeedAllowed } from "./lib/seedGuard";

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
    const results: DailySet[] = [];

    for (let i = 0; i < 7; i++) {
      let doy = todayDoy - i;
      if (doy <= 0) {
        // Daily editorial entries repeat by day-of-year.
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
    assertSeedAllowed("seedDailyContent");
    await requireAdmin(ctx);
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
        content: "בהקשבה אפשר להשאיר מקום לסיום המשפט, ואז לבדוק מה הובן במקום למהר להסיק.",
        category: "תקשורת",
        dayOfYear: 1,
      },
      {
        type: "quote",
        content: "קשר נבנה מבחירות הדדיות לאורך זמן; הוא אינו מבחן לערך של אף אחד.",
        category: "אהבה",
        dayOfYear: 1,
      },
      {
        type: "challenge",
        content: "אם מתאים לשניכם, שאל/י אדם קרוב איך עבר עליו היום והציע/י כמה דקות של הקשבה. מותר לו לא לשתף.",
        category: "חיבור",
        dayOfYear: 1,
      },
      // ── יום 2 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "במקום לנסות להרשים, אפשר לגלות סקרנות ולשאול שאלות פתוחות — בלי לחקור ובלי לצפות לתוצאה.",
        category: "שיחה",
        dayOfYear: 2,
      },
      {
        type: "quote",
        content: "תחושת ערך יכולה להשפיע על הבחירות שלנו, אבל יחס פוגעני אינו אשמת מי שנפגע/ת.",
        category: "ערך עצמי",
        dayOfYear: 2,
      },
      {
        type: "challenge",
        content: "אם מתאים, כתוב/י עד 3 תכונות או דרכי התמודדות שאת/ה מעריך/ה בעצמך. אין חובה לקרוא אותן בקול.",
        category: "חמלה עצמית",
        dayOfYear: 2,
      },
      // ── יום 3 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "גבול אינו דחייה של ערך האדם האחר. מותר לומר 'לא', לבקש זמן או לשנות את דעתך בלי להוכיח בגרות או להצדיק את הגבול.",
        category: "גבולות",
        dayOfYear: 3,
      },
      {
        type: "quote",
        content: "חשיפה יכולה להיות בחירה אמיצה, וגם פרטיות, דילוג ועצירה הן בחירות לגיטימיות.",
        category: "פגיעות",
        dayOfYear: 3,
      },
      {
        type: "challenge",
        content: "אם הקשר היה בטוח ולא הוצב גבול, אפשר לשלוח הודעה אחת לאדם שלא דיברת איתו זמן רב. אם אין תשובה — לא ממשיכים ללחוץ.",
        category: "חיבור",
        dayOfYear: 3,
      },
      // ── יום 4 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "שפת גוף אינה מד־אמת ואינה הוכחה לעניין או להסכמה. קשר עין ותנוחה משתנים בין אנשים; כשחשוב לדעת — שואלים.",
        category: "שפת גוף",
        dayOfYear: 4,
      },
      {
        type: "quote",
        content: "אינך חצי שמחפש השלמה. אפשר לחפש קשר שיש בו כבוד, בחירה ותמיכה הדדית, גם כשכל אחד מביא צרכים וחוסרים.",
        category: "בחירת פרטנר",
        dayOfYear: 4,
      },
      {
        type: "challenge",
        content: "בשיחה הבאה, נסה/י להשאיר מקום לשני הצדדים ולשאול שאלת המשך אחת. אין יחס זמן נכון לכל שיחה.",
        category: "הקשבה",
        dayOfYear: 4,
      },
      // ── יום 5 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אם עולה חרדה חברתית, אפשר לשאול: 'מה יעזור לי להרגיש בטוח/ה יותר עכשיו?' אין חובה לגשת, להרשים או לתת משהו לאדם אחר.",
        category: "ביטחון עצמי",
        dayOfYear: 5,
      },
      {
        type: "quote",
        content: "קשר יכול להיבנות מצעדים הדדיים לאורך זמן, רק כל עוד שני הצדדים ממשיכים לבחור בו.",
        category: "מערכת יחסים",
        dayOfYear: 5,
      },
      {
        type: "challenge",
        content: "אם מתאים, נסח/י הודעת פתיחה שמתייחסת בכבוד לפרט מהפרופיל. שלחו פעם אחת וקבלו גם היעדר תשובה.",
        category: "היכרויות",
        dayOfYear: 5,
      },
      // ── יום 6 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "הומור יכול להקל, אבל אי אפשר 'לקרוא את החדר' בוודאות. אם בדיחה נוגעת בנושא אישי, בדקו איך התקבלה והתנצלו בלי להתווכח אם פגעה.",
        category: "שיחה",
        dayOfYear: 6,
      },
      {
        type: "quote",
        content: "האופן שבו את/ה מדבר/ת לעצמך יכול להיות נושא ראוי לתשומת לב, לצד קשרים ותמיכה מאנשים אחרים.",
        category: "ביטחון עצמי",
        dayOfYear: 6,
      },
      {
        type: "challenge",
        content: "בשיחה אחת היום, בדוק/י מה עוזר לך להיות נוכח/ת. קשר עין אינו חובה; אפשר להקשיב היטב גם כשמביטים הצידה או זזים.",
        category: "נוכחות",
        dayOfYear: 6,
      },
      // ── יום 7 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אחרי דייט, בדוק/י מה היה נעים, מה לא, ומה נאמר בפועל. רגש הוא מידע חשוב, אך לא הוכחה לכוונת הצד השני ולא התחייבות להמשך.",
        category: "דייטינג",
        dayOfYear: 7,
      },
      {
        type: "quote",
        content: "אפשר לברר אילו התנהגויות גורמות לך להרגיש מכובד/ת ובטוח/ה, גם אם יחסך לעצמך עדיין מורכב.",
        category: "חמלה עצמית",
        dayOfYear: 7,
      },
      {
        type: "challenge",
        content: "אם מתאים להקשר, אפשר לתת מחמאה כנה על מאמץ או פעולה. אין צורך לבחון את תגובת האדם או לצפות לקרבה בתמורה.",
        category: "חיבור",
        dayOfYear: 7,
      },
      // ── יום 8 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אין צורך לחפש 'סול-מייט' או אדם מושלם. אפשר לבדוק אם יש כבוד, התאמה מספקת ורצון הדדי לצמוח — לצד זכות להישאר שונים.",
        category: "בחירת פרטנר",
        dayOfYear: 8,
      },
      {
        type: "quote",
        content: "טיפול בעצמך אינו שירות לאדם אחר. אפשר לצמוח למענך ולבחור מה יש לך רצון ויכולת לתת בקשר.",
        category: "התפתחות אישית",
        dayOfYear: 8,
      },
      {
        type: "challenge",
        content: "כתוב/י מחשבה שחוזרת סביב היכרות, ואז נסח/י גרסה מאוזנת יותר שמפרידה בין עובדות, חששות ודברים שאינך יודע/ת.",
        category: "חשיבה חיובית",
        dayOfYear: 8,
      },
      // ── יום 9 ──────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אין צורך ליצור מחסור או לשחק בזמינות כדי לעורר משיכה. היו ברורים לגבי הקצב שלכם וכבדו גם את הקצב והגבולות של הצד השני.",
        category: "משיכה",
        dayOfYear: 9,
      },
      {
        type: "quote",
        content: "צעד חדש הוא בחירה, לא חובה; אפשר להתקדם בהדרגה בלי לסכן בטיחות או גבולות.",
        category: "אומץ",
        dayOfYear: 9,
      },
      {
        type: "challenge",
        content: "עברו על פרופיל ההיכרויות ובדקו אם הוא עדכני, מדויק ושומר על פרטיותכם. אין צורך להציג 'גרסה מושלמת' או מידע מזהה.",
        category: "היכרויות",
        dayOfYear: 9,
      },
      // ── יום 10 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "בהקשבה אפשר לשים לב גם לטון ולהקשר, אבל לא לנחש רגש. אפשר לשאול: 'איך זה היה עבורך?' ולקבל גם בחירה לא לענות.",
        category: "תקשורת",
        dayOfYear: 10,
      },
      {
        type: "quote",
        content: "כנות אינה מחייבת חשיפה מלאה. אפשר לספר את הסיפור שלך בקצב ובגבולות שמתאימים לך.",
        category: "אהבה",
        dayOfYear: 10,
      },
      {
        type: "challenge",
        content: "אם מתאים לשניכם, אפשר להציע לחבר/ה פעילות חדשה. חוויה משותפת עשויה להיות נעימה, אך מותר לסרב או לבחור משהו מוכר.",
        category: "חברויות",
        dayOfYear: 10,
      },
      // ── יום 11 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "רגשות קשים יכולים להזמין שיחה, הפסקה או עזרה — ולא תמיד נכון להתמודד איתם יחד. בטיחות והסכמה קודמות לעומק.",
        category: "אינטימיות רגשית",
        dayOfYear: 11,
      },
      {
        type: "quote",
        content: "היכרות אינה תהליך שניתן לשלוט בו במלואו. אפשר ליצור הזדמנויות בלי להפוך כל מפגש לסימן או הבטחה.",
        category: "פגישות",
        dayOfYear: 11,
      },
      {
        type: "challenge",
        content: "אם מתאים, בחר/י מצב חברתי אחד מהיום: מה קרה בפועל, מה היה נעים, ומה אולי תרצה/י לנסות אחרת — בלי לתת לעצמך ציון.",
        category: "חשיבה חיובית",
        dayOfYear: 11,
      },
      // ── יום 12 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "בבקשה אפשר לשלב עובדה מסוימת, רגש וצורך: 'כשלא דיברנו השבוע הרגשתי בדידות; מתאים לקבוע זמן?' שפת 'אני' אינה מוחקת את מה שהאדם האחר עשה.",
        category: "תקשורת",
        dayOfYear: 12,
      },
      {
        type: "quote",
        content: "קשר יכול לכלול רגש, אחריות ומעשים — לצד חופש בחירה, גבולות וזכות לסיים.",
        category: "מחויבות",
        dayOfYear: 12,
      },
      {
        type: "challenge",
        content: "אם השיחה בטוחה, נסו לתאר עובדה מסוימת, את השפעתה ובקשה אפשרית. אם הקול עולה או יש פחד, אפשר לעצור; אין חובה לפתור היום.",
        category: "ניהול קונפליקטים",
        dayOfYear: 12,
      },
      // ── יום 13 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כדי להעמיק שיחה, אפשר לבקש רשות לפני שאלה אישית ולהציע שאלה קלה יחסית. חשיפה אינה חובה ואינה קיצור דרך לאינטימיות.",
        category: "אינטימיות",
        dayOfYear: 13,
      },
      {
        type: "quote",
        content: "הקשבה יכולה לתת מקום לחוויה של אדם אחר בלי להניח שאנחנו מבינים אותה לגמרי.",
        category: "הקשבה",
        dayOfYear: 13,
      },
      {
        type: "challenge",
        content: "אם מתאים, בקש/י רשות לשאלה מעט אישית יותר. קבל/י דילוג, שינוי נושא או תשובה קצרה בלי ללחוץ.",
        category: "פגיעות",
        dayOfYear: 13,
      },
      // ── יום 14 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "ביטחון עצמי אינו שלמות ואינו תנאי למשיכה. אפשר לתרגל יחס פחות שיפוטי לעצמך בלי לצפות לתגובה מאנשים אחרים.",
        category: "ביטחון עצמי",
        dayOfYear: 14,
      },
      {
        type: "quote",
        content: "הקשר עם עצמך חשוב, וגם קשרים עם אחרים ותמיכה קהילתית יכולים להיות משמעותיים. אין דירוג אחד שמתאים לכולם.",
        category: "חמלה עצמית",
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
        content: "בדייטינג קל לפעמים להתאים את עצמנו לציפיות. נסו לדייק מי אתם ומה הגבולות שלכם, בלי לחשוף יותר ממה שנוח ובלי הבטחה לקשר.",
        category: "אותנטיות",
        dayOfYear: 15,
      },
      {
        type: "quote",
        content: "במחלוקת יכולות להיות כמה נקודות מבט, אך הנזק והאחריות אינם תמיד שווים. בדקו עובדות, השפעה, גבולות ובטיחות.",
        category: "ניהול קונפליקטים",
        dayOfYear: 15,
      },
      {
        type: "challenge",
        content: "כשמישהו משתף בבעיה, אפשר לשאול אם הוא רוצה הקשבה, שאלה, עצה או מרחב. אל תניחו ששאלה עמוקה מתאימה בכל רגע.",
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
        content: "בחר/י, רק אם מתאים, צעד חברתי קטן שאינו מפר גבול. תכנן/י מראש איך לקבל 'לא', היסוס או היעדר תגובה ולעצור.",
        category: "ביטחון עצמי",
        dayOfYear: 16,
      },
      // ── יום 17 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "'שפות אהבה' הן מסגרת פופולרית לשיחה על העדפות, לא אבחון או סוג קבוע. שאלו מה מתאים עכשיו; מגע דורש הסכמה בכל פעם.",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      {
        type: "quote",
        content: "אפשר לשאול אדם קרוב איזו תמיכה נעימה לו, ולחפש פעולה שגם נותן/ת התמיכה רוצה ויכול/ה לתת.",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      {
        type: "challenge",
        content: "בחר/י העדפה אחת לתמיכה ושאל/י אדם קרוב מה מתאים לו כרגע. אין חובה לפעול, וכל מגע מחייב הסכמה מפורשת.",
        category: "שפות אהבה",
        dayOfYear: 17,
      },
      // ── יום 18 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "בדייט ראשון, אפשר להציע שאלות פתוחות ולא רגישות ולתת אפשרות לדלג. שאלות על ילדות, משפחה או טראומה אינן נדרשות לקרבה.",
        category: "דייטינג",
        dayOfYear: 18,
      },
      {
        type: "quote",
        content: "עקביות ואמינות יכולות לתרום לאמון. הן נבחנות לאורך זמן ואינן מחייבות להישאר בקשר שאינו בטוח או מתאים.",
        category: "אמינות",
        dayOfYear: 18,
      },
      {
        type: "challenge",
        content: "אם תרצה/י, הכינו 2-3 שאלות קלות שמזמינות שיחה בלי לחקור. קבלו תשובה קצרה, דילוג או שינוי נושא.",
        category: "דייטינג",
        dayOfYear: 18,
      },
      // ── יום 19 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כשעולה כעס, ואם בטוח לעשות זאת, אפשר לעצור לפני תגובה ולבחור מתי להמשיך. כעס הוא מידע; הוא אינו פוטר מאחריות ואינו מבטל עובדות.",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      {
        type: "quote",
        content: "כשאפשר ובטוח, עצירה קצרה לפני תגובה יכולה לפתוח עוד אפשרויות פעולה.",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      {
        type: "challenge",
        content: "אם נשימה ממוקדת נעימה ובטוחה לך, נסה/י להאריך מעט את הנשיפה בלי לעצור בכוח. אם יש סחרחורת או אי-נוחות — מפסיקים.",
        category: "ניהול רגשות",
        dayOfYear: 19,
      },
      // ── יום 20 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "קשר יכול לכלול תמיכה ותלות הדדית לצד מרחב אישי. הצרכים משתנים, והמטרה אינה להיות 'עצמאיים לגמרי' אלא לדבר על חלוקת התמיכה והגבולות.",
        category: "עצמאות רגשית",
        dayOfYear: 20,
      },
      {
        type: "quote",
        content: "אנשים אינם צריכים להיות 'שלמים' או נטולי צורך כדי להיות ראויים לקשר. שותפות יכולה לכלול תמיכה, עצמאות ותלות הדדית.",
        category: "בריאות זוגית",
        dayOfYear: 20,
      },
      {
        type: "challenge",
        content: "אם מתאים ונגיש, הקדש/י זמן קצר לפעילות שבחרת — לבד או עם אדם תומך. עצמאות אינה מחייבת לעשות הכול לבד.",
        category: "עצמאות רגשית",
        dayOfYear: 20,
      },
      // ── יום 21 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "קרבה יכולה להיבנות גם מרגעים יומיומיים קטנים. בחרו יחד ריטואל שמתאים לשניכם; מגע כמו החזקת ידיים דורש הסכמה.",
        category: "אינטימיות",
        dayOfYear: 21,
      },
      {
        type: "quote",
        content: "קרבה יכולה להרגיש כמו בית, ובכל זאת כל אדם נשאר בעל מרחב, קשרים ובחירות משלו.",
        category: "זוגיות",
        dayOfYear: 21,
      },
      {
        type: "challenge",
        content: "אם מתאים לשניכם, הציעו ריטואל קטן וגמיש — למשל הודעה, קפה או זמן שקט. בדקו שהוא רצוי ולא חובה יומית.",
        category: "אינטימיות",
        dayOfYear: 21,
      },
      // ── יום 22 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "כשמישהו משתף ברגש קשה, אפשר להכיר במה ששמעת ואז לשאול אם רצויה עזרה. אל תניח/י מה הוא מרגיש ואל תמהר/י לפתרון.",
        category: "תמיכה רגשית",
        dayOfYear: 22,
      },
      {
        type: "quote",
        content: "אמפתיה אינה מחייבת הסכמה או הבנה מלאה; היא יכולה להתחיל בהקשבה ובבדיקה אם הבנו נכון.",
        category: "אמפתיה",
        dayOfYear: 22,
      },
      {
        type: "challenge",
        content: "כשמישהו משתף בקושי, אפשר לשאול: 'רוצה הקשבה, שאלה, עזרה מעשית או קצת מרחב?' קבלו גם בחירה לא להמשיך.",
        category: "תמיכה רגשית",
        dayOfYear: 22,
      },
      // ── יום 23 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אם השיחה בטוחה אך מציפה, אפשר לבקש הפסקה ולבדוק אם ומתי לחזור. אין חובה לחזור לשיחה מסוכנת או לסיים ויכוח באותו יום.",
        category: "ניהול קונפליקטים",
        dayOfYear: 23,
      },
      {
        type: "quote",
        content: "אפשר לבחור מתי ואיך לבטא רגש או מחשבה. דחייה לזמן מתאים אינה הכחשה, ופרטיות אינה חוסר כנות.",
        category: "שליטה עצמית",
        dayOfYear: 23,
      },
      {
        type: "challenge",
        content: "זהה/י נושא שמפעיל אותך. כתוב/י מה קורה בגוף ובמחשבה ואיזה צורך אולי קשור לכך, בלי להניח שיש סיבה אחת נסתרת.",
        category: "ניהול רגשות",
        dayOfYear: 23,
      },
      // ── יום 24 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "צמיחה, חלומות וחוויות חדשות יכולים להיות טובים בפני עצמם. אין חובה להשתנות כדי להישאר אטרקטיביים או לזכות באהבה.",
        category: "משיכה",
        dayOfYear: 24,
      },
      {
        type: "quote",
        content: "מחויבות היא בחירה מתמשכת של שני הצדדים, לא חובה להישאר בכל מחיר. מותר לשנות גבול או לסיים קשר.",
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
        content: "הבעת תודה ספציפית עשויה להיות נעימה כשהיא כנה. היא אינה חובה יומית ואינה תחליף לשיחה על פגיעה או צורך שלא נענה.",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      {
        type: "quote",
        content: "הכרת תודה יכולה להפנות תשומת לב למה שמועיל, בלי למחוק קושי או להחליף צורך בשינוי.",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      {
        type: "challenge",
        content: "אם מתאים, אמרו תודה ספציפית לאדם אחד — בלי להפוך את התרגיל למכסה או לחובה חברתית.",
        category: "הכרת תודה",
        dayOfYear: 25,
      },
      // ── יום 26 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "אפשר להראות אכפתיות בשאלה על דבר שאדם בחר לשתף. כבדו גם תשובה קצרה, פרטיות או בחירה לא לחזור לנושא.",
        category: "אכפתיות",
        dayOfYear: 26,
      },
      {
        type: "quote",
        content: "זכירת פרט שאדם שיתף יכולה לבטא תשומת לב, כל עוד לא משתמשים בה כדי לעקוב, ללחוץ או לבטל פרטיות.",
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
        content: "פחד מנטישה יכול להשפיע על תגובות, אבל הוא אינו אבחנה ואינו אומר שאתם 'דוחים אנשים'. נסו לזהות עובדה, רגש, צורך ובקשה שאינה לוחצת.",
        category: "ביטחון עצמי",
        dayOfYear: 27,
      },
      {
        type: "quote",
        content: "חרדה סביב קשר יכולה לנבוע מגורמים רבים. אין להסיק את מקורה ממשפט קצר; אפשר לתאר מה קורה ולבקש תמיכה מתאימה.",
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
        content: "פעילות שמעניינת אותך יכולה ליצור הזדמנויות למפגש, אך אינה מבטיחה חיבור. בחרו בה גם אם לא תוביל להיכרות.",
        category: "פגישות",
        dayOfYear: 28,
      },
      {
        type: "quote",
        content: "לא כל מפגש חייב לשאת מסר או להפוך לקשר. מותר לפגוש, לבחור, להיפרד ולהמשיך בלי לייצר משמעות כפויה.",
        category: "חיבורים",
        dayOfYear: 28,
      },
      {
        type: "challenge",
        content: "אם מתאים, בחנו פעולה אחת בשלב ההיכרות: האם היא נובעת מרצון, פחד או לחץ? אין חובה לשנות מיד; אפשר לבחור גבול או צעד קטן.",
        category: "אותנטיות",
        dayOfYear: 28,
      },
      // ── יום 29 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "מרחב אישי יכול לכלול זמן לבד, תחביבים או קשרים נוספים, במינון שמשתנה בין אנשים. קרבה אינה מחייבת מיזוג או בידוד.",
        category: "גבולות בריאים",
        dayOfYear: 29,
      },
      {
        type: "quote",
        content: "מרחב אישי הוא צורך לגיטימי, לא טקטיקה שגורמת לאדם לחזור. דברו על הקצב והקשר בלי הבטחה לתוצאה.",
        category: "מרחב אישי",
        dayOfYear: 29,
      },
      {
        type: "challenge",
        content: "אם מתאפשר, תכנן/י זמן קצר שמתאים לצרכים שלך. הוא יכול להיות עם או בלי טלפון, לבד או עם תמיכה; אין צורה אחת של טיפול עצמי.",
        category: "טיפול עצמי",
        dayOfYear: 29,
      },
      // ── יום 30 ─────────────────────────────────────────────────────────────
      {
        type: "tip",
        content: "מחלוקת מכבדת ותיקון יכולים להיות חלק מקשר, אך לא כל קונפליקט פתיר ולא כל קשר צריך להימשך. בטיחות והסכמה קודמות לחזרה לשיחה.",
        category: "ניהול קונפליקטים",
        dayOfYear: 30,
      },
      {
        type: "quote",
        content: "שינוי יכול להתחיל בצעד קטן שבחרתם, וגם עצירה או בקשת עזרה הן צעדים.",
        category: "התחלות",
        dayOfYear: 30,
      },
      {
        type: "challenge",
        content: "התבונן/י ב-30 הימים האחרונים: האם למדת משהו, האם משהו השתנה, ומה תרצה/י לקחת הלאה? גם 'לא השתנה דבר' היא תשובה תקפה.",
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
    assertSeedAllowed("seedDailyContentInternal");
    const existing = await ctx.db.query("dailyContent").first();
    if (existing) return { message: "תוכן יומי כבר קיים", count: 0 };
    // Delegate to seed logic
    return { message: "Use seedDailyContent mutation instead", count: 0 };
  },
});
