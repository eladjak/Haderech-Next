import { query } from "./_generated/server";
import { requireAdmin } from "./lib/authGuard";

// Dashboard overview stats
export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Count total users
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;

    // Count total enrollments
    const enrollments = await ctx.db.query("enrollments").collect();
    const totalEnrollments = enrollments.length;

    // Count total courses
    const courses = await ctx.db.query("courses").collect();
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.published).length;

    // Count total lessons
    const lessons = await ctx.db.query("lessons").collect();
    const totalLessons = lessons.length;

    // Count completed lessons (progress with completed=true)
    const completedProgress = await ctx.db.query("progress").collect();
    const completions = completedProgress.filter((p) => p.completed).length;

    // Count certificates issued
    const certificates = await ctx.db.query("certificates").collect();
    const totalCertificates = certificates.length;

    // Count chat sessions
    const chatSessions = await ctx.db.query("chatSessions").collect();
    const totalChatSessions = chatSessions.length;

    // Count simulator sessions
    const simSessions = await ctx.db.query("simulatorSessions").collect();
    const totalSimSessions = simSessions.length;

    // Count community topics
    const topics = await ctx.db.query("communityTopics").collect();
    const totalTopics = topics.length;

    // Count contact messages
    const contacts = await ctx.db.query("contactMessages").collect();
    const newContacts = contacts.filter((c) => c.status === "new").length;

    // Recent activity (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = users.filter((u) => u.createdAt > weekAgo).length;
    const newEnrollmentsThisWeek = enrollments.filter(
      (e) => e.enrolledAt > weekAgo
    ).length;

    return {
      totalUsers,
      totalEnrollments,
      totalCourses,
      publishedCourses,
      totalLessons,
      completions,
      totalCertificates,
      totalChatSessions,
      totalSimSessions,
      totalTopics,
      newContacts,
      newUsersThisWeek,
      newEnrollmentsThisWeek,
    };
  },
});

// User growth data (for chart) - users created per day for last 30 days
export const getUserGrowth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Group by day
    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      if (key) {
        dailyCounts[key] = 0;
      }
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

// Course popularity - enrollment count per course
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
          courseId: course._id,
          title: course.title,
          enrollments: courseEnrollments.length,
          published: course.published,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments);
  },
});

// Recent activity feed - latest users, enrollments, completions
export const getRecentActivityFeed = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Recent users
    const users = await ctx.db.query("users").order("desc").take(5);
    const userActivities = users.map((u) => ({
      type: "new_user" as const,
      label: u.name ?? u.email,
      detail: u.email,
      timestamp: u.createdAt,
    }));

    // Recent enrollments
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

    // Recent completions (certificates)
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
