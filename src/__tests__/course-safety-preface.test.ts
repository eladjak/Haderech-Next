import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COURSE_SAFETY_PREFACE,
  COURSE_SAFETY_PREFACE_SOURCE_HASH,
} from "@/generated/course-safety-preface";

const learnerRoutes = [
  "src/app/courses/[courseId]/page.tsx",
  "src/app/courses/[courseId]/learn/page.tsx",
  "src/app/courses/[courseId]/lessons/[lessonId]/page.tsx",
  "src/app/course/[id]/lesson/[lessonId]/page.tsx",
  "src/app/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx",
];

describe("canonical course safety preface", () => {
  it("contains the required help resources without teleprompter metadata", () => {
    for (const required of [
      "1201",
      "sahar.org.il",
      "118",
      "050-2270118",
      "100",
      "101",
    ]) {
      expect(COURSE_SAFETY_PREFACE).toContain(required);
    }
    expect(COURSE_SAFETY_PREFACE).not.toContain("מטא-מידע לטלפרומפטר");
    expect(COURSE_SAFETY_PREFACE).not.toMatch(/^\[[^\]]+\]$/m);
    expect(COURSE_SAFETY_PREFACE_SOURCE_HASH).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("keeps the safety notice on every current learner entry point", () => {
    for (const relativePath of learnerRoutes) {
      const source = fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
      expect(source, relativePath).toContain("<CourseSafetyNotice />");
    }
  });

  it("links the notice to the complete public safety page", () => {
    const notice = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/course/course-safety-notice.tsx"),
      "utf8",
    );
    expect(notice).toContain('href="/course-safety"');
    expect(notice).toContain("מותר לעצור, לדלג או לבחור חלופה");
  });
});
