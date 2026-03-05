import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת תעודה לפי ID (ציבורי - לשיתוף)
export const getCertificate = query({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// שליפת כל התעודות של המשתמש המחובר (auth-based)
export const getUserCertificates = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// הנפקת תעודה אוטומטית - המשתמש המחובר (auth-based)
export const generateCertificate = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // בדיקה שאין כבר תעודה
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .first();

    if (existing) return existing._id;

    // בדיקת השלמת קורס
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const publishedLessons = lessons.filter((l) => l.published);
    if (publishedLessons.length === 0) {
      throw new Error("לקורס אין שיעורים");
    }

    const progressEntries = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .collect();

    const completedCount = progressEntries.filter((p) => p.completed).length;
    const completionPercent = Math.round(
      (completedCount / publishedLessons.length) * 100
    );

    if (completionPercent < 80) {
      throw new Error(
        `הקורס לא הושלם מספיק. נוכחי: ${completionPercent}%, נדרש: 80%`
      );
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    // יצירת מספר תעודה: CERT-{year}-{random6digits}
    const now = Date.now();
    const year = new Date(now).getFullYear();
    const random6 = String(Math.floor(100000 + Math.random() * 900000));
    const certificateNumber = `CERT-${year}-${random6}`;

    return await ctx.db.insert("certificates", {
      userId: user._id,
      courseId: args.courseId,
      userName: user.name ?? user.email,
      courseName: course.title,
      completionPercent,
      issuedAt: now,
      certificateNumber,
    });
  },
});

// שליפת תעודה לפי משתמש וקורס
export const getByUserAndCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();
  },
});

// שליפת כל התעודות של משתמש
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// אימות תעודה לפי מספר
export const verifyByCertificateNumber = query({
  args: { certificateNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_certificate_number", (q) =>
        q.eq("certificateNumber", args.certificateNumber)
      )
      .first();
  },
});

// הנפקת תעודה - רק אם הקורס הושלם
export const issue = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // בדיקה שאין כבר תעודה
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    if (existing) return existing._id;

    // בדיקת השלמת קורס
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const publishedLessons = lessons.filter((l) => l.published);
    if (publishedLessons.length === 0) {
      throw new Error("Course has no lessons");
    }

    const progressEntries = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const completedCount = progressEntries.filter((p) => p.completed).length;
    const completionPercent = Math.round(
      (completedCount / publishedLessons.length) * 100
    );

    if (completionPercent < 80) {
      throw new Error(
        `Course not sufficiently completed. Current: ${completionPercent}%, Required: 80%`
      );
    }

    // שליפת פרטי משתמש וקורס
    const user = await ctx.db.get(args.userId);
    const course = await ctx.db.get(args.courseId);

    if (!user || !course) throw new Error("User or course not found");

    // יצירת מספר תעודה ייחודי
    const now = Date.now();
    const certificateNumber = `HD-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return await ctx.db.insert("certificates", {
      userId: args.userId,
      courseId: args.courseId,
      userName: user.name ?? user.email,
      courseName: course.title,
      completionPercent,
      issuedAt: now,
      certificateNumber,
    });
  },
});
