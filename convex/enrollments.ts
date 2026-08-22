import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  requireCourseContentAccess,
  requireSelfOrAdmin,
} from "./lib/authGuard";

// תשובת UI מצומצמת: האם למשתמש המחובר יש כרגע הרשאת תוכן אמינה.
// אין כאן פרטי entitlement, תשלום או תפקיד, ולכן השאילתה אינה הופכת
// את מצב ההרשאה של אדם אחר ל-oracle ציבורי.
export const getContentAccessStatus = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    try {
      await requireCourseContentAccess(ctx, args.courseId);
      return { hasAccess: true } as const;
    } catch {
      return { hasAccess: false } as const;
    }
  },
});

// בדיקה אם משתמש רשום לקורס
export const isEnrolled = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .unique();

    return enrollment !== null;
  },
});

// שליפת כל הקורסים שהמשתמש רשום אליהם
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        let hasContentAccess = false;
        try {
          await requireCourseContentAccess(ctx, enrollment.courseId);
          hasContentAccess = true;
        } catch {
          // A saved/self-service enrollment is useful navigation metadata, but
          // it must never be presented as a trusted content grant.
        }
        return course
          ? {
              ...course,
              enrolledAt: enrollment.enrolledAt,
              hasContentAccess,
            }
          : null;
      })
    );

    return courses.filter(
      (course): course is NonNullable<typeof course> => course !== null
    );
  },
});

// הרשמה לקורס
export const enroll = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    // בדיקה שהקורס קיים ומפורסם
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (!course.published) throw new Error("Course is not published");

    // בדיקה שהמשתמש לא כבר רשום
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("enrollments", {
      userId: args.userId,
      courseId: args.courseId,
      enrolledAt: Date.now(),
    });
  },
});

// ביטול הרשמה לקורס
export const unenroll = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .unique();

    if (!enrollment) throw new Error("Enrollment not found");

    // מחיקת ההרשמה
    await ctx.db.delete(enrollment._id);

    // מחיקת כל ההתקדמות של המשתמש בקורס
    const progressEntries = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    for (const entry of progressEntries) {
      await ctx.db.delete(entry._id);
    }
  },
});
