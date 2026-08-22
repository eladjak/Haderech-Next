import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function between(source: string, startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  expect(start, `Missing start marker: ${startMarker}`).toBeGreaterThanOrEqual(0);
  expect(end, `Missing end marker: ${endMarker}`).toBeGreaterThan(start);
  return source.slice(start, end);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "en"));
}

const seedCourseData = read("convex/seedCourseData.ts");
const activeCourseMetadata = between(
  seedCourseData,
  "const HADERECH_MODULES",
  "// Archived, unpublished drafts"
);
const exportedCourses = between(
  seedCourseData,
  "export const SEED_COURSES",
  "// Utility: flatten all lessons"
);

describe("canonical course seed metadata", () => {
  it("matches all 75 generated manifest placements exactly once", () => {
    const seedIndexes = [
      ...activeCourseMetadata.matchAll(/scriptIndex:\s*"([^"]+)"/g),
    ].map((match) => match[1]);
    const generatedIndexes = [
      ...read("convex/lessonContentData.ts").matchAll(/^\s*"(\d+\.\d+\.\d+)":/gm),
    ].map((match) => match[1]);

    expect(seedIndexes).toHaveLength(75);
    expect(uniqueSorted(seedIndexes)).toHaveLength(75);
    expect(uniqueSorted(seedIndexes)).toEqual(uniqueSorted(generatedIndexes));
  });

  it("exports one current course with the approved public inventory", () => {
    expect(exportedCourses.match(/modules:\s*HADERECH_MODULES/g)).toHaveLength(1);
    expect(exportedCourses).not.toMatch(
      /modules:\s*(?:OMANUT_HASICHA_MODULES|PROFILE_MENATZEACH_MODULES|SIMULATOR_DATIM_MODULES)/
    );
    expect(exportedCourses).toContain("12 שבועות וב-6 שלבים");
    expect(exportedCourses).toContain("75 שיעורים ו-8 מסמכי PDF לתרגול");
    expect(exportedCourses).not.toContain("estimatedHours: 24");
    expect(seedCourseData).toContain(
      "export const LEGACY_UNPUBLISHED_COURSE_DRAFT_COUNT"
    );
  });

  it("keeps all eight practice-PDF placements without stale course counts", () => {
    expect(activeCourseMetadata.match(/pdfUrl:\s*"[^"]+\.pdf"/g)).toHaveLength(8);
    expect(activeCourseMetadata).not.toMatch(
      /73 video lessons|51 שיעורים|5 שלבים|30 יום ללא דייטים זה המפתח|תוך 7 שניות|שבע שניות לעשות רושם|עקרונות צילום מבוססי מחקר|חיבור עמוק כבר מהדייט הראשון/
    );
  });
});

describe("legacy seed containment", () => {
  const legacySources = [
    "convex/seed.ts",
    "convex/seedContent.ts",
    "convex/seedQuizzes.ts",
  ].map((file) => ({ file, source: read(file) }));

  it.each(legacySources)("keeps $file fail-closed and write-free", ({ source }) => {
    expect(source).toContain('code: "LEGACY_SEED_DISABLED"');
    expect(source).not.toMatch(/ctx\.db|db\.(?:insert|delete|patch|replace)\(/);
  });

  it("routes course and assessment work to the canonical synchronizers", () => {
    const legacyCourseSeeds = [
      read("convex/seed.ts"),
      read("convex/seedContent.ts"),
    ].join("\n");
    const legacyQuizSeed = read("convex/seedQuizzes.ts");

    expect(legacyCourseSeeds).toContain("seedHaderech:seedHaderechCourse");
    expect(legacyQuizSeed).toContain("seedWeeklyQuizzes:seedWeeklyQuizzes");
    expect(read("convex/seed.ts")).toContain(
      "The broad legacy clearAll operation is disabled"
    );
  });
});
