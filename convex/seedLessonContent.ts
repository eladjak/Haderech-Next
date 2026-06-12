/**
 * seedLessonContent.ts — Apply full learner-facing content to the lessons of
 * "הדרך - אומנות הקשר".
 *
 * Content lives in lessonContentData.ts (generated from the original video
 * scripts by scripts/build-lesson-content.mjs) and is keyed by scriptIndex.
 *
 * Idempotent: lessons whose content already matches are skipped.
 *
 * Usage:
 *   npx convex run seedLessonContent:applyLessonContent          (dev)
 *   npx convex run --prod seedLessonContent:applyLessonContent   (production)
 */

import { internalMutation } from "./_generated/server";
import { LESSON_CONTENT } from "./lessonContentData";

const COURSE_TITLE = "הדרך - אומנות הקשר";

/**
 * Set the course hero image (served from public/images/courses/).
 * Generated 2026-06-12 with Gemini (nano-banana-poster), brand palette
 * per BRAND.md (E85D75 / 1E3A5F / D4A853 on cream).
 */
export const setCourseImage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const course = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), COURSE_TITLE))
      .first();
    if (!course) {
      return { success: false, message: `Course "${COURSE_TITLE}" not found.` };
    }
    await ctx.db.patch(course._id, {
      imageUrl: "/images/courses/haderech-hero.jpg",
      updatedAt: Date.now(),
    });
    return { success: true, imageUrl: "/images/courses/haderech-hero.jpg" };
  },
});

export const applyLessonContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    const course = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), COURSE_TITLE))
      .first();

    if (!course) {
      return {
        success: false,
        message: `Course "${COURSE_TITLE}" not found. Run seedHaderech:seedHaderechCourse first.`,
      };
    }

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();

    let updated = 0;
    let unchanged = 0;
    const noContent: string[] = [];

    for (const lesson of lessons) {
      const content = lesson.scriptIndex
        ? LESSON_CONTENT[lesson.scriptIndex]
        : undefined;

      if (!content) {
        noContent.push(`${lesson.scriptIndex ?? "?"} ${lesson.title}`);
        continue;
      }

      if (lesson.content === content) {
        unchanged++;
        continue;
      }

      await ctx.db.patch(lesson._id, {
        content,
        updatedAt: Date.now(),
      });
      updated++;
    }

    return {
      success: true,
      totalLessons: lessons.length,
      updated,
      unchanged,
      lessonsWithoutContent: noContent,
    };
  },
});
