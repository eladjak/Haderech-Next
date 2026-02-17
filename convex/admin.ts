import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת כל הקורסים (כולל לא מפורסמים) - לשימוש admin
export const listAllCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

// ספירת סטודנטים רשומים לקורס
export const getEnrollmentCount = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    return enrollments.length;
  },
});

// סטטיסטיקות כלליות
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();
    const certificates = await ctx.db.query("certificates").collect();
    const progress = await ctx.db.query("progress").collect();

    const students = users.filter((u) => u.role === "student");
    const completedLessons = progress.filter((p) => p.completed);

    const totalProgressEntries = progress.length;
    const avgProgress =
      totalProgressEntries > 0
        ? Math.round(
            progress.reduce((sum, p) => sum + p.progressPercent, 0) /
              totalProgressEntries
          )
        : 0;

    const completionRate =
      totalProgressEntries > 0
        ? Math.round((completedLessons.length / totalProgressEntries) * 100)
        : 0;

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalCertificates: certificates.length,
      averageProgress: avgProgress,
      completionRate,
    };
  },
});

// פעילות אחרונה - הרשמות ותעודות
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("enrollments").order("desc").take(10);
    const certificates = await ctx.db
      .query("certificates")
      .order("desc")
      .take(10);

    const enrollmentActivities = await Promise.all(
      enrollments.map(async (e) => {
        const user = await ctx.db.get(e.userId);
        const course = await ctx.db.get(e.courseId);
        return {
          type: "enrollment" as const,
          userName: user?.name ?? user?.email ?? "Unknown",
          courseName: course?.title ?? "Unknown",
          timestamp: e.enrolledAt,
        };
      })
    );

    const certificateActivities = await Promise.all(
      certificates.map(async (c) => {
        return {
          type: "certificate" as const,
          userName: c.userName,
          courseName: c.courseName,
          timestamp: c.issuedAt,
        };
      })
    );

    const allActivities = [...enrollmentActivities, ...certificateActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return allActivities;
  },
});

// שליפת כל הסטודנטים עם נתוני הרשמות
export const listStudents = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const students = users.filter((u) => u.role === "student");

    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", student._id))
          .collect();

        const progressEntries = await ctx.db
          .query("progress")
          .withIndex("by_user", (q) => q.eq("userId", student._id))
          .collect();

        const totalProgress =
          progressEntries.length > 0
            ? Math.round(
                progressEntries.reduce((sum, p) => sum + p.progressPercent, 0) /
                  progressEntries.length
              )
            : 0;

        const lastActive =
          progressEntries.length > 0
            ? Math.max(...progressEntries.map((p) => p.lastWatchedAt))
            : student.createdAt;

        return {
          ...student,
          coursesEnrolled: enrollments.length,
          averageProgress: totalProgress,
          lastActive,
        };
      })
    );

    return studentsWithData;
  },
});

// יצירת קורס (admin)
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const lastCourse = await ctx.db
      .query("courses")
      .withIndex("by_order")
      .order("desc")
      .first();

    const order = lastCourse ? lastCourse.order + 1 : 0;

    return await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      published: args.published ?? false,
      order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון קורס (admin)
export const updateCourse = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Course not found");

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// מחיקת קורס (admin) - כולל הרשמות, התקדמות, בחנים ותעודות
export const deleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    // מחיקת הרשמות
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();
    for (const e of enrollments) {
      await ctx.db.delete(e._id);
    }

    // מחיקת התקדמות
    const progressEntries = await ctx.db
      .query("progress")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();
    for (const p of progressEntries) {
      await ctx.db.delete(p._id);
    }

    // מחיקת בחנים ושאלות
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();
    for (const quiz of quizzes) {
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
        .collect();
      for (const question of questions) {
        await ctx.db.delete(question._id);
      }
      // מחיקת ניסיונות בוחן של הקורס
      const allAttempts = await ctx.db
        .query("quizAttempts")
        .filter((q) => q.eq(q.field("courseId"), args.id))
        .collect();
      for (const attempt of allAttempts) {
        await ctx.db.delete(attempt._id);
      }
      await ctx.db.delete(quiz._id);
    }

    // מחיקת שיעורים
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();
    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }

    // מחיקת תעודות
    const certificates = await ctx.db
      .query("certificates")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();
    for (const cert of certificates) {
      await ctx.db.delete(cert._id);
    }

    // מחיקת הקורס עצמו
    await ctx.db.delete(args.id);
  },
});
