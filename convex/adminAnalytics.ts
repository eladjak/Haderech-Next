import { query } from "./_generated/server";
import { requireAdmin } from "./lib/authGuard";

// ─── Overview Stats ────────────────────────────────────────────────────────────

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    const newUsersThisWeek = users.filter((u) => u.createdAt > weekAgo).length;
    const newUsersLastWeek = users.filter(
      (u) => u.createdAt > twoWeeksAgo && u.createdAt <= weekAgo
    ).length;
    const activeUsers7d = users.filter((u) => u.updatedAt > weekAgo).length;

    const enrollments = await ctx.db.query("enrollments").collect();
    const totalEnrollments = enrollments.length;
    const newEnrollmentsThisWeek = enrollments.filter(
      (e) => e.enrolledAt > weekAgo
    ).length;

    const courses = await ctx.db.query("courses").collect();
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.published).length;

    const lessons = await ctx.db.query("lessons").collect();
    const totalLessons = lessons.length;

    const allProgress = await ctx.db.query("progress").collect();
    const completions = allProgress.filter((p) => p.completed).length;
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completions / (totalEnrollments * Math.max(totalLessons, 1))) * 100)
        : 0;

    const certificates = await ctx.db.query("certificates").collect();
    const totalCertificates = certificates.length;

    const chatSessions = await ctx.db.query("chatSessions").collect();
    const totalChatSessions = chatSessions.length;

    const simSessions = await ctx.db.query("simulatorSessions").collect();
    const totalSimSessions = simSessions.length;

    const topics = await ctx.db.query("communityTopics").collect();
    const totalTopics = topics.length;

    const contacts = await ctx.db.query("contactMessages").collect();
    const newContacts = contacts.filter((c) => c.status === "new").length;

    // Week-over-week change for users
    const userGrowthPercent =
      newUsersLastWeek > 0
        ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100)
        : newUsersThisWeek > 0
        ? 100
        : 0;

    return {
      totalUsers,
      activeUsers7d,
      totalEnrollments,
      totalCourses,
      publishedCourses,
      totalLessons,
      completions,
      completionRate: Math.min(completionRate, 100),
      totalCertificates,
      totalChatSessions,
      totalSimSessions,
      totalTopics,
      newContacts,
      newUsersThisWeek,
      newEnrollmentsThisWeek,
      userGrowthPercent,
    };
  },
});

// ─── User Growth (30 days) ─────────────────────────────────────────────────────

export const getUserGrowth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const dailyCounts: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      if (key) dailyCounts[key] = 0;
    }

    for (const user of users) {
      if (user.createdAt > thirtyDaysAgo) {
        const date = new Date(user.createdAt).toISOString().split("T")[0];
        if (date && dailyCounts[date] !== undefined) {
          dailyCounts[date]++;
        }
      }
    }

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// ─── Course Analytics ──────────────────────────────────────────────────────────

export const getCourseAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();
    const allProgress = await ctx.db.query("progress").collect();
    const certificates = await ctx.db.query("certificates").collect();
    const reviews = await ctx.db.query("courseReviews").collect();

    return courses
      .map((course) => {
        const courseEnrollments = enrollments.filter(
          (e) => e.courseId === course._id
        ).length;

        const courseCerts = certificates.filter(
          (c) => c.courseId === course._id
        ).length;

        const completionRate =
          courseEnrollments > 0
            ? Math.round((courseCerts / courseEnrollments) * 100)
            : 0;

        const courseReviews = reviews.filter((r) => r.courseId === course._id);
        const avgRating =
          courseReviews.length > 0
            ? Math.round(
                (courseReviews.reduce((sum, r) => sum + r.rating, 0) /
                  courseReviews.length) *
                  10
              ) / 10
            : null;

        const courseProgress = allProgress.filter(
          (p) => p.courseId === course._id && p.completed
        ).length;

        return {
          courseId: course._id as string,
          title: course.title,
          published: course.published,
          enrollments: courseEnrollments,
          completionRate,
          avgRating,
          reviewCount: courseReviews.length,
          lessonsCompleted: courseProgress,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments);
  },
});

