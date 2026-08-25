import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireCourseContentAccess } from "./lib/authGuard";

/**
 * Authorize one exact lesson-to-PDF mapping for the current Convex identity.
 * The caller cannot assert a user id; identity is taken only from the JWT.
 */
export const authorize = query({
  args: {
    courseId: v.string(),
    lessonId: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const courseId = ctx.db.normalizeId("courses", args.courseId);
    const lessonId = ctx.db.normalizeId("lessons", args.lessonId);
    if (!courseId || !lessonId) return false;

    await requireCourseContentAccess(ctx, courseId);

    const lesson = await ctx.db.get(lessonId);
    return (
      lesson !== null &&
      lesson.courseId === courseId &&
      lesson.pdfUrl === args.fileName
    );
  },
});
