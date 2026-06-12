/**
 * push-lesson-content.mjs — Push lesson content to a Convex deployment using
 * the already-deployed public functions (no `convex deploy` required).
 *
 * Uses the public HTTP API of the deployment:
 *   POST /api/query    { path, args, format: "json" }
 *   POST /api/mutation { path, args, format: "json" }
 *
 * Usage:
 *   node scripts/push-lesson-content.mjs --url https://frugal-curlew-822.convex.cloud [--dry-run]
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

// Load generated content map (strip the TS type annotation)
const tsPath = path.join(import.meta.dirname, "..", "convex", "lessonContentData.ts");
const ts = fs.readFileSync(tsPath, "utf8");
const jsonStart = ts.indexOf("{", ts.indexOf("LESSON_CONTENT"));
const jsonEnd = ts.lastIndexOf("}");
// The object literal is valid JSON except for trailing commas + comments
const objSrc = ts
  .slice(jsonStart, jsonEnd + 1)
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/,\s*}/g, "}");
const LESSON_CONTENT = JSON.parse(objSrc);

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
console.log(`Lessons in DB: ${lessons.length}`);

let updated = 0, unchanged = 0, missing = 0;
for (const lesson of lessons) {
  const content = lesson.scriptIndex ? LESSON_CONTENT[lesson.scriptIndex] : undefined;
  if (!content) {
    console.log(`  NO CONTENT for ${lesson.scriptIndex} ${lesson.title}`);
    missing++;
    continue;
  }
  if (lesson.content === content) {
    unchanged++;
    continue;
  }
  if (DRY_RUN) {
    console.log(`  would update ${lesson.scriptIndex} ${lesson.title} (${content.length} chars)`);
    updated++;
    continue;
  }
  await call("mutation", "lessons:update", { id: lesson._id, content });
  updated++;
  process.stdout.write(`\r  updated ${updated}...`);
}

console.log(`\nDone. updated=${updated} unchanged=${unchanged} missing=${missing}${DRY_RUN ? " (dry run)" : ""}`);
