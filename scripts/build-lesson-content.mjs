/**
 * build-lesson-content.mjs — Convert "הדרך" video scripts into learner-facing
 * lesson content for the platform.
 *
 * Source: OneDrive script files (one .md per video lesson, 77 files).
 * Output: convex/lessonContentData.ts — map of scriptIndex → markdown content.
 *
 * Transformation (mechanical, preserves Elad's authentic voice — no AI rewriting):
 *   - Drop the H1 script title + metadata header (נושא/חלק בקורס/משך/אינדקס...)
 *   - Drop the "## טקסט לטלפרומפטר" section (duplicate of the body)
 *   - Strip production annotations: emoji section numbers (1️⃣), timing hints
 *     "(5-10 שניות)", and map production labels to learner headings:
 *       כותרת וברכה / הקדמה / הפנייה לפעולה  → heading removed, text flows
 *       תוכן עיקרי                            → heading removed (or suffix kept)
 *       תרגול מעשי                            → "### תרגול מעשי"
 *       סיכום                                 → "### לסיכום"
 *
 * Usage:  node scripts/build-lesson-content.mjs [--src <dir>]
 */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_SRC = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  "OneDrive",
  "עסקים",
  "אומנות הקשר כאן ועכשיו",
  "מסמכי קורס דרך חדשה",
  "תסריטים"
);

const srcArgIdx = process.argv.indexOf("--src");
const SRC = srcArgIdx > -1 ? process.argv[srcArgIdx + 1] : DEFAULT_SRC;
const OUT = path.join(import.meta.dirname, "..", "convex", "lessonContentData.ts");

if (!fs.existsSync(SRC)) {
  console.error(`Source directory not found: ${SRC}`);
  process.exit(1);
}

/**
 * The metadata index inside a few script files drifted from the canonical
 * lesson numbering in the DB (seedCourseData.ts). Verified manually against
 * production lesson titles on 2026-06-12. null = exclude file.
 */
const INDEX_OVERRIDES = {
  // Orphan script — no matching lesson in the seeded course (flagged for Elad)
  "שבוע_5/יום_2_סרטון_2_להסכים_לקבל.md": null,
  // DB numbering shifted by the NVC + love-languages insertions in week 5
  "שבוע_5/יום_3_סרטון_1_התנהגויות_לא_פנוי.md": "5.4.1",
  "שבוע_5/יום_4_סרטון_1_סיכום_שלב_תקשורת.md": "5.5.1",
  // Week 10: file claims 10.1.3/10.2.1, DB uses 10.2.1/10.2.2
  "שבוע_10/יום_1_סרטון_3_דיוק_החיפוש.md": "10.2.1",
  "שבוע_10/יום_2_סרטון_1_הקשבה_פעילה.md": "10.2.2",
  // Archived draft superseded by מיתוסים_על_כימיה (same index 10.1.2)
  "שבוע_10/_ARCHIVED_יום_1_סרטון_2_דיוק_החיפוש_ORIGINAL.md": null,
};