// ─── Course Popularity (for chart) ────────────────────────────────────────────

export const getCoursePopularity = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();

    return courses
      .map((course) => {
        const courseEnrollments = enrollments.filter(
          (e) => e.courseId === course._id
        );
        return {
          courseId: course._id as string,
          title: course.title,
          enrollments: courseEnrollments.length,
          published: course.published,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments);
  },
});

// ─── Lesson Analytics ──────────────────────────────────────────────────────────

export const getLessonAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const lessons = await ctx.db.query("lessons").collect();
    const allProgress = await ctx.db.query("progress").collect();
    const courses = await ctx.db.query("courses").collect();
    const courseMap = new Map(courses.map((c) => [c._id as string, c.title]));

    const lessonStats = lessons.map((lesson) => {
      const lessonProgress = allProgress.filter(
        (p) => p.lessonId === lesson._id
      );
      const views = lessonProgress.length;
      const completions = lessonProgress.filter((p) => p.completed).length;
      const completionRate = views > 0 ? Math.round((completions / views) * 100) : 0;

      const watchTimes = lessonProgress
        .filter((p) => p.watchTimeSeconds != null && (p.watchTimeSeconds ?? 0) > 0)
        .map((p) => p.watchTimeSeconds ?? 0);
      const avgWatchTime =
        watchTimes.length > 0
          ? Math.round(watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length)
          : 0;

      return {
        lessonId: lesson._id as string,
        title: lesson.title,
        courseTitle: courseMap.get(lesson.courseId as string) ?? "—",
        views,
        completions,
        completionRate,
        avgWatchTimeSec: avgWatchTime,
      };
    });

    const sorted = [...lessonStats].sort((a, b) => b.views - a.views);

    return {
      mostViewed: sorted.slice(0, 10),
      leastViewed: sorted
        .filter((l) => l.views > 0)
        .slice(-5)
        .reverse(),
      totalLessons: lessons.length,
    };
  },
});

// ─── Engagement Metrics ────────────────────────────────────────────────────────

export const getEngagementMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allProgress = await ctx.db.query("progress").collect();

    // Daily active users (7 days)
    const dailyActive: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const activeUserIds = new Set(
        allProgress
          .filter(
            (p) =>
              p.lastWatchedAt >= dayStart.getTime() &&
              p.lastWatchedAt <= dayEnd.getTime()
          )
          .map((p) => p.userId as string)
      );

      dailyActive.push({
        date: dayStart.toISOString().split("T")[0] ?? "",
        count: activeUserIds.size,
      });
    }

    // Average session activity (avg lessons per user per day)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentProgress = allProgress.filter((p) => p.lastWatchedAt > weekAgo);
    const uniqueRecentUsers = new Set(recentProgress.map((p) => p.userId as string));
    const avgLessonsPerUser =
      uniqueRecentUsers.size > 0
        ? Math.round((recentProgress.length / uniqueRecentUsers.size) * 10) / 10
        : 0;

    // Completion metrics
    const completedCount = allProgress.filter((p) => p.completed).length;
    const totalViews = allProgress.length;
    const overallCompletionRate =
      totalViews > 0 ? Math.round((completedCount / totalViews) * 100) : 0;

    return {
      dailyActive,
      avgLessonsPerUser,
      overallCompletionRate,
      totalLessonViews: totalViews,
      uniqueActiveUsers7d: uniqueRecentUsers.size,
    };
  },
});

// ─── Revenue Report ────────────────────────────────────────────────────────────

