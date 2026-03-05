import { internalMutation } from "./_generated/server";

/**
 * Seed Reviews - HaDerech Learning Platform
 *
 * Seeds 15 realistic Hebrew reviews across courses.
 * Run via Convex dashboard: internal.seedReviews.seedReviews
 */

const FAKE_REVIEWERS = [
  { name: "אלי כהן", email: "eli.cohen@example.com" },
  { name: "מיכל לוי", email: "michal.levi@example.com" },
  { name: "דני אברהמי", email: "dani.abrahami@example.com" },
  { name: "שרה מזרחי", email: "sara.mizrahi@example.com" },
  { name: "יוסי פרץ", email: "yosi.peretz@example.com" },
  { name: "רחל ברוך", email: "rachel.baruch@example.com" },
  { name: "אמיר שפירא", email: "amir.shapira@example.com" },
  { name: "לילך נחמן", email: "lilach.nachman@example.com" },
  { name: "גיל הרצוג", email: "gil.herzog@example.com" },
  { name: "נועה גולן", email: "noa.golan@example.com" },
  { name: "עמית ביטון", email: "amit.biton@example.com" },
  { name: "תמר שלום", email: "tamar.shalom@example.com" },
  { name: "רון אוחיון", email: "ron.ohion@example.com" },
  { name: "הדר אלקיים", email: "hadar.elkayam@example.com" },
  { name: "ניר פינקלשטיין", email: "nir.finkelstein@example.com" },
];

const REVIEWS_DATA = [
  // קורס 1 - ביקורות
  {
    reviewerIndex: 0,
    courseIndex: 0,
    rating: 5,
    title: "קורס שינה את חיי לגמרי",
    content:
      "הייתי סקפטי בהתחלה, אבל לאחר השיעורים הראשונים הבנתי שמדובר בתוכן מעמיק ומקצועי באמת. הכלים שקיבלתי שיפרו את הדרך שבה אני מתייחס לשותפים פוטנציאליים. ממליץ בחום לכל מי שרוצה לשפר את חיי הדייטינג שלו.",
    wouldRecommend: true,
    daysAgo: 5,
  },
  {
    reviewerIndex: 1,
    courseIndex: 0,
    rating: 5,
    title: "הכי טוב שהשקעתי בעצמי",
    content:
      "אחרי שנים של דייטינג מתסכל, מצאתי כאן תשובות אמיתיות. ההסברים פשוטים אבל עמוקים, והדוגמאות מהחיים עוזרות להבין את הרעיונות. כבר ביישמתי כמה מהטכניקות ואני רואה הבדל עצום בשיחות שלי.",
    wouldRecommend: true,
    daysAgo: 12,
  },
  {
    reviewerIndex: 2,
    courseIndex: 0,
    rating: 4,
    title: "תוכן מצוין עם הרבה עומק",
    content:
      "הקורס מכסה את הנושאים החשובים בצורה מקצועית. לפעמים הקצב קצת מהיר אבל אפשר תמיד לחזור ולראות שוב. מומלץ לכל מי שרציני לגבי שיפור הקשרים האישיים שלו.",
    wouldRecommend: true,
    daysAgo: 20,
  },
  {
    reviewerIndex: 3,
    courseIndex: 0,
    rating: 5,
    title: "פשוט מדהים - שינה את הפרספקטיבה שלי",
    content:
      "לא חשבתי שאפשר ללמוד כל כך הרבה על עצמי ועל הדרך שבה אני מנהל מערכות יחסים. הקורס נותן כלים מעשיים שאפשר ליישם מיד. אחרי השיעורים האחרים הרגשתי בטוח יותר וידעתי בדיוק מה לעשות בפגישות הבאות.",
    wouldRecommend: true,
    daysAgo: 35,
  },
  {
    reviewerIndex: 4,
    courseIndex: 0,
    rating: 4,
    title: "כלים מעשיים שעובדים",
    content:
      "מה שמיוחד בקורס הזה הוא שהוא לא תיאורטי בלבד. כל שיעור מסתיים בתרגיל מעשי שאפשר לעשות בחיים האמיתיים. כבר ראיתי שיפור בביטחון העצמי שלי ובדרך שבה אני מתקשר עם נשים.",
    wouldRecommend: true,
    daysAgo: 50,
  },
  // קורס 2 - ביקורות
  {
    reviewerIndex: 5,
    courseIndex: 1,
    rating: 5,
    title: "קורס מחייב לכל מי שמחפש קשר אמיתי",
    content:
      "הקורס הזה לימד אותי את ההבדל בין משיכה שטחית לבין חיבור עמוק. ההסברים מבוססים על פסיכולוגיה אמיתית ולא על טריקים זולים. כבר הצלחתי ליצור מערכת יחסים יציבה ומשמעותית הרבה יותר.",
    wouldRecommend: true,
    daysAgo: 8,
  },
  {
    reviewerIndex: 6,
    courseIndex: 1,
    rating: 5,
    title: "עמוק, מקצועי ומשנה חיים",
    content:
      "הקורס הזה שונה מכל מה שראיתי בנושא. לא מדובר כאן בטריקים או מניפולציות, אלא בגישה אותנטית לבניית קשרים. מאוד אהבתי את חלק הגדרת ערכים וסינון שותפים.",
    wouldRecommend: true,
    daysAgo: 15,
  },
  {
    reviewerIndex: 7,
    courseIndex: 1,
    rating: 4,
    title: "ביצועים מצוינים, צריך קצת יותר תרגול",
    content:
      "התוכן מעמיק ומקצועי. הייתי רוצה קצת יותר תרגול מעשי ומשימות בין השיעורים, אבל בסך הכל זה קורס מצוין שנתן לי הרבה לחשוב עליו.",
    wouldRecommend: true,
    daysAgo: 30,
  },
  {
    reviewerIndex: 8,
    courseIndex: 1,
    rating: 3,
    title: "טוב אבל לא מה שציפיתי",
    content:
      "הקורס אמנם מקצועי, אבל הצפיתי לתוכן יותר מעשי. חלק מהשיעורים קצת ארוכים מדי ויכלו להיות יותר ממוקדים. בכל זאת למדתי דברים חשובים.",
    wouldRecommend: false,
    daysAgo: 45,
  },
  {
    reviewerIndex: 9,
    courseIndex: 1,
    rating: 5,
    title: "ההשקעה הכי טובה שעשיתי",
    content:
      "אני לא מי שרגיל לכתוב ביקורות, אבל הקורס הזה היה כל כך טוב שהרגשתי שחייב לשתף. השינוי בגישה שלי לדייטינג היה דרמטי. עכשיו אני מתקרב לכל פגישה עם ביטחון ובגרות.",
    wouldRecommend: true,
    daysAgo: 60,
  },
  // קורס 3 - ביקורות
  {
    reviewerIndex: 10,
    courseIndex: 2,
    rating: 5,
    title: "חוויה מעמיקה ומשנה תפיסה",
    content:
      "הקורס הזה חשף בפני דפוסים שחזרו על עצמם בכל הקשרים שלי. הבנה עצמית זו היא הבסיס לשינוי אמיתי. ממליץ לכל מי שמרגיש שהוא חוזר על אותן טעויות בדייטינג.",
    wouldRecommend: true,
    daysAgo: 7,
  },
  {
    reviewerIndex: 11,
    courseIndex: 2,
    rating: 4,
    title: "מקצועי ומעשיר",
    content:
      "קורס איכותי עם תוכן עשיר. הסרטונים מפוקים היטב וההסברים ברורים. מצאתי את עצמי לוקח הרבה הערות ומיישם בחיי היום יום.",
    wouldRecommend: true,
    daysAgo: 18,
  },
  {
    reviewerIndex: 12,
    courseIndex: 2,
    rating: 5,
    title: "אחד הקורסים הטובים שלמדתי בחיים",
    content:
      "לא רק שהקורס לימד אותי על דייטינג, הוא לימד אותי על עצמי. ההבנה של התגובות שלי ושל הצרכים שלי שינתה את הדרך שבה אני ניגש לקשרים. תודה!",
    wouldRecommend: true,
    daysAgo: 25,
  },
  {
    reviewerIndex: 13,
    courseIndex: 2,
    rating: 4,
    title: "מומלץ לכל מי שרוצה לשפר את עצמו",
    content:
      "הקורס נותן כלים מעשיים לשיפור הדייטינג ואת ההבנה של מה שאתה מחפש. תוכן מעמיק שצריך לעבד לאט. ממליץ לעשות את השיעורים בקצב איטי ולתת לעצמך זמן לעכל.",
    wouldRecommend: true,
    daysAgo: 40,
  },
  {
    reviewerIndex: 14,
    courseIndex: 2,
    rating: 3,
    title: "טוב אבל רציתי יותר",
    content:
      "הקורס מקצועי ומכסה נושאים חשובים, אבל היה לי קשה לשמור על קשב לאורך כל השיעורים. חלק מהתוכן חזר על עצמו. בסך הכל שווה לעשות אבל הייתי מצפה ליותר תוכן חדשני.",
    wouldRecommend: false,
    daysAgo: 55,
  },
];