/** Strip emoji digit markers and timing parentheses from a heading line. */
function cleanHeading(raw) {
  return raw
    .replace(/[0-9]️?⃣/g, "") // 1️⃣ keycap emoji
    .replace(/\([^)]*שניות[^)]*\)/g, "")
    .replace(/\([^)]*דקות[^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Map a cleaned production heading to a learner-facing heading.
 * Returns: string (heading to emit) | null (drop heading, keep body flowing)
 */
function mapHeading(h) {
  // Split optional suffix: "תוכן עיקרי - ארבעת שלבי NVC"
  const m = h.match(/^(.*?)\s*[-–—:]\s*(.+)$/);
  const base = (m ? m[1] : h).trim();
  const suffix = m ? m[2].trim() : null;

  const drop = ["כותרת וברכה", "הקדמה מעוררת עניין", "הקדמה", "תוכן עיקרי", "הפנייה לפעולה וסיום", "סיום והפנייה לפעולה", "קריאה לפעולה"];
  const summary = ["סיכום", "סיכום וסיום"];

  if (drop.includes(base)) return suffix ? `### ${suffix}` : null;
  if (summary.includes(base)) return "### לסיכום";
  if (base === "תרגול מעשי" || base === "תרגול")
    return suffix ? `### תרגול מעשי: ${suffix}` : "### תרגול מעשי";
  // Meaningful custom heading — keep as-is
  return `### ${h}`;
}

/** Convert one script file's text into learner-facing markdown. */
function transform(text) {
  // Cut teleprompter duplicate
  const teleIdx = text.search(/^##\s*טקסט לטלפרומפטר/m);
  if (teleIdx > -1) text = text.slice(0, teleIdx);

  const lines = text.split(/\r?\n/);
  const out = [];
  let pastHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip everything until the first ### section (H1 + metadata + first ---)
    if (!pastHeader) {
      if (trimmed.startsWith("### ")) pastHeader = true;
      else continue;
    }

    if (trimmed.startsWith("### ")) {
      const mapped = mapHeading(cleanHeading(trimmed.slice(4)));
      if (mapped) {
        out.push("");
        out.push(mapped);
      } else if (out.length > 0) {
        out.push(""); // paragraph break where a dropped heading was
      }
      continue;
    }

    // Drop horizontal rules and stray metadata bold-lines
    if (/^-{3,}$/.test(trimmed)) continue;

    out.push(line.replace(/\s+$/, ""));
  }

  // Collapse 3+ blank lines, trim
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Extract the script index ("1.1.1") from the metadata header. */
function extractIndex(text) {
  const m = text.match(/\*\*אינדקס:\*\*\s*([0-9]+\.[0-9]+\.[0-9]+)/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------

const entries = [];
const problems = [];

const weekDirs = fs
  .readdirSync(SRC)
  .filter((d) => d.startsWith("שבוע"))
  .sort();

for (const week of weekDirs) {
  const dir = path.join(SRC, week);
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const rel = `${week}/${file}`;
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    let index;
    if (rel in INDEX_OVERRIDES) {
      index = INDEX_OVERRIDES[rel];
      if (index === null) {
        console.log(`Excluded: ${rel}`);
        continue;
      }
    } else {
      index = extractIndex(raw);
    }
    if (!index) {
      problems.push(`NO INDEX: ${rel}`);
      continue;
    }
    const content = transform(raw);
    const words = content.split(/\s+/).length;
    if (words < 80) problems.push(`SHORT (${words}w): ${week}/${file} [${index}]`);
    entries.push({ index, file: `${week}/${file}`, content, words });
  }
}

// Sort by numeric index
entries.sort((a, b) => {
  const pa = a.index.split(".").map(Number);
  const pb = b.index.split(".").map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
});

// Duplicate detection
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.index)) problems.push(`DUPLICATE INDEX ${e.index}: ${seen.get(e.index)} + ${e.file}`);
  seen.set(e.index, e.file);
}

const totalWords = entries.reduce((s, e) => s + e.words, 0);

const banner = `/**
 * lessonContentData.ts — GENERATED FILE, do not edit by hand.
 *
 * Learner-facing lesson content for "הדרך - אומנות הקשר",
 * generated from the original video scripts by scripts/build-lesson-content.mjs.
 *
 * ${entries.length} lessons, ~${totalWords.toLocaleString("en-US")} words.
 * Keyed by scriptIndex (week.day.video), matching lessons.scriptIndex in the DB.
 */

export const LESSON_CONTENT: Record<string, string> = {
`;

let body = "";
for (const e of entries) {
  body += `  // ${e.file} (${e.words} words)\n`;
  body += `  ${JSON.stringify(e.index)}: ${JSON.stringify(e.content)},\n\n`;
}

fs.writeFileSync(OUT, banner + body + "};\n", "utf8");

console.log(`Wrote ${OUT}`);
console.log(`Lessons: ${entries.length} | Total words: ${totalWords}`);
console.log(`Avg words/lesson: ${Math.round(totalWords / entries.length)}`);
if (problems.length) {
  console.log("\nPROBLEMS:");
  for (const p of problems) console.log("  - " + p);
} else {
  console.log("No problems detected.");
}
