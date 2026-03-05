import { query } from "./_generated/server";

// ==========================================
// Student Analytics - Phase 39
// Aggregated overview for the student dashboard
// ==========================================

export const getStudentOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // Enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Progress
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedLessons = progress.filter((p) => p.completed).length;
    const totalWatchTime = progress.reduce(
      (sum, p) => sum + (p.watchTimeSeconds || 0),
      0
    );

    // XP from xpEvents table
    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const totalXp = xpEvents.reduce((sum, e) => sum + e.points, 0);

    // Badges from userBadges table
    const badges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Certificates
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Chat sessions (userId is Clerk subject string)
    const allChatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Simulator sessions (userId is Clerk subject string)
    const allSimSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Weekly activity (last 7 days progress entries)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const dayNames = [
      "ראשון",
      "שני",
      "שלישי",
      "רביעי",
      "חמישי",
      "שישי",
      "שבת",
    ];
    const weeklyActivity: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const day = dayNames[date.getDay()] ?? "";
      weeklyActivity[day] = 0;
    }
    for (const p of progress) {
      if (p.lastWatchedAt > weekAgo) {
        const date = new Date(p.lastWatchedAt);
        const day = dayNames[date.getDay()] ?? "";
        if (weeklyActivity[day] !== undefined) {
          weeklyActivity[day]++;
        }
      }
    }

    // Current course progress
    const courseProgress = [];
    for (const enrollment of enrollments) {
      const course = await ctx.db.get(enrollment.courseId);
      if (!course) continue;

      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect();

      const courseP = progress.filter((p) => p.courseId === course._id);
      const completed = courseP.filter((p) => p.completed).length;
      const percent =
        lessons.length > 0
          ? Math.round((completed / lessons.length) * 100)
          : 0;

      courseProgress.push({
        courseId: course._id,
        title: course.title,
        totalLessons: lessons.length,
        completedLessons: completed,
        percent,
        lastActivity: Math.max(...courseP.map((p) => p.lastWatchedAt), 0),
      });
    }

    // Recent XP events (last 5)
    const recentXpEvents = xpEvents
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // Total lessons across all courses
    let totalLessonsCount = 0;
    for (const enrollment of enrollments) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
        .collect();
      totalLessonsCount += lessons.length;
    }

    return {
      enrollments: enrollments.length,
      completedLessons,
      totalLessons: totalLessonsCount,
      totalWatchTime,
      totalXp,
      level: Math.floor(totalXp / 100) + 1,
      xpInCurrentLevel: totalXp % 100,
      xpNeededForNextLevel: 100,
      badgeCount: badges.length,
      certificateCount: certificates.length,
      chatSessionCount: allChatSessions.length,
      simSessionCount: allSimSessions.length,
      weeklyActivity,
      courseProgress: courseProgress.sort(
        (a, b) => b.lastActivity - a.lastActivity
      ),
      recentXpEvents,
    };
  },
});
