export const QUIZ_ASSESSMENT_ERRORS = {
  answerCountMismatch: "QUIZ_ANSWER_COUNT_MISMATCH",
  timeTakenInvalid: "QUIZ_TIME_TAKEN_INVALID",
  alreadyPassed: "QUIZ_ALREADY_PASSED",
  cooldownActive: "QUIZ_ATTEMPT_COOLDOWN",
  attemptWindowExhausted: "QUIZ_ATTEMPT_WINDOW_EXHAUSTED",
} as const;

/**
 * Interim anti-oracle policy. The 24-hour reset is intentionally conservative:
 * it closes automated key reconstruction without creating a permanent lockout
 * while the product owner decides the long-term retry/mastery model.
 */
export const QUIZ_ATTEMPT_POLICY = {
  cooldownMs: 60_000,
  maxAttemptsPerWindow: 3,
  windowMs: 24 * 60 * 60 * 1_000,
} as const;

export type GradableQuizQuestion = {
  options: string[];
  correctIndex: number;
  order: number;
};

export type QuizAttemptForPolicy = {
  attemptedAt: number;
  passed: boolean;
};

export type LearnerQuizSubmissionResult<TAttemptId> = {
  attemptId: TAttemptId;
  passed: boolean;
  /** Exact grading is withheld on a failed attempt to prevent score-oracle use. */
  score: number | null;
  correctCount: number | null;
  totalQuestions: number;
  attemptNumber: number;
  attemptsRemaining: number;
  retryAfterSeconds: number | null;
  feedback: "passed" | "retry_after_cooldown" | "attempt_window_exhausted";
};

export type QuizAttemptAllowance = {
  attemptNumber: number;
  attemptsRemainingAfterSubmit: number;
};

/**
 * Enforce the same retry policy before every public quiz submission path.
 * Convex mutations are transactional, so concurrent submissions that race on
 * this read are retried against the winning insert rather than bypassing it.
 */
export function assertQuizAttemptAllowed(
  attempts: QuizAttemptForPolicy[],
  now: number
): QuizAttemptAllowance {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new Error("QUIZ_ATTEMPT_CLOCK_INVALID");
  }
  if (attempts.some((attempt) => attempt.passed)) {
    throw new Error(QUIZ_ASSESSMENT_ERRORS.alreadyPassed);
  }

  const latestAttemptAt = attempts.reduce(
    (latest, attempt) => Math.max(latest, attempt.attemptedAt),
    Number.NEGATIVE_INFINITY
  );
  if (now - latestAttemptAt < QUIZ_ATTEMPT_POLICY.cooldownMs) {
    throw new Error(QUIZ_ASSESSMENT_ERRORS.cooldownActive);
  }

  const windowStart = now - QUIZ_ATTEMPT_POLICY.windowMs;
  const attemptsInWindow = attempts.filter(
    (attempt) => attempt.attemptedAt >= windowStart
  ).length;
  if (attemptsInWindow >= QUIZ_ATTEMPT_POLICY.maxAttemptsPerWindow) {
    throw new Error(QUIZ_ASSESSMENT_ERRORS.attemptWindowExhausted);
  }

  return {
    attemptNumber: attempts.length + 1,
    attemptsRemainingAfterSubmit:
      QUIZ_ATTEMPT_POLICY.maxAttemptsPerWindow - attemptsInWindow - 1,
  };
}

/**
 * A failed attempt returns only a binary outcome plus retry policy metadata.
 * Exact score/count become visible only on a passing attempt; future submits
 * are then rejected by `assertQuizAttemptAllowed`.
 */
export function toLearnerQuizSubmissionResult<TAttemptId>(input: {
  attemptId: TAttemptId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  allowance: QuizAttemptAllowance;
}): LearnerQuizSubmissionResult<TAttemptId> {
  const attemptsRemaining = input.allowance.attemptsRemainingAfterSubmit;
  return {
    attemptId: input.attemptId,
    passed: input.passed,
    score: input.passed ? input.score : null,
    correctCount: input.passed ? input.correctCount : null,
    totalQuestions: input.totalQuestions,
    attemptNumber: input.allowance.attemptNumber,
    attemptsRemaining,
    retryAfterSeconds:
      input.passed || attemptsRemaining === 0
        ? null
        : Math.ceil(QUIZ_ATTEMPT_POLICY.cooldownMs / 1_000),
    feedback: input.passed
      ? "passed"
      : attemptsRemaining === 0
        ? "attempt_window_exhausted"
        : "retry_after_cooldown",
  };
}