export const seedReviews = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all published courses
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    if (courses.length === 0) {
      return { message: "No published courses found. Please seed courses first." };
    }

    const now = Date.now();
    let inserted = 0;

    for (const reviewData of REVIEWS_DATA) {
      const course = courses[reviewData.courseIndex % courses.length];
      if (!course) continue;

      const reviewer = FAKE_REVIEWERS[reviewData.reviewerIndex];
      if (!reviewer) continue;

      // Create or get fake user
      let fakeUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", reviewer.email))
        .unique();

      if (!fakeUser) {
        const userId = await ctx.db.insert("users", {
          clerkId: `seed_reviewer_${reviewData.reviewerIndex}`,
          email: reviewer.email,
          name: reviewer.name,
          role: "student",
          createdAt: now,
          updatedAt: now,
        });
        fakeUser = await ctx.db.get(userId);
      }

      if (!fakeUser) continue;

      // Check if review already exists
      const existing = await ctx.db
        .query("courseReviews")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", fakeUser!._id).eq("courseId", course._id)
        )
        .unique();

      if (existing) continue;

      // Ensure fake enrollment
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", fakeUser!._id).eq("courseId", course._id)
        )
        .unique();

      if (!enrollment) {
        await ctx.db.insert("enrollments", {
          userId: fakeUser._id,
          courseId: course._id,
          enrolledAt: now - reviewData.daysAgo * 24 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000,
        });
      }

      const createdAt = now - reviewData.daysAgo * 24 * 60 * 60 * 1000;

      await ctx.db.insert("courseReviews", {
        userId: fakeUser._id,
        courseId: course._id,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        wouldRecommend: reviewData.wouldRecommend,
        helpful: Math.floor(Math.random() * 15),
        createdAt,
        updatedAt: createdAt,
      });

      inserted++;
    }

    return { message: `Seeded ${inserted} reviews successfully.` };
  },
});
