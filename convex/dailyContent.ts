import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns day-of-year for a given Date (1–365/366) */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** מחזיר את התוכן של היום לפי יום השנה (מסתובב מדי שנה) */
export const getTodayContent = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const dayOfYear = getDayOfYear(today);

    // Try exact day match first
    const exact = await ctx.db
      .query("dailyContent")
      .withIndex("by_day", (q) => q.eq("dayOfYear", dayOfYear))
      .first();

    if (exact) return exact;

    // Fallback: wrap around – pick any entry by modulo
    const all = await ctx.db.query("dailyContent").collect();
    if (all.length === 0) return null;
    const index = (dayOfYear - 1) % all.length;
    return all[index] ?? all[0];
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

/** זריעת 30 פריטי תוכן יומי בעברית (טיפים, ציטוטים, אתגרים) */
export const seedDailyContent = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if content already seeded
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
      // ── ימים 1-10: טיפים ──────────────────────────────────────────────────
      {
        type: "tip",
        content:
          "לפני כל דייט, קח רגע להיות עם עצמך. שאל את עצמך: מה אני מרגיש? מה אני מקווה שיקרה? נוכחות עצמית היא הבסיס לנוכחות כנה עם אחר.",
        category: "הכנה לדייט",
        dayOfYear: 1,
      },
      {
        type: "tip",
        content:
          "במקום לנסות לרשים, נסה להתעניין. שאל שאלות פתוחות שמגלות סקרנות אמיתית. אנשים זוכרים את מי שגרם להם להרגיש מעניינים, לא את מי שניסה להיות מעניין.",
        category: "שיחה",
        dayOfYear: 2,
      },
      {
        type: "tip",
        content:
          "אם אתה מרגיש חרדה חברתית, נסה את הטכניקה הזו: במקום 'איך אני נראה?' שאל 'מה אני יכול לתת לאדם הזה?' – זה מעביר את הפוקוס מפחד להדדיות.",
        category: "ביטחון עצמי",
        dayOfYear: 3,
      },
      {
        type: "tip",
        content:
          "הקשבה פעילה פירושה לא רק לשמוע מילים, אלא לזהות את הרגש שמאחוריהן. כשמישהו מספר לך על יומו, שאל את עצמך: מה הוא מרגיש עכשיו?",
        category: "תקשורת",
        dayOfYear: 4,
      },
      {
        type: "tip",
        content:
          "שפת הגוף מעבירה 55% מהמסר. שמור על קשר עין נטבעי (לא נעוץ), הישאר פתוח בתנוחת גוף, ונסה לסנכרן קצב נשימה עם האדם שמולך.",
        category: "שפת גוף",
        dayOfYear: 5,
      },
      {
        type: "tip",
        content:
          "אחרות מושכת. לא כדאי לנסות 'לנצח' ולהיות תמיד זמין. תן לאדם מולך מרחב לחשוב עלייך בינתיים.",
        category: "משיכה",
        dayOfYear: 6,
      },
      {
        type: "tip",
        content:
          "גבולות בריאים הם ביטוי לאהבה עצמית, לא דחייה. אמירת 'לא' ברגע הנכון מעידה על כנות ובגרות, ומושכת אנשים שמחפשים מערכת יחסים אמיתית.",
        category: "גבולות",
        dayOfYear: 7,
      },
      {
        type: "tip",
        content:
          "הומור הוא כלי מדהים, אבל הזמנה חשובה מהבדיחה. למד לקרוא את החדר – מתי להיות קל, מתי לעמוד ברצינות.",
        category: "שיחה",
        dayOfYear: 8,
      },
      {
        type: "tip",
        content:
          "אל תחפש את 'הסול-מייט' שלמ – חפש אדם שאתה מתפתח לצידו. זוגיות טובה היא פרויקט משותף של שני אנשים שמחליטים לגדול יחד.",
        category: "בחירת בן/בת זוג",
        dayOfYear: 9,
      },
      {
        type: "tip",
        content:
          "אחרי דייט, בדוק: האם שמחתי ברגע כשהוא/היא כתב/ה לי? האם השיחה זרמה? האם חשבתי עליו/עליה אחר כך? הרגשות שלך הם מצפן אמין.",
        category: "הכנה לדייט",
        dayOfYear: 10,
      },

      // ── ימים 11-20: ציטוטים ───────────────────────────────────────────────
      {
        type: "quote",
        content: "הדרך היחידה ל-love story הטובה – להיות מוכן לספר אותה בכנות.",
        author: "ברנה בראון",
        category: "אהבה",
        dayOfYear: 11,
      },
      {
        type: "quote",
        content:
          "אנחנו מקבלים את האהבה שאנחנו חושבים שאנחנו ראויים לה.",
        author: "סטיבן צ'בוסקי",
        category: "ערך עצמי",
        dayOfYear: 12,
      },
      {
        type: "quote",
        content:
          "פגיעות היא לא חולשה – היא האומץ הגדול ביותר שיש.",
        author: "ברנה בראון",
        category: "פגיעות",
        dayOfYear: 13,
      },
      {
        type: "quote",
        content:
          "אל תחפש אדם שישלים אותך, חפש אדם שיסייע לך להיות שלם יותר.",
        category: "בחירת בן/בת זוג",
        dayOfYear: 14,
      },
      {
        type: "quote",
        content:
          "זוגיות טובה לא קורית – היא נבנית, יום אחרי יום, בחירה אחרי בחירה.",
        category: "מערכת יחסים",
        dayOfYear: 15,
      },
      {
        type: "quote",
        content:
          "השיחה הכי חשובה שתנהל אי פעם היא זו עם עצמך.",
        category: "ביטחון עצמי",
        dayOfYear: 16,
      },
      {
        type: "quote",
        content:
          "כשאתה אוהב את עצמך, אתה מגדיר מה אהבה אמיתית נראית עבורך.",
        category: "אהבה עצמית",
        dayOfYear: 17,
      },
      {
        type: "quote",
        content:
          "הכי טוב שאני יכול להיות בשביל האחר הוא הגרסה הטובה ביותר של עצמי.",
        category: "התפתחות אישית",
        dayOfYear: 18,
      },
      {
        type: "quote",
        content:
          "לא תמיד תמצא את מי שמחפש אותך – לפעמים תיתקל בו.",
        category: "פגישות",
        dayOfYear: 19,
      },
      {
        type: "quote",
        content:
          "הסיכון הגדול ביותר הוא לא לקחת שום סיכון.",
        author: "מארק זאקרברג",
        category: "אומץ",
        dayOfYear: 20,
      },

      // ── ימים 21-30: אתגרים ────────────────────────────────────────────────
      {
        type: "challenge",
        content:
          "היום תן מחמאה כנה למישהו – לא על מראה, אלא על אופי, כישרון, או מאמץ. שים לב לתגובה.",
        category: "חיבור",
        dayOfYear: 21,
      },
      {
        type: "challenge",
        content:
          "כתוב 3 דברים שאתה אוהב בעצמך. לא הישגים – תכונות אופי. קרא אותם בקול.",
        category: "אהבה עצמית",
        dayOfYear: 22,
      },
      {
        type: "challenge",
        content:
          "שלח הודעה לאדם שלא דיברת איתו הרבה זמן רק כדי לשאול מה שלומו. ללא כוונות, ללא אג'נדה.",
        category: "חיבור",
        dayOfYear: 23,
      },
      {
        type: "challenge",
        content:
          "בשיחה הבאה שלך – הקשב 80% מהזמן, דבר 20%. ספר לשיחה מה למדת על האדם.",
        category: "הקשבה",
        dayOfYear: 24,
      },
      {
        type: "challenge",
        content:
          "נסח הודעת פתיחה לאפליקציית היכרויות שמבטאת סקרנות אמיתית כלפי הפרופיל של האדם, לא רק מחמאה כללית.",
        category: "אפליקציות היכרויות",
        dayOfYear: 25,
      },
      {
        type: "challenge",
        content:
          "היום, בכל שיחה שאתה מנהל – שמור על קשר עין טבעי. שים לב כמה פעמים אתה מוסח על ידי הטלפון.",
        category: "נוכחות",
        dayOfYear: 26,
      },
      {
        type: "challenge",
        content:
          "כתוב את הסיפור שאתה מספר לעצמך על כך שאתה לא מוצא זוגיות. עכשיו כתוב גרסה חיובית יותר של אותו סיפור.",
        category: "חשיבה חיובית",
        dayOfYear: 27,
      },
      {
        type: "challenge",
        content:
          "הזמן חבר טוב לפעילות חדשה שמעולם לא ניסית יחד. חוויות משותפות מחזקות קשרים.",
        category: "חברויות",
        dayOfYear: 28,
      },
      {
        type: "challenge",
        content:
          "הסתכל על הפרופיל שלך באפליקציית היכרויות מנקודת המבט של מישהו שלא מכיר אותך. האם הוא מציג את הגרסה הטובה ביותר שלך?",
        category: "אפליקציות היכרויות",
        dayOfYear: 29,
      },
      {
        type: "challenge",
        content:
          "בסוף היום, כתוב 3 מצבים חברתיים שניהלת היום. בכל אחד – מה הלך טוב, ומה תעשה אחרת?",
        category: "חשיבה חיובית",
        dayOfYear: 30,
      },
    ];

    let count = 0;
    for (const item of items) {
      await ctx.db.insert("dailyContent", { ...item, createdAt: now });
      count++;
    }

    return { message: `נוספו ${count} פריטי תוכן יומי בהצלחה`, count };
  },
});
