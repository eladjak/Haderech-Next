import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import generated from "../../convex/weeklyQuizData.generated.json";

function exportedFunction(source: string, name: string): string {
  const start = source.indexOf(`export const ${name} =`);
  expect(start, `quizzes.ts:${name} must exist`).toBeGreaterThanOrEqual(0);
  const next = source.indexOf("\nexport const ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

describe("canonical weekly-assessment projection", () => {
  it("accounts for every canonical item explicitly", () => {
    expect(generated.contractId).toBe("oh.assessment.weekly.v1");
    expect(generated.totals).toEqual({
      weeks: 12,
      canonicalItems: 97,
      gradedItems: 84,
      excludedItems: 13,
      exactCanonicalProjectionOverlap: 84,
    });
    expect(generated.totals.canonicalItems).toBe(
      generated.totals.gradedItems + generated.totals.excludedItems
    );
  });

  it("projects only scored question types and preserves stable source IDs", () => {
    const questions = generated.quizzes.flatMap((quiz) => quiz.questions);
    const sourceIds = questions.map((question) => question.sourceId);

    expect(questions).toHaveLength(84);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    for (const question of questions) {
      expect(question.sourceId).toMatch(/^w(?:[1-9]|1[0-2])q[1-9][0-9]*$/u);
      expect(["multiple_choice", "true_false"]).toContain(question.questionType);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.options.every((option) => !/^\s*[א-ת][.)]\s*/u.test(option))).toBe(
        true
      );
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("retains every reflection as an explicit, ungraded exclusion", () => {
    expect(generated.excludedItems).toHaveLength(13);
    expect(generated.excludedItems.every((item) => item.type === "reflection")).toBe(true);
    expect(generated.excludedItems.every((item) => item.reason.trim().length > 0)).toBe(true);
  });

  it("pins each managed quiz to a stable key and content digest", () => {
    expect(generated.quizzes).toHaveLength(12);
    expect(new Set(generated.quizzes.map((quiz) => quiz.sourceKey)).size).toBe(12);
    for (const [index, quiz] of generated.quizzes.entries()) {
      expect(quiz.weekNumber).toBe(index + 1);
      expect(quiz.sourceKey).toBe(
        `oh.assessment.week-${String(index + 1).padStart(2, "0")}`
      );
      expect(quiz.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/u);
    }
  });

  it("does not leave a guessable answer-position or true/false pattern", () => {
    const mcCounts = Object.values(
      generated.qualitySignals.multipleChoiceCorrectIndexDistribution
    );
    const tfPositionCounts = Object.values(
      generated.qualitySignals.trueFalseCorrectIndexDistribution
    );

    expect(Math.max(...mcCounts)).toBeLessThanOrEqual(18);
    expect(Math.min(...mcCounts)).toBeGreaterThanOrEqual(13);
    expect(Math.max(...tfPositionCounts)).toBeLessThanOrEqual(14);
    expect(generated.qualitySignals.trueFalseAnswerDistribution).toEqual({
      true: 12,
      false: 11,
    });
    expect(generated.qualitySignals.warnings).toEqual([]);
  });

  it("uses deterministic upsert semantics instead of skip-existing deployment logic", () => {
    const seed = fs.readFileSync(
      path.resolve(process.cwd(), "convex", "seedWeeklyQuizzes.ts"),
      "utf8"
    );
    expect(seed).toContain("ctx.db.patch");
    expect(seed).toContain("ctx.db.delete");
    expect(seed).toContain("conflicts");
    expect(seed).toContain("HISTORICAL_ATTEMPTS_REQUIRE_VERSIONED_MIGRATION");
    expect(seed).toContain("QUIZ_SYNC_CONFLICT");
    expect(seed).not.toContain("skipped++");
  });

  it("wires every learner question read through the answer-key projection", () => {
    const quizzes = fs.readFileSync(
      path.resolve(process.cwd(), "convex", "quizzes.ts"),
      "utf8"
    );
    for (const name of ["getQuizByLesson", "getQuestions"]) {
      const handler = exportedFunction(quizzes, name);
      expect(handler).toContain("toLearnerQuizQuestion");
      expect(handler).not.toMatch(/return\s+(?:await\s+)?ctx\.db\s*\.query\("quizQuestions"\)/u);
    }
  });
});