/** Learner-visible history never reveals the numeric score of a failed try. */
export function learnerVisibleQuizScore(attempt: {
  score: number;
  passed: boolean;
}): number | null {
  return attempt.passed ? attempt.score : null;
}

/** Aggregates only passed attempts, so repeated failures cannot leak deltas. */
export function averagePassedQuizScore(
  attempts: Array<{ score: number; passed: boolean }>
): number | null {
  const passedAttempts = attempts.filter((attempt) => attempt.passed);
  if (passedAttempts.length === 0) return null;
  return Math.round(
    passedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
      passedAttempts.length
  );
}

/**
 * Select only among passed attempts. Choosing the highest failed row and then
 * masking its score still leaks which payload improved through the returned
 * attempt id/timestamp, recreating a comparison oracle.
 */
export function bestPassedQuizAttempt<
  T extends { score: number; passed: boolean },
>(attempts: T[]): T | null {
  const passedAttempts = attempts.filter((attempt) => attempt.passed);
  if (passedAttempts.length === 0) return null;
  return passedAttempts.reduce((bestAttempt, attempt) =>
    attempt.score > bestAttempt.score ? attempt : bestAttempt
  );
}

/**
 * Fail closed when stored grading data cannot define one deterministic answer
 * per question. Canonical sync validates this earlier; submission validates it
 * again so legacy or manually edited rows cannot be graded ambiguously.
 */
export function assertValidQuizQuestionContract(
  questions: GradableQuizQuestion[]
): void {
  const seenOrders = new Set<number>();

  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];
    if (question.options.length < 2) {
      throw new Error(`QUIZ_QUESTION_OPTIONS_INVALID:${index}`);
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      throw new Error(`QUIZ_CORRECT_INDEX_INVALID:${index}`);
    }
    if (!Number.isSafeInteger(question.order) || question.order < 0) {
      throw new Error(`QUIZ_QUESTION_ORDER_INVALID:${index}`);
    }
    if (seenOrders.has(question.order)) {
      throw new Error(`QUIZ_QUESTION_ORDER_DUPLICATE:${question.order}`);
    }
    seenOrders.add(question.order);
  }
}

/**
 * The learner must submit exactly one answer slot per sorted question.
 * `-1` is the established client sentinel for timeout/unanswered; every other
 * value must be a real option index.
 */
export function assertValidQuizAnswerPayload(
  answers: number[],
  questions: Array<Pick<GradableQuizQuestion, "options">>
): void {
  if (answers.length !== questions.length) {
    throw new Error(QUIZ_ASSESSMENT_ERRORS.answerCountMismatch);
  }

  for (let index = 0; index < questions.length; index++) {
    const answer = answers[index];
    if (
      !Number.isInteger(answer) ||
      answer < -1 ||
      answer >= questions[index].options.length
    ) {
      throw new Error(`QUIZ_ANSWER_OUT_OF_RANGE:${index}`);
    }
  }
}

export function assertValidQuizTimeTakenSeconds(
  timeTakenSeconds: number
): void {
  if (!Number.isSafeInteger(timeTakenSeconds) || timeTakenSeconds < 0) {
    throw new Error(QUIZ_ASSESSMENT_ERRORS.timeTakenInvalid);
  }
}

/** A malformed threshold can turn "perfect but failed" into a derived oracle. */
export function assertValidQuizPassingScore(passingScore: number): void {
  if (
    !Number.isSafeInteger(passingScore) ||
    passingScore < 0 ||
    passingScore > 100
  ) {
    throw new Error("QUIZ_PASSING_SCORE_INVALID");
  }
}
