/**
 * push-weekly-quizzes.mjs — Push the 12 weekly quizzes (and the course hero
 * image) to a Convex deployment using already-deployed public functions,
 * without requiring `convex deploy`.
 *
 * Quiz data source: convex/seedWeeklyQuizzes.ts (WEEKLY_QUIZZES array).
 *
 * Usage:
 *   node scripts/push-weekly-quizzes.mjs --url https://frugal-curlew-822.convex.cloud [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const CONVEX_URL = urlIdx > -1 ? args[urlIdx + 1] : process.env.NEXT_PUBLIC_CONVEX_URL;
const DRY_RUN = args.includes("--dry-run");

if (!CONVEX_URL) {
  console.error("Missing --url or NEXT_PUBLIC_CONVEX_URL");
  process.exit(1);
}

// Extract the WEEKLY_QUIZZES array literal from the TS module (plain data,
// safe to evaluate as a JS expression).
const tsPath = path.join(import.meta.dirname, "..", "convex", "seedWeeklyQuizzes.ts");
const ts = fs.readFileSync(tsPath, "utf8");
const startMarker = "export const WEEKLY_QUIZZES: WeeklyQuiz[] = ";
const start = ts.indexOf(startMarker);
const end = ts.indexOf("\n];", start);
if (start === -1 || end === -1) {
  console.error("Could not locate WEEKLY_QUIZZES in seedWeeklyQuizzes.ts");
  process.exit(1);
}
const arraySrc = ts.slice(start + startMarker.length, end + 3);
const WEEKLY_QUIZZES = new Function(`return ${arraySrc}`)();

async function call(kind, fnPath, fnArgs) {
  const res = await fetch(`${CONVEX_URL}/api/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: fnPath, args: fnArgs, format: "json" }),
  });
  const body = await res.json();
  if (body.status !== "success") {
    throw new Error(`${fnPath} failed: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body.value;
}

const courses = await call("query", "courses:listPublished", {});
const course = courses.find((c) => c.title === "הדרך - אומנות הקשר");
if (!course) {
  console.error("Course not found on this deployment.");
  process.exit(1);
}
console.log(`Course: ${course.title} (${course._id}) on ${CONVEX_URL}`);

const lessons = await call("query", "lessons:listByCourse", { courseId: course._id });
const byIndex = new Map(lessons.filter((l) => l.scriptIndex).map((l) => [l.scriptIndex, l]));

let created = 0, skipped = 0;
for (const quiz of WEEKLY_QUIZZES) {
  const lesson = byIndex.get(quiz.lessonScriptIndex);
  if (!lesson) {
    console.log(`  NO LESSON for ${quiz.lessonScriptIndex} (${quiz.title})`);
    continue;
  }
  const existing = await call("query", "quizzes:getByLesson", { lessonId: lesson._id });
  if (existing) {
    console.log(`  exists: ${quiz.title}`);
    skipped++;
    continue;
  }
  if (DRY_RUN) {
    console.log(`  would create: ${quiz.title} -> ${lesson.title} (${quiz.questions.length} questions)`);
    created++;
    continue;
  }
  await call("mutation", "quizzes:create", {
    lessonId: lesson._id,
    courseId: course._id,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: quiz.questions,
  });
  console.log(`  created: ${quiz.title}`);
  created++;
}

// Course hero image
const IMAGE_URL = "/images/courses/haderech-hero.jpg";
if (course.imageUrl !== IMAGE_URL && !DRY_RUN) {
  await call("mutation", "courses:update", { id: course._id, imageUrl: IMAGE_URL });
  console.log(`  course imageUrl set to ${IMAGE_URL}`);
}

console.log(`Done. quizzes created=${created} skipped=${skipped}${DRY_RUN ? " (dry run)" : ""}`);
