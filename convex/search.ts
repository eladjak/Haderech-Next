import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── Known Tools (static list matching tools page) ───────────────────────────

const KNOWN_TOOLS = [
  {
    id: "profile-builder",
    title: "בונה ביו מקומי",
    description:
      "שלוש טיוטות עריכות שנוצרות בדפדפן; הפרטים אינם נשלחים לספק AI.",
    href: "/tools/profile-builder",
  },
  {
    id: "photo-analyzer",
    title: "משוב על תמונות — לא זמין",
    description:
      "כלי עתידי בלבד; לא נאספות תמונות ואין כרגע ניתוח או דירוג.",
    href: "/tools/photo-analyzer",
  },
  {
    id: "date-planner",
    title: "מתכנן דייטים — לא זמין",
    description:
      "קבל המלצות מותאמות אישית לדייט - מיקום, פעילות, שעה, ואווירה.",
    href: "/tools/date-planner",
  },
  {
    id: "date-report",
    title: "רפלקציה אחרי דייט",
    description:
      "כלי עתידי לשאלות רפלקציה אוטומטיות. הוא לא יאבחן, לא יקבע כוונות ולא יחליף איש מקצוע.",
    href: "/tools/date-report",
  },
  {
    id: "conversation-starters",
    title: "פותחי שיחה מקומיים",
    description:
      "מאגר ניסוחים שנכתב מראש לפי סיטואציה וטון; אינו שולח טקסט לספק AI.",
    href: "/tools/conversation-starters",
  },
  {
    id: "values-quiz",
    title: "תרגיל רפלקציה על ערכים",
    description:
      "סיכום פשוט של העדפות שסימנת כרגע; אינו מבחן התאמה או אבחון.",
    href: "/tools/values-quiz",
  },
  {
    id: "chat-coach",
    title: "כלי AI לרפלקציה",
    description:
      "משוב אוטומטי מוגבל המבוסס על תכני הקורס; עלול לטעות ואינו איש מקצוע.",
    href: "/chat",
  },
  {
    id: "simulator",
    title: "תרגול שיחה בדיוני",
    description:
      "תרגל ניסוחים עם דמות AI בדיונית וקבל משוב אוטומטי מוגבל; אינו ציון או חיזוי של אדם אמיתי.",
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
