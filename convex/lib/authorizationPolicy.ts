export const AUTHORIZATION_ERRORS = {
  authenticationRequired: "AUTHENTICATION_REQUIRED",
  userRecordRequired: "USER_RECORD_REQUIRED",
  ownershipRequired: "RESOURCE_OWNERSHIP_REQUIRED",
  selfOrAdminRequired: "SELF_OR_ADMIN_REQUIRED",
  adminRequired: "ADMIN_ACCESS_REQUIRED",
  courseNotEnrolled: "COURSE_ENROLLMENT_REQUIRED",
  courseEntitlementUntrusted: "COURSE_ENTITLEMENT_UNTRUSTED",
} as const;

export type UserRole = "student" | "admin";

export type CourseContentDecision =
  | "allow-admin"
  | "allow-trusted-entitlement"
  | "deny-unauthenticated"
  | "deny-user-record-missing"
  | "deny-not-enrolled"
  | "deny-untrusted-enrollment";

/**
 * Course access is intentionally fail-closed for students.
 *
 * The current `enrollments` table proves only that a row exists. Its public
 * self-enrol mutation means the row does not prove payment, invitation, or an
 * admin grant. Until a trusted issuer/provenance field exists, an enrollment
 * must not unlock paid lesson, quiz, PDF, or video content.
 */
export function decideCourseContentAccess(input: {
  authenticated: boolean;
  userRole: UserRole | null;
  hasEnrollment: boolean;
  hasTrustedEntitlement: boolean;
}): CourseContentDecision {
  if (!input.authenticated) return "deny-unauthenticated";
  if (input.userRole === null) return "deny-user-record-missing";
  if (input.userRole === "admin") return "allow-admin";
  if (input.hasTrustedEntitlement) return "allow-trusted-entitlement";
  if (!input.hasEnrollment) return "deny-not-enrolled";
  return "deny-untrusted-enrollment";
}

export function courseDecisionError(decision: CourseContentDecision): string | null {
  switch (decision) {
    case "allow-admin":
    case "allow-trusted-entitlement":
      return null;
    case "deny-unauthenticated":
      return AUTHORIZATION_ERRORS.authenticationRequired;
    case "deny-user-record-missing":
      return AUTHORIZATION_ERRORS.userRecordRequired;
    case "deny-not-enrolled":
      return AUTHORIZATION_ERRORS.courseNotEnrolled;
    case "deny-untrusted-enrollment":
      return AUTHORIZATION_ERRORS.courseEntitlementUntrusted;
    default: {
      const exhaustive: never = decision;
      return exhaustive;
    }
  }
}

export function isClerkResourceOwner(
  callerSubject: string | null,
  ownerSubject: string
): boolean {
  return callerSubject !== null && callerSubject === ownerSubject;
}

export function isSelfOrAdmin(
  callerUserId: string | null,
  targetUserId: string,
  callerRole: UserRole | null
): boolean {
  return (
    callerUserId !== null &&
    (callerUserId === targetUserId || callerRole === "admin")
  );
}

export type StoredQuizQuestion = {
  _id: string;
  _creationTime: number;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  order: number;
};

/** Learner-facing projection: answer key and explanation never cross the API. */
export function toLearnerQuizQuestion<T extends StoredQuizQuestion>(question: T) {
  return {
    _id: question._id,
    _creationTime: question._creationTime,
    quizId: question.quizId,
    question: question.question,
    options: question.options,
    order: question.order,
  };
}

export type StoredQuizAttempt = {
  _id: unknown;
  _creationTime: number;
  userId: unknown;
  quizId: unknown;
  lessonId: unknown;
  courseId: unknown;
  answers: number[];
  score: number;
  passed: boolean;
  attemptedAt: number;
};

/**
 * Learner/admin result projection. Submitted choices are deliberately omitted,
 * and a failed attempt's numeric score is masked. Otherwise the history query
 * would recreate the same score oracle that the submission response closes.
 */
export function toQuizAttemptSummary<T extends StoredQuizAttempt>(attempt: T) {
  return {
    _id: attempt._id,
    _creationTime: attempt._creationTime,
    quizId: attempt.quizId,
    lessonId: attempt.lessonId,
    courseId: attempt.courseId,
    score: attempt.passed ? attempt.score : null,
    passed: attempt.passed,
    attemptedAt: attempt.attemptedAt,
  };
}

export function toPublicLessonSummary<
  T extends { content?: string; videoUrl?: string; pdfUrl?: string }
>(lesson: T) {
  return {
    ...lesson,
    content: undefined,
    videoUrl: undefined,
    pdfUrl: undefined,
  };
}

export type StoredCertificate = {
  _id: unknown;
  _creationTime: number;
  userId: unknown;
  courseId: unknown;
  userName: string;
  courseName: string;
  completionPercent: number;
  issuedAt: number;
  certificateNumber: string;
};

/** Public verification/share projection: internal relationship IDs stay private. */
export function toPublicCertificate<T extends StoredCertificate>(certificate: T) {
  return {
    _id: certificate._id,
    userName: certificate.userName,
    courseName: certificate.courseName,
    completionPercent: certificate.completionPercent,
    issuedAt: certificate.issuedAt,
    certificateNumber: certificate.certificateNumber,
  };
}
