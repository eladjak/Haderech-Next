/**
 * seedHaderech.ts — Seed the main "הדרך" course with all 75 lessons.
 *
 * This mutation reads from seedCourseData.ts and inserts the full course
 * structure into the Convex database.
 *
 * Usage (from Convex dashboard or CLI):
 *   npx convex run seedHaderech:seedHaderechCourse
 *
 * Idempotent: skips if a course with the same title already exists.
 * To re-seed, first run `seedHaderech:clearHaderechCourse`.
 */

import { internalMutation, mutation } from "./_generated/server";
import { SEED_COURSES } from "./seedCourseData";

// ---------------------------------------------------------------------------
// Main seed mutation — public so it can be called from the Convex dashboard
// ---------------------------------------------------------------------------

export const seedHaderechCourse = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results: {
      courses: string[];
      lessons: number;
      skipped: string[];
    } = {
      courses: [],
      lessons: 0,
      skipped: [],
    };

    for (const courseData of SEED_COURSES) {
      // Check whether the course already exists (match by title)
      const existing = await ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("title"), courseData.title))
        .first();

      if (existing) {
        results.skipped.push(courseData.title);
        continue;
      }

      // Insert course
      const courseId = await ctx.db.insert("courses", {
        title: courseData.title,
        description: courseData.description,
        imageUrl: undefined,
        category: courseData.category,
        level: courseData.level,
        estimatedHours: courseData.estimatedHours,
        published: courseData.published,
        order: courseData.order,
        createdAt: now,
        updatedAt: now,
      });

      results.courses.push(courseData.title);

      // Insert lessons — flatten across all modules
      let globalOrder = 0;
      for (const module of courseData.modules) {
        for (const lesson of module.lessons) {
          await ctx.db.insert("lessons", {
            courseId,
            title: lesson.title,
            description: lesson.description,
            content: undefined,      // video transcript — added later
            videoUrl: undefined,     // YouTube URL — added when videos are ready
            duration: lesson.duration,
            order: globalOrder,
            published: courseData.published,
            weekNumber: lesson.weekNumber,
            phaseNumber: lesson.phaseNumber,
            phaseName: lesson.phaseName,
            scriptIndex: lesson.scriptIndex,
            pdfUrl: lesson.pdfUrl,
            createdAt: now,
            updatedAt: now,
          });
          globalOrder++;
          results.lessons++;
        }
      }
    }

    const summary = [
      `Created ${results.courses.length} course(s): ${results.courses.join(", ") || "none"}`,
      `Inserted ${results.lessons} lesson(s)`,
      results.skipped.length > 0
        ? `Skipped (already exist): ${results.skipped.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      success: true,
      summary,
      courses: results.courses,
      lessons: results.lessons,
      skipped: results.skipped,
    };
  },
});

// ---------------------------------------------------------------------------
// Update lessons for an existing course — adds new fields without re-creating
// ---------------------------------------------------------------------------

export const updateHaderechLessons = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let updated = 0;
    let notFound = 0;

    // Find the main haderech course
    const haderechCourse = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), "הדרך - אומנות הקשר"))
      .first();

    if (!haderechCourse) {
      return {
        success: false,
        message:
          'Course "הדרך - אומנות הקשר" not found. Run seedHaderechCourse first.',
      };
    }

    const haderechData = SEED_COURSES.find(
      (c) => c.title === "הדרך - אומנות הקשר"
    );
    if (!haderechData) {
      return {
        success: false,
        message: "SEED_COURSES entry not found for הדרך - אומנות הקשר.",
      };
    }

    // Fetch all lessons for this course
    const existingLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", haderechCourse._id))
      .collect();

    // Build a lookup by scriptIndex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessonByScriptIndex = new Map<string, any>(
      existingLessons
        .filter((l: any) => l.scriptIndex)
        .map((l: any) => [l.scriptIndex as string, l])
    );

    for (const module of haderechData.modules) {
      for (const seedLesson of module.lessons) {
        const existing = lessonByScriptIndex.get(seedLesson.scriptIndex);

        if (existing) {
          // Patch existing lesson with new fields
          await ctx.db.patch(existing._id, {
            description: seedLesson.description,
            weekNumber: seedLesson.weekNumber,
            phaseNumber: seedLesson.phaseNumber,
            phaseName: seedLesson.phaseName,
            pdfUrl: seedLesson.pdfUrl,
            duration: seedLesson.duration,
            title: seedLesson.title,
            updatedAt: now,
          });
          updated++;
        } else {
          // Lesson not in DB yet — insert it
          await ctx.db.insert("lessons", {
            courseId: haderechCourse._id,
            title: seedLesson.title,
            description: seedLesson.description,
            content: undefined,
            videoUrl: undefined,
            duration: seedLesson.duration,
            order: seedLesson.order,
            published: true,
            weekNumber: seedLesson.weekNumber,
            phaseNumber: seedLesson.phaseNumber,
            phaseName: seedLesson.phaseName,
            scriptIndex: seedLesson.scriptIndex,
            pdfUrl: seedLesson.pdfUrl,
            createdAt: now,
            updatedAt: now,
          });
          updated++;
          notFound++;
        }
      }
    }

    return {
      success: true,
      summary: `Updated ${updated} lessons (${notFound} newly inserted).`,
      updated,
      newlyInserted: notFound,
    };
  },
});

// ---------------------------------------------------------------------------
// Clear haderech course data (for re-seeding — use carefully in dev only)
// ---------------------------------------------------------------------------

export const clearHaderechCourse = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the course
    const course = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), "הדרך - אומנות הקשר"))
      .first();

    if (!course) {
      return { success: false, message: "Course not found — nothing to clear." };
    }

    // Delete all linked lessons
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();

    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }

    // Delete the course itself
    await ctx.db.delete(course._id);

    return {
      success: true,
      message: `Deleted course "${course.title}" and ${lessons.length} lessons.`,
      deletedLessons: lessons.length,
    };
  },
});
