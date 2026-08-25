import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { toQuizAttemptSummary } from "../../convex/lib/authorizationPolicy";
import {
  QUIZ_ATTEMPT_POLICY,
  assertQuizAttemptAllowed,
  assertValidQuizAnswerPayload,
  assertValidQuizPassingScore,
  assertValidQuizQuestionContract,
  assertValidQuizTimeTakenSeconds,
  averagePassedQuizScore,
  bestPassedQuizAttempt,
  learnerVisibleQuizScore,
  toLearnerQuizSubmissionResult,
} from "../../convex/lib/quizAssessmentPolicy";
import { learnerQuizSubmissionErrorMessage } from "@/lib/quiz-feedback";

const convexRoot = path.resolve(process.cwd(), "convex");

function readConvex(file: string): string {
  return fs.readFileSync(path.join(convexRoot, file), "utf8");
}

function listConvexTypeScriptFiles(directory = convexRoot): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listConvexTypeScriptFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".ts") ? [absolute] : [];
  });
}

function exportedFunction(file: string, name: string): string {
  const source = readConvex(file);
  const start = source.indexOf(`export const ${name} =`);
  expect(start, `${file}:${name} must exist`).toBeGreaterThanOrEqual(0);
  const next = source.indexOf("\nexport const ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

const validQuestions = [
  { options: ["A", "B"], correctIndex: 1, order: 0 },
  { options: ["A", "B", "C"], correctIndex: 2, order: 1 },
];

describe("quiz-result DTO containment", () => {
  it("does not expose submitted answers or the target user row", () => {
    const summary = toQuizAttemptSummary({
      _id: "attempt-1",
      _creationTime: 1,
      userId: "user-1",
      quizId: "quiz-1",
      lessonId: "lesson-1",
      courseId: "course-1",
      answers: [1, 2],
      score: 100,
      passed: true,
      attemptedAt: 2,
    });

    expect(summary).toEqual({
      _id: "attempt-1",
      _creationTime: 1,
      quizId: "quiz-1",
      lessonId: "lesson-1",
      courseId: "course-1",
      score: 100,
      passed: true,
      attemptedAt: 2,
    });
    expect(summary).not.toHaveProperty("answers");
    expect(summary).not.toHaveProperty("userId");
    expect(summary).not.toHaveProperty("correctIndex");
    expect(summary).not.toHaveProperty("explanation");
  });

  it("masks numeric history for failed attempts", () => {
    const summary = toQuizAttemptSummary({
      _id: "attempt-failed",
      _creationTime: 1,
      userId: "user-1",
      quizId: "quiz-1",
      lessonId: "lesson-1",
      courseId: "course-1",
      answers: [0, 0],
      score: 50,
      passed: false,
      attemptedAt: 2,
    });

    expect(summary.score).toBeNull();
    expect(learnerVisibleQuizScore({ score: 50, passed: false })).toBeNull();
    expect(
      averagePassedQuizScore([
        { score: 25, passed: false },
        { score: 50, passed: false },
      ])
    ).toBeNull();
    expect(
      averagePassedQuizScore([
        { score: 50, passed: false },
        { score: 80, passed: true },
        { score: 100, passed: true },
      ])
    ).toBe(90);
  });

  it("never selects a failed row as the learner-visible best attempt", () => {
    const failedOnly = [
      { id: "low", score: 20, passed: false },
      { id: "higher", score: 79, passed: false },
    ];
    expect(bestPassedQuizAttempt(failedOnly)).toBeNull();

    const selected = bestPassedQuizAttempt([
      ...failedOnly,
      { id: "passed", score: 80, passed: true },
    ]);
    expect(selected?.id).toBe("passed");
  });
});

describe("quiz anti-oracle policy", () => {
  it("maps policy failures to useful feedback without exposing grading", () => {
    expect(
      learnerQuizSubmissionErrorMessage(new Error("QUIZ_ATTEMPT_COOLDOWN"))
    ).toContain("להמתין דקה");
    expect(
      learnerQuizSubmissionErrorMessage(
        new Error("QUIZ_ATTEMPT_WINDOW_EXHAUSTED")
      )
    ).toContain("שלוש ההגשות");
    expect(
      learnerQuizSubmissionErrorMessage(new Error("QUIZ_ALREADY_PASSED"))
    ).toContain("כבר הושלם");
    expect(learnerQuizSubmissionErrorMessage(new Error("network"))).not.toMatch(
      /score|correct|ציון/u
    );
  });

  it("withholds quantitative feedback for failures and blocks key reconstruction", () => {
    const answerKey = [3, 2, 1, 0, 3, 2];
    const attempts: Array<{ attemptedAt: number; passed: boolean }> = [];
    let now = 1_000_000;
    const observations: Array<ReturnType<typeof toLearnerQuizSubmissionResult>> = [];

    for (const answers of [
      [0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0],
    ]) {
      const allowance = assertQuizAttemptAllowed(attempts, now);
      const correctCount = answers.filter(
        (answer, index) => answer === answerKey[index]
      ).length;
      const score = Math.round((correctCount / answerKey.length) * 100);
      const passed = score >= 80;
      attempts.push({ attemptedAt: now, passed });
      observations.push(
        toLearnerQuizSubmissionResult({
          attemptId: `attempt-${attempts.length}`,
          score,
          correctCount,
          totalQuestions: answerKey.length,
          passed,
          allowance,
        })
      );
      now += QUIZ_ATTEMPT_POLICY.cooldownMs;
    }

    expect(observations.every((result) => result.score === null)).toBe(true);
    expect(observations.every((result) => result.correctCount === null)).toBe(true);
    expect(() => assertQuizAttemptAllowed(attempts, now)).toThrow(
      "QUIZ_ATTEMPT_WINDOW_EXHAUSTED"
    );
    // The attacker receives no per-guess delta and is stopped after 3 calls,
    // so none of the six answer positions can be reconstructed.
    const reconstructedPositions = new Set<number>();
    for (let index = 1; index < observations.length; index++) {
      const previous = observations[index - 1].correctCount;
      const current = observations[index].correctCount;
      if (previous !== null && current !== null && previous !== current) {
        reconstructedPositions.add(index - 1);
      }
    }
    expect(reconstructedPositions.size).toBe(0);

    const nextWindowAllowance = assertQuizAttemptAllowed(
      attempts,
      now + QUIZ_ATTEMPT_POLICY.windowMs
    );
    const nextWindowFailure = toLearnerQuizSubmissionResult({
      attemptId: "next-window-failure",
      score: 67,
      correctCount: 4,
      totalQuestions: answerKey.length,
      passed: false,
      allowance: nextWindowAllowance,
    });
    expect(nextWindowFailure.score).toBeNull();
    expect(nextWindowFailure.correctCount).toBeNull();
  });

  it("enforces cooldown and permanently closes submissions after a pass", () => {
    const firstAttemptAt = 2_000_000;
    const failedAttempt = [{ attemptedAt: firstAttemptAt, passed: false }];

    expect(() =>
      assertQuizAttemptAllowed(
        failedAttempt,
        firstAttemptAt + QUIZ_ATTEMPT_POLICY.cooldownMs - 1
      )
    ).toThrow("QUIZ_ATTEMPT_COOLDOWN");
    expect(() =>
      assertQuizAttemptAllowed(
        failedAttempt,
        firstAttemptAt + QUIZ_ATTEMPT_POLICY.cooldownMs
      )
    ).not.toThrow();
    expect(() =>
      assertQuizAttemptAllowed(
        [{ attemptedAt: firstAttemptAt, passed: true }],
        firstAttemptAt + QUIZ_ATTEMPT_POLICY.windowMs
      )
    ).toThrow("QUIZ_ALREADY_PASSED");
  });

  it("reveals exact feedback only on the passing result", () => {
    const result = toLearnerQuizSubmissionResult({
      attemptId: "passed-attempt",
      score: 100,
      correctCount: 4,
      totalQuestions: 4,
      passed: true,
      allowance: {
        attemptNumber: 1,
        attemptsRemainingAfterSubmit: 2,
      },
    });
    expect(result).toMatchObject({
      score: 100,
      correctCount: 4,
      passed: true,
      retryAfterSeconds: null,
      feedback: "passed",
    });
  });
});

describe("shared quiz submission contract", () => {
  it("accepts exactly one valid answer slot per question, including -1", () => {
    expect(() => assertValidQuizQuestionContract(validQuestions)).not.toThrow();
    expect(() =>
      assertValidQuizAnswerPayload([-1, 2], validQuestions)
    ).not.toThrow();
  });

  it("fails closed on a malformed passing threshold", () => {
    for (const valid of [0, 80, 100]) {
      expect(() => assertValidQuizPassingScore(valid)).not.toThrow();
    }
    for (const invalid of [-1, 70.5, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => assertValidQuizPassingScore(invalid)).toThrow(
        "QUIZ_PASSING_SCORE_INVALID"
      );
    }
  });

  it.each([
    { name: "too few", answers: [1], error: "QUIZ_ANSWER_COUNT_MISMATCH" },
    {
      name: "too many",
      answers: [1, 2, 0],
      error: "QUIZ_ANSWER_COUNT_MISMATCH",
    },
    { name: "below sentinel", answers: [-2, 2], error: "QUIZ_ANSWER_OUT_OF_RANGE:0" },
    { name: "equal to option count", answers: [2, 2], error: "QUIZ_ANSWER_OUT_OF_RANGE:0" },
    { name: "fractional", answers: [0.5, 2], error: "QUIZ_ANSWER_OUT_OF_RANGE:0" },
    { name: "NaN", answers: [Number.NaN, 2], error: "QUIZ_ANSWER_OUT_OF_RANGE:0" },
    { name: "infinite", answers: [Number.POSITIVE_INFINITY, 2], error: "QUIZ_ANSWER_OUT_OF_RANGE:0" },
  ])("rejects $name answer payloads", ({ answers, error }) => {
    expect(() => assertValidQuizAnswerPayload(answers, validQuestions)).toThrow(
      error
    );
  });

  it.each([
    {
      name: "fewer than two options",
      questions: [{ options: ["A"], correctIndex: 0, order: 0 }],
      error: "QUIZ_QUESTION_OPTIONS_INVALID:0",
    },
    {
      name: "negative correct index",
      questions: [{ options: ["A", "B"], correctIndex: -1, order: 0 }],
      error: "QUIZ_CORRECT_INDEX_INVALID:0",
    },
    {
      name: "out-of-range correct index",
      questions: [{ options: ["A", "B"], correctIndex: 2, order: 0 }],
      error: "QUIZ_CORRECT_INDEX_INVALID:0",
    },
    {
      name: "fractional order",
      questions: [{ options: ["A", "B"], correctIndex: 1, order: 0.5 }],
      error: "QUIZ_QUESTION_ORDER_INVALID:0",
    },
    {
      name: "unsafe integer order",
      questions: [
        { options: ["A", "B"], correctIndex: 1, order: Number.MAX_VALUE },
      ],
      error: "QUIZ_QUESTION_ORDER_INVALID:0",
    },
    {
      name: "duplicate order",
      questions: [
        { options: ["A", "B"], correctIndex: 1, order: 0 },
        { options: ["A", "B"], correctIndex: 0, order: 0 },
      ],
      error: "QUIZ_QUESTION_ORDER_DUPLICATE:0",
    },
  ])("rejects $name in stored grading data", ({ questions, error }) => {
    expect(() => assertValidQuizQuestionContract(questions)).toThrow(error);
  });

  it("accepts only non-negative integer elapsed time", () => {
    expect(() => assertValidQuizTimeTakenSeconds(0)).not.toThrow();
    expect(() => assertValidQuizTimeTakenSeconds(125)).not.toThrow();
    for (const invalid of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_VALUE,
    ]) {
      expect(() => assertValidQuizTimeTakenSeconds(invalid)).toThrow(
        "QUIZ_TIME_TAKEN_INVALID"
      );
    }
  });
});

describe("quizResults public function boundaries", () => {
  const userScopedFunctions = [
    "getAttemptsByUserAndQuiz",
    "getAttemptsByUserAndCourse",
    "getAllAttemptsByUser",
    "getBestScore",
    "submitEnhancedAttempt",
    "getUserQuizSummary",
  ];

  it.each(userScopedFunctions)("%s is self-or-admin guarded", (name) => {
    const body = exportedFunction("quizResults.ts", name);
    if (name === "submitEnhancedAttempt") {
      expect(body).toContain("handler: submitLearnerQuizAttempt");
      expect(readConvex("lib/quizSubmission.ts")).toContain(
        "requireSelfOrAdmin(ctx, args.userId)"
      );
    } else {
      expect(body).toContain("requireSelfOrAdmin(ctx, args.userId)");
    }
  });

  it.each([
    "getAttemptsByUserAndQuiz",
    "getAttemptsByUserAndCourse",
    "getAllAttemptsByUser",
    "getBestScore",
    "getUserQuizSummary",
  ])("%s gates every referenced course", (name) => {
    expect(exportedFunction("quizResults.ts", name)).toContain(
      "requireCourseContentAccess(ctx"
    );
  });

  it.each([
    "getAttemptsByUserAndQuiz",
    "getAttemptsByUserAndCourse",
    "getAllAttemptsByUser",
    "getBestScore",
  ])("%s returns projected attempts without answer arrays", (name) => {
    const body = exportedFunction("quizResults.ts", name);
    expect(body).toContain("toQuizAttemptSummary");
    expect(body).not.toContain('query("quizQuestions")');
    expect(body).not.toContain("correctIndex");
    expect(body).not.toContain("explanation");
  });

  it("narrows all-user reads at the database index before returning data", () => {
    for (const name of ["getAllAttemptsByUser", "getUserQuizSummary"]) {
      expect(exportedFunction("quizResults.ts", name)).toContain(
        '.withIndex("by_user_quiz", (q) => q.eq("userId", args.userId))'
      );
    }
  });

  it("selects best score only from passed attempts before projecting it", () => {
    const body = exportedFunction("quizResults.ts", "getBestScore");
    expect(body).toContain("bestPassedQuizAttempt(attempts)");
    expect(body).not.toContain("attempt.score > bestAttempt.score");
  });

  it("routes enhanced submission through the single guarded grader", () => {
    const submit = exportedFunction("quizResults.ts", "submitEnhancedAttempt");
    expect(submit).toContain("handler: submitLearnerQuizAttempt");
    expect(submit).not.toContain("correctCount");
    expect(submit).not.toContain("ctx.db.insert");
  });

  it("routes both quizzes.ts submit aliases through the same grader", () => {
    for (const name of ["submitQuizAnswer", "submitAttempt"]) {
      const submit = exportedFunction("quizzes.ts", name);
      expect(submit).toContain("handler: submitLearnerQuizAttempt");
      expect(submit).not.toContain("correctCount");
      expect(submit).not.toContain("ctx.db.insert");
    }
    for (const name of ["getQuizResults", "getLastAttempt"]) {
      expect(exportedFunction("quizzes.ts", name)).toContain(
        "toQuizAttemptSummary"
      );
    }
  });

  it("allows exactly one quiz-attempt writer across the Convex source tree", () => {
    const writers = listConvexTypeScriptFiles()
      .filter((file) =>
        fs.readFileSync(file, "utf8").includes('insert("quizAttempts"')
      )
      .map((file) => path.relative(convexRoot, file).replaceAll("\\", "/"));
    expect(writers).toEqual(["lib/quizSubmission.ts"]);
  });

  it("keeps every learner-visible score surface on the masked helpers", () => {
    expect(readConvex("lib/authorizationPolicy.ts")).toContain(
      "score: attempt.passed ? attempt.score : null"
    );
    expect(readConvex("analytics.ts")).toContain(
      "score: learnerVisibleQuizScore(attempt)"
    );
    expect(readConvex("studentProgress.ts")).toContain(
      "averagePassedQuizScore(courseQuizAttempts)"
    );
    expect(readConvex("gamification.ts")).toContain(
      "averagePassedQuizScore(userAttempts)"
    );
    expect(readConvex("analytics.ts")).not.toContain(
      "find((a) => a.score === 100)"
    );
    expect(readConvex("gamification.ts")).not.toMatch(
      /(?:find|filter|some)\(\(a\) => a\.score === 100\)/u
    );
    expect(readConvex("studentProgress.ts")).not.toContain(
      "(attempt) => attempt.score === 100"
    );
  });

  it("fails the unused admin stats surface closed until a bounded index exists", () => {
    const stats = exportedFunction("quizzes.ts", "getQuizStats");
    expect(stats).toContain("QUIZ_STATS_REQUIRES_BOUNDED_INDEX");
    expect(stats).not.toContain('.query("quizAttempts")');
    expect(stats).not.toContain(".collect()");
  });

  it("never scans the complete attempt index for per-user analytics", () => {
    for (const file of ["analytics.ts", "gamification.ts"]) {
      const source = readConvex(file);
      expect(source).not.toContain('.withIndex("by_user_quiz")');
      for (const match of source.matchAll(/\.withIndex\("by_user_quiz"/g)) {
        const surrounding = source.slice(match.index, match.index + 100);
        expect(surrounding).toContain('.eq("userId",');
      }
    }
  });

  it("contains leaderboard-wide fan-out until a bounded aggregate exists", () => {
    const leaderboard = exportedFunction("gamification.ts", "getLeaderboard");
    const xpLeaderboard = exportedFunction(
      "gamification.ts",
      "getXpLeaderboard"
    );
    expect(leaderboard).toContain("LEADERBOARD_REQUIRES_BOUNDED_AGGREGATE");
    expect(xpLeaderboard).toContain(
      "XP_LEADERBOARD_REQUIRES_BOUNDED_AGGREGATE"
    );
    for (const body of [leaderboard, xpLeaderboard]) {
      expect(body).not.toContain('.query("users")');
      expect(body).not.toContain('query("quizAttempts")');
      expect(body).not.toContain("Promise.all(");
    }
  });

  it("keeps the sole quizResults UI call site on the summary fields", () => {
    const page = fs.readFileSync(
      path.resolve(process.cwd(), "src", "app", "quiz", "[id]", "page.tsx"),
      "utf8"
    );
    expect(page).toContain("api.quizResults.getBestScore");
    expect(page).toContain("bestScore.score");
    expect(page).not.toMatch(/bestScore\s*\.\s*(answers|correctIndex|explanation)/u);
  });
});
