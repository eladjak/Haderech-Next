import { query } from "./_generated/server";

// ==========================================
// Student Analytics - Phase 39
// Aggregated overview for the student dashboard
// ==========================================

// Helper: resolve user from auth identity
async function resolveUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return user ? { user, identity } : null;
}

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

// ==========================================
// Continue Learning - auth-based
// Returns the most recent in-progress course + next lesson
// ==========================================

export const getContinueLearning = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    if (enrollments.length === 0) return null;

    const candidates = [];

    for (const enrollment of enrollments) {
      const course = await ctx.db.get(enrollment.courseId);
      if (!course) continue;

      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_course_order", (q: any) =>
          q.eq("courseId", enrollment.courseId)
        )
        .order("asc")
        .collect();

      const publishedLessons = lessons.filter((l: any) => l.published);
      if (publishedLessons.length === 0) continue;

      const progress = await ctx.db
        .query("progress")
        .withIndex("by_user_course", (q: any) =>
          q.eq("userId", user._id).eq("courseId", enrollment.courseId)
        )
        .collect();

      const completedIds = new Set(
        progress.filter((p: any) => p.completed).map((p: any) => p.lessonId)
      );

      const completedCount = completedIds.size;
      const percent =
        publishedLessons.length > 0
          ? Math.round((completedCount / publishedLessons.length) * 100)
          : 0;

      // Skip fully completed courses
      if (percent === 100) continue;

      const nextLesson = publishedLessons.find(
        (l: any) => !completedIds.has(l._id)
      );
      if (!nextLesson) continue;

      const lastActivity =
        progress.length > 0
          ? Math.max(...progress.map((p: any) => p.lastWatchedAt))
          : enrollment.enrolledAt;

      candidates.push({
        courseId: enrollment.courseId as string,
        courseName: course.title,
        lastLesson: {
          _id: nextLesson._id as string,
          title: nextLesson.title,
        },
        progressPercent: percent,
        lastActivity,
      });
    }

    if (candidates.length === 0) return null;

    // Prefer in-progress over not-started, then most recent activity
    const inProgress = candidates
      .filter((c) => c.progressPercent > 0)
      .sort((a, b) => b.lastActivity - a.lastActivity);

    const notStarted = candidates
      .filter((c) => c.progressPercent === 0)
      .sort((a, b) => b.lastActivity - a.lastActivity);

    return inProgress.length > 0 ? inProgress[0] : notStarted[0];
  },
});

// ==========================================
// Weekly Goal - auth-based
// Returns weekly learning stats + streak
// ==========================================

export const getWeeklyGoal = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    // User's weekly goal from preferences (default: 5 hours)
    const weeklyGoalHours = user.preferences?.learning?.weeklyGoal ?? 5;

    // Progress entries from the last 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    // Sum watch time this week
    let weeklyWatchTimeSeconds = 0;
    const activeDaysSet = new Set<string>();

    for (const p of allProgress) {
      if (p.lastWatchedAt > weekAgo) {
        weeklyWatchTimeSeconds += p.watchTimeSeconds || 0;
        const date = new Date(p.lastWatchedAt);
        activeDaysSet.add(
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        );
      }
    }

    const weeklyHoursLearned = Math.round((weeklyWatchTimeSeconds / 3600) * 10) / 10;
    const goalPercent = weeklyGoalHours > 0
      ? Math.min(Math.round((weeklyHoursLearned / weeklyGoalHours) * 100), 100)
      : 0;

    // Streak calculation
    const allActiveDays = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      allActiveDays.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    let currentStreak = 0;
    const isActiveToday = allActiveDays.has(todayKey);
    const isActiveYesterday = allActiveDays.has(yesterdayKey);

    if (isActiveToday || isActiveYesterday) {
      currentStreak = 1;
      const checkDate = isActiveToday ? today : yesterday;
      for (let i = 1; i <= allActiveDays.size; i++) {
        const prevDate = new Date(checkDate.getTime() - 86400000 * i);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
        if (allActiveDays.has(prevKey)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      weeklyGoalHours,
      weeklyHoursLearned,
      goalPercent,
      activeDaysThisWeek: activeDaysSet.size,
      currentStreak,
    };
  },
});

// ==========================================
// Recommended Courses - auth-based
// Returns published courses the user is NOT enrolled in
// ==========================================

export const getRecommendedCourses = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const enrolledCourseIds = new Set(
      enrollments.map((e: any) => e.courseId as string)
    );

    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_published", (q: any) => q.eq("published", true))
      .order("asc")
      .collect();

    const recommended = [];

    for (const course of allCourses) {
      if (enrolledCourseIds.has(course._id as string)) continue;

      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q: any) => q.eq("courseId", course._id))
        .collect();
      const publishedLessons = lessons.filter((l: any) => l.published);

      recommended.push({
        _id: course._id as string,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl ?? null,
        lessonCount: publishedLessons.length,
        level: course.level ?? null,
        category: course.category ?? null,
        estimatedHours: course.estimatedHours ?? null,
      });

      if (recommended.length >= 3) break;
    }

    return recommended;
  },
});