export const getRevenueReport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const payments = await ctx.db.query("payments").collect();
    const succeededPayments = payments.filter((p) => p.status === "succeeded");

    // Group by month
    const monthlyMap: Record<string, number> = {};
    for (const payment of succeededPayments) {
      const date = new Date(payment.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] ?? 0) + payment.amount;
    }

    const monthly = Object.entries(monthlyMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // last 6 months

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const thisMonthRevenue = monthlyMap[thisMonthKey] ?? 0;
    const lastMonthRevenue = monthlyMap[lastMonthKey] ?? 0;
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + p.amount, 0);

    // Recent payments with user info
    const recentPayments = await Promise.all(
      payments
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20)
        .map(async (payment) => {
          const user = await ctx.db.get(payment.userId);
          return {
            id: payment._id as string,
            userName: user?.name ?? user?.email ?? "לא ידוע",
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            description: payment.description,
            createdAt: payment.createdAt,
          };
        })
    );

    return {
      monthly,
      thisMonthRevenue,
      lastMonthRevenue,
      totalRevenue,
      totalPayments: payments.length,
      succeededCount: succeededPayments.length,
      recentPayments,
    };
  },
});

// ─── Top Students ──────────────────────────────────────────────────────────────

export const getTopStudents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const allProgress = await ctx.db.query("progress").collect();
    const certificates = await ctx.db.query("certificates").collect();
    const enrollments = await ctx.db.query("enrollments").collect();
    const xpEvents = await ctx.db.query("xpEvents").collect();

    const studentData = users
      .filter((u) => u.role === "student")
      .map((user) => {
        const userId = user._id as string;

        // XP from events
        const userXP = xpEvents
          .filter((e) => (e.userId as string) === userId)
          .reduce((sum, e) => sum + e.points, 0);

        // Lessons completed
        const lessonsCompleted = allProgress.filter(
          (p) => (p.userId as string) === userId && p.completed
        ).length;

        // Certificates
        const certsCount = certificates.filter(
          (c) => (c.userId as string) === userId
        ).length;

        // Courses enrolled
        const coursesEnrolled = enrollments.filter(
          (e) => (e.userId as string) === userId
        ).length;

        // Streak estimate (days with activity in last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const activeDays = new Set(
          allProgress
            .filter(
              (p) =>
                (p.userId as string) === userId &&
                p.lastWatchedAt > thirtyDaysAgo
            )
            .map((p) =>
              new Date(p.lastWatchedAt).toISOString().split("T")[0]
            )
        ).size;

        return {
          userId,
          name: user.name ?? user.email,
          email: user.email,
          imageUrl: user.imageUrl,
          xp: userXP,
          lessonsCompleted,
          certsCount,
          coursesEnrolled,
          streak: activeDays,
          joinedAt: user.createdAt,
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    return studentData;
  },
});

// ─── Recent Activity Feed ──────────────────────────────────────────────────────

export const getRecentActivityFeed = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").take(5);
    const userActivities = users.map((u) => ({
      type: "new_user" as const,
      label: u.name ?? u.email,
      detail: u.email,
      timestamp: u.createdAt,
    }));

    const enrollments = await ctx.db
      .query("enrollments")
      .order("desc")
      .take(5);
    const enrollmentActivities = await Promise.all(
      enrollments.map(async (e) => {
        const user = await ctx.db.get(e.userId);
        const course = await ctx.db.get(e.courseId);
        return {
          type: "enrollment" as const,
          label: user?.name ?? user?.email ?? "Unknown",
          detail: course?.title ?? "Unknown",
          timestamp: e.enrolledAt,
        };
      })
    );

    const certificates = await ctx.db
      .query("certificates")
      .order("desc")
      .take(5);
    const certActivities = certificates.map((c) => ({
      type: "certificate" as const,
      label: c.userName,
      detail: c.courseName,
      timestamp: c.issuedAt,
    }));

    const allActivities = [
      ...userActivities,
      ...enrollmentActivities,
      ...certActivities,
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return allActivities;
  },
});

// ─── Recent Signups ────────────────────────────────────────────────────────────

export const getRecentSignups = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").take(10);
    return users.map((u) => ({
      userId: u._id as string,
      name: u.name ?? u.email,
      email: u.email,
      imageUrl: u.imageUrl,
      role: u.role,
      joinedAt: u.createdAt,
    }));
  },
});
