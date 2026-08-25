import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const source = read("src/content/tools/date-reflection.ts");
const page = read("src/app/tools/date-report/page.tsx");
const catalog = read("src/app/tools/page.tsx");
const combined = `${source}\n${page}`;

const requiredSourceMarkers = [
  'sourceKey: "legacy.reflective-learning-loop"',
  'sourceRevision: "2026-08-14.1"',
  'recordId: "L0557"',
  'answerHandling: "memory-only-until-refresh"',
  'id: "choose"',
  'id: "try"',
  'id: "check"',
];

for (const marker of requiredSourceMarkers) {
  assert.ok(source.includes(marker), `missing canonical marker: ${marker}`);
}

for (const forbidden of [
  /localStorage/u,
  /sessionStorage/u,
  /\bfetch\s*\(/u,
  /useMutation/u,
  /useAction/u,
  /convex\/react/u,
]) {
  assert.ok(!page.match(forbidden), `answer persistence/network boundary failed: ${forbidden}`);
}

for (const required of [
  'dir="rtl"',
  'lang="he"',
  'id="main-content" tabIndex={-1}',
  "<fieldset>",
  "aria-pressed={selected}",
  'aria-live="polite"',
  'role="alert"',
  "maxLength={TEXT_LIMIT}",
  "עדיף לא לכתוב שמות",
  "אינו אבחון, טיפול או המלצה",
  '["pause", "end", "support"]',
  "רק כיוונים שלא",
]) {
  assert.ok(page.includes(required), `missing safety/accessibility marker: ${required}`);
}

for (const retiredCopy of [
  /מה שלא מדיד/u,
  /מכפיל פי שניים/u,
  /להגיע לשני דייטים/u,
  /חובה!/u,
  /הכלים שיהפכו את הלמידה/u,
]) {
  assert.ok(!combined.match(retiredCopy), `retired legacy copy returned: ${retiredCopy}`);
}

assert.match(
  catalog,
  /id: "date-report"[\s\S]*href: "\/tools\/date-report"[\s\S]*available: true[\s\S]*badge: "מקומי"/u,
  "date-report must be active and truthfully marked as local",
);

console.log("date-reflection tool contract: PASS");
