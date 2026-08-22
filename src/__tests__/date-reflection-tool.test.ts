import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildDateReflectionSummary,
  DATE_REFLECTION_SOURCE,
  DATE_REFLECTION_STEPS,
  EMPTY_DATE_REFLECTION,
  REFLECTION_CHOICE_OPTIONS,
  REFLECTION_DIRECTION_OPTIONS,
  REFLECTION_FEELING_OPTIONS,
  REFLECTION_FOCUS_OPTIONS,
  REFLECTION_NEED_OPTIONS,
  type DateReflectionDraft,
} from "@/content/tools/date-reflection";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const expectUniqueIds = (items: readonly { id: string }[]) => {
  expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
};

describe("local date-reflection learning lab", () => {
  it("keeps an explicit canonical source and a fully rewritten legacy boundary", () => {
    expect(DATE_REFLECTION_SOURCE).toMatchObject({
      sourceKey: "legacy.reflective-learning-loop",
      sourceRevision: "2026-08-14.1",
      legacyCluster: "reflective_learning_loop",
      primaryInspiration: {
        recordId: "L0557",
        sha256: "d05079e64a3ddb2bb5f83d237b6947a3089bfd1b4b74a6c9b732c6a4c928ba92",
      },
      answerHandling: "memory-only-until-refresh",
    });
    expect(DATE_REFLECTION_SOURCE.retainedIdea).toContain("מה שבחרתי לנסות");
    expect(DATE_REFLECTION_SOURCE.rewritePolicy).toContain("נכתבו מחדש");
  });

  it("implements choose, try and check with stable, unique option ids", () => {
    expect(DATE_REFLECTION_STEPS.map((step) => step.id)).toEqual([
      "choose",
      "try",
      "check",
    ]);
    for (const options of [
      REFLECTION_FOCUS_OPTIONS,
      REFLECTION_FEELING_OPTIONS,
      REFLECTION_NEED_OPTIONS,
      REFLECTION_CHOICE_OPTIONS,
      REFLECTION_DIRECTION_OPTIONS,
    ]) {
      expectUniqueIds(options);
    }
  });

  it("builds a useful first-person summary without inventing missing answers", () => {
    const draft: DateReflectionDraft = {
      ...EMPTY_DATE_REFLECTION,
      focus: "presence",
      intention: "  להקשיב   עד הסוף ",
      observation: "שאלתי שאלה ואז עצרתי.",
      feelings: ["curious", "uncertain"],
      needs: ["clarity"],
      choice: "free",
      direction: "clarify",
      nextStep: "לשאול שאלה ישירה.",
    };

    const result = buildDateReflectionSummary(draft);
    expect(result).toContain("לא ניתוח של האדם האחר");
    expect(result).toContain("מה בחרתי לנסות: להקשיב עד הסוף");
    expect(result).toContain("מה קרה בפועל: שאלתי שאלה ואז עצרתי.");
    expect(result).toContain("מה הרגשתי: סקרנות, חוסר בהירות");
    expect(result).toContain("הכיוון שבחרתי: לברר");
    expect(result).not.toContain("undefined");
    expect(result).not.toContain("null");
  });

  it("does not reintroduce the legacy quota, pressure or unsupported-result copy", () => {
    const source = read("src/content/tools/date-reflection.ts");
    const page = read("src/app/tools/date-report/page.tsx");
    const activeCopy = `${source}\n${page}`;

    expect(activeCopy).not.toMatch(
      /מה שלא מדיד|מכפיל פי שניים|להגיע לשני דייטים|חובה!|הכלים שיהפכו את הלמידה|כמה פגישות\? כמה שיחות\?/u,
    );
    expect(activeCopy).toContain("בלי להצמיד לו יעד תוצאה");
    expect(activeCopy).toContain("מותר לי לשנות את הבחירה");
  });

  it("keeps answers in React memory and exposes accessible RTL controls", () => {
    const page = read("src/app/tools/date-report/page.tsx");

    expect(page).not.toMatch(
      /localStorage|sessionStorage|\bfetch\s*\(|useMutation|useAction|@\/convex|convex\/react/u,
    );
    expect(page).toContain('dir="rtl"');
    expect(page).toContain('lang="he"');
    expect(page).toContain('id="main-content" tabIndex={-1}');
    expect(page).toContain("<fieldset>");
    expect(page).toContain("aria-pressed={selected}");
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain('role="alert"');
    expect(page).toContain("maxLength={TEXT_LIMIT}");
    expect(page).toContain("min-h-11");
    expect(page).toContain("עדיף לא לכתוב שמות");
    expect(page).toContain('["pause", "end", "support"]');
    expect(page).toContain("רק כיוונים שלא");
  });

  it("publishes the implemented route honestly in the tools catalog", () => {
    const catalog = read("src/app/tools/page.tsx");
    expect(catalog).toMatch(
      /id: "date-report"[\s\S]*href: "\/tools\/date-report"[\s\S]*available: true[\s\S]*badge: "מקומי"/u,
    );
    expect(catalog).toContain("מה בחרתי לנסות, מה קרה ומה אשמור או אשנה");
  });
});
