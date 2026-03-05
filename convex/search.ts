import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── Known Tools (static list matching tools page) ───────────────────────────

const KNOWN_TOOLS = [
  {
    id: "profile-builder",
    title: "בונה הפרופיל",
    description:
      "AI כותב לך ביו מקצועי לפרופיל דייטינג - מותאם לפלטפורמה, לאישיות שלך ולמה שאתה מחפש.",
    href: "/tools/profile-builder",
  },
  {
    id: "photo-analyzer",
    title: "ניתוח תמונות",
    description:
      "AI שמנתח את התמונות שלך ונותן טיפים לשיפור - זוויות, תאורה, ביטוי, לבוש.",
    href: "/tools/photo-analyzer",
  },
  {
    id: "date-planner",
    title: "מתכנן דייטים",
    description:
      "קבל המלצות מותאמות אישית לדייט - מיקום, פעילות, שעה, ואווירה.",
    href: "/tools/date-planner",
  },
  {
    id: "date-report",
    title: "ניתוח דייט",
    description:
      "אחרי כל דייט, ספר ל-AI מה קרה וקבל ניתוח מקצועי עם נקודות חוזק ושיפור.",
    href: "/tools/date-report",
  },
  {
    id: "conversation-starters",
    title: "פותחי שיחה",
    description:
      "AI מייצר פותחי שיחה מותאמים למצב - דייט ראשון, אפליקציה, מפגש חברתי.",
    href: "/tools/conversation-starters",
  },
  {
    id: "values-quiz",
    title: "מבחן ערכים",
    description:
      "גלה את הערכים הכי חשובים לך בזוגיות ומה חיוני שיהיה משותף עם הפרטנר.",
    href: "/tools/values-quiz",
  },
  {
    id: "chat-coach",
    title: "צ'אט AI מאמן",
    description:
      "שוחח עם מאמן דייטינג מבוסס AI - קבל ייעוץ, תרגול שיחות וניתוח מצבים.",
    href: "/chat",
  },
  {
    id: "simulator",
    title: "סימולטור דייטים",
    description:
      "תרגל דייטים עם דמויות AI מגוונות וקבל משוב מפורט על הביצועים שלך.",
    href: "/simulator",
  },
];

// ─── Global Search Query ─────────────────────────────────────────────────────

/** חיפוש גלובלי - קורסים, שיעורים, מאמרים, כלים */
export const globalSearch = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return { courses: [], lessons: [], blogPosts: [], tools: [] };
    }

    // ── Search Courses ──────────────────────────────────────────────────────
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const matchedCourses = allCourses
      .filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm) ||
          c.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .map((c) => ({
        _id: c._id,
        title: c.title,
        description: c.description,
        category: c.category ?? null,
        level: c.level ?? null,
      }));

    // ── Search Lessons ──────────────────────────────────────────────────────
    const allLessons = await ctx.db.query("lessons").collect();
    const publishedLessons = allLessons.filter((l) => l.published);

    const matchedLessons = publishedLessons
      .filter((l) => l.title.toLowerCase().includes(searchTerm))
      .slice(0, 5);

    // Enrich lessons with course names
    const lessonsWithCourse = await Promise.all(
      matchedLessons.map(async (l) => {
        const course = await ctx.db.get(l.courseId);
        return {
          _id: l._id,
          title: l.title,
          courseId: l.courseId,
          courseName: course?.title ?? "",
        };
      })
    );

    // ── Search Blog Posts ───────────────────────────────────────────────────
    const allPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const matchedPosts = allPosts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.content.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdAt: p.createdAt,
      }));

    // ── Search Tools (static list) ──────────────────────────────────────────
    const matchedTools = KNOWN_TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm)
    ).slice(0, 5);

    return {
      courses: matchedCourses,
      lessons: lessonsWithCourse,
      blogPosts: matchedPosts,
      tools: matchedTools,
    };
  },
});
