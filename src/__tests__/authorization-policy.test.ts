import { describe, expect, it } from "vitest";
import {
  AUTHORIZATION_ERRORS,
  courseDecisionError,
  decideCourseContentAccess,
  isClerkResourceOwner,
  isSelfOrAdmin,
  toLearnerQuizQuestion,
  toPublicCertificate,
  toPublicLessonSummary,
  type CourseContentDecision,
} from "../../convex/lib/authorizationPolicy";

describe("course-content authorization matrix", () => {
  const rows: Array<{
    name: string;
    authenticated: boolean;
    userRole: "student" | "admin" | null;
    hasEnrollment: boolean;
    hasTrustedEntitlement: boolean;
    expected: CourseContentDecision;
    error: string | null;
  }> = [
    {
      name: "anonymous caller",
      authenticated: false,
      userRole: null,
      hasEnrollment: false,
      hasTrustedEntitlement: false,
      expected: "deny-unauthenticated",
      error: AUTHORIZATION_ERRORS.authenticationRequired,
    },
    {
      name: "identity without a users row",
      authenticated: true,
      userRole: null,
      hasEnrollment: false,
      hasTrustedEntitlement: false,
      expected: "deny-user-record-missing",
      error: AUTHORIZATION_ERRORS.userRecordRequired,
    },
    {
      name: "student without enrollment",
      authenticated: true,
      userRole: "student",
      hasEnrollment: false,
      hasTrustedEntitlement: false,
      expected: "deny-not-enrolled",
      error: AUTHORIZATION_ERRORS.courseNotEnrolled,
    },
    {
      name: "student with self-asserted enrollment",
      authenticated: true,
      userRole: "student",
      hasEnrollment: true,
      hasTrustedEntitlement: false,
      expected: "deny-untrusted-enrollment",
      error: AUTHORIZATION_ERRORS.courseEntitlementUntrusted,
    },
    {
      name: "student with a trusted, active entitlement",
      authenticated: true,
      userRole: "student",
      hasEnrollment: false,
      hasTrustedEntitlement: true,
      expected: "allow-trusted-entitlement",
      error: null,
    },
    {
      name: "existing admin role",
      authenticated: true,
      userRole: "admin",
      hasEnrollment: false,
      hasTrustedEntitlement: false,
      expected: "allow-admin",
      error: null,
    },
  ];

  for (const row of rows) {
    it(`${row.name} -> ${row.expected}`, () => {
      const decision = decideCourseContentAccess(row);
      expect(decision).toBe(row.expected);
      expect(courseDecisionError(decision)).toBe(row.error);
    });
  }
});

describe("Clerk-subject ownership", () => {
  it("allows the authenticated owner", () => {
    expect(isClerkResourceOwner("clerk-user-a", "clerk-user-a")).toBe(true);
  });

  it("rejects an unauthenticated caller", () => {
    expect(isClerkResourceOwner(null, "clerk-user-a")).toBe(false);
  });

  it("rejects cross-user access", () => {
    expect(isClerkResourceOwner("clerk-user-b", "clerk-user-a")).toBe(false);
  });
});

describe("user-row authorization matrix", () => {
  it("rejects an anonymous caller", () => {
    expect(isSelfOrAdmin(null, "user-a", null)).toBe(false);
  });

  it("allows user A to access user A", () => {
    expect(isSelfOrAdmin("user-a", "user-a", "student")).toBe(true);
  });

  it("rejects user B accessing user A", () => {
    expect(isSelfOrAdmin("user-b", "user-a", "student")).toBe(false);
  });

  it("allows an existing admin to access user A", () => {
    expect(isSelfOrAdmin("admin-user", "user-a", "admin")).toBe(true);
  });
});

describe("learner DTO containment", () => {
  it("does not serialize quiz answer keys or explanations", () => {
    const dto = toLearnerQuizQuestion({
      _id: "question-1",
      _creationTime: 1,
      quizId: "quiz-1",
      sourceId: "w1q1",
      questionType: "multiple_choice" as const,
      question: "Question?",
      options: ["A", "B"],
      correctIndex: 1,
      explanation: "B is correct",
      order: 0,
    });

    expect(dto).toEqual({
      _id: "question-1",
      _creationTime: 1,
      quizId: "quiz-1",
      question: "Question?",
      options: ["A", "B"],
      order: 0,
    });
    expect(dto).not.toHaveProperty("correctIndex");
    expect(dto).not.toHaveProperty("explanation");
    expect(dto).not.toHaveProperty("sourceId");
    expect(dto).not.toHaveProperty("questionType");
  });

  it("does not serialize lesson text, video, or PDF locations", () => {
    const dto = toPublicLessonSummary({
      _id: "lesson-1",
      title: "Lesson",
      published: true,
      content: "paid text",
      videoUrl: "https://video.invalid/private",
      pdfUrl: "/private.pdf",
    });
    const serialized = JSON.parse(JSON.stringify(dto));

    expect(serialized).toEqual({
      _id: "lesson-1",
      title: "Lesson",
      published: true,
    });
    expect(serialized).not.toHaveProperty("content");
    expect(serialized).not.toHaveProperty("videoUrl");
    expect(serialized).not.toHaveProperty("pdfUrl");
  });

  it("does not expose internal user or course IDs in public certificates", () => {
    const dto = toPublicCertificate({
      _id: "certificate-1",
      _creationTime: 1,
      userId: "user-1",
      courseId: "course-1",
      userName: "Student",
      courseName: "Course",
      completionPercent: 100,
      issuedAt: 2,
      certificateNumber: "CERT-1",
    });

    expect(dto).toEqual({
      _id: "certificate-1",
      userName: "Student",
      courseName: "Course",
      completionPercent: 100,
      issuedAt: 2,
      certificateNumber: "CERT-1",
    });
    expect(dto).not.toHaveProperty("userId");
    expect(dto).not.toHaveProperty("courseId");
  });
});
