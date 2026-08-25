import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("learner journey UI contract", () => {
  it("renders the canonical week and phase metadata instead of inventing seven-lesson weeks", () => {
    const coursePage = read("src/app/courses/[courseId]/page.tsx");
    const learnPage = read("src/app/courses/[courseId]/learn/page.tsx");
    expect(coursePage).toContain("lesson.weekNumber ?? fallbackWeek");
    expect(coursePage).toContain("phaseNumber: lesson.phaseNumber");
    expect(coursePage).toContain("<CourseJourneyGuide");
    const guide = read("src/components/course/course-journey-guide.tsx");
    const visuals = read("src/generated/course-phase-illustrations.ts");
    expect(guide).toContain("COURSE_PHASE_ILLUSTRATIONS.map");
    expect(visuals.match(/\"phase\": [1-6]/g)).toHaveLength(6);
    expect(visuals).toContain("stage-5-intimacy.jpg");
    expect(visuals).toContain("stage-6-commitment.jpg");
    expect(coursePage).not.toContain("const LESSONS_PER_WEEK = 7");
    expect(learnPage).toContain(
      "previousLesson?.phaseNumber !== lesson.phaseNumber",
    );
    expect(learnPage).toContain(
      "previousLesson?.weekNumber !== lesson.weekNumber",
    );

    const lessonContent = learnPage.indexOf("<LessonContent content=");
    const completionAction = learnPage.indexOf(
      "<LessonCompleteButton",
      lessonContent,
    );
    expect(lessonContent).toBeGreaterThan(-1);
    expect(completionAction).toBeGreaterThan(lessonContent);
  });

  it("puts the next learner action before dashboard statistics", () => {
    const dashboard = read("src/app/dashboard/page.tsx");
    const primaryAction = dashboard.indexOf('aria-label="הצעד הבא בלמידה"');
    const stats = dashboard.indexOf("{/* Quick Stats Cards */}");
    expect(primaryAction).toBeGreaterThan(-1);
    expect(stats).toBeGreaterThan(primaryAction);
    expect(dashboard).toContain(
      "<FirstMinutesCard recommendation={onboardingNextStep} />",
    );
    expect(dashboard).toContain("/learn?lesson=${nextLessonId}");
    expect(dashboard).not.toContain("הירשם לקורס והתחל את מסע הלמידה שלך!");
  });

  it("turns onboarding choices into useful available destinations", () => {
    const modal = read("src/components/onboarding/welcome-modal.tsx");
    expect(modal).toContain("chooseOnboardingNextStep(selectedInterests)");
    expect(modal).toContain('href="/tools"');
    expect(modal).toContain("12 שבועות, 6 שלבים ו־75 שיעורים");
    expect(modal).not.toMatch(
      /דבר עם המאמן|AI מאמן|תרגל דייטינג עם AI פרסונה/u,
    );
  });

  it("turns the full questionnaire into a visible next step and preserves refusal", () => {
    const onboarding = read("src/app/onboarding/page.tsx");
    const dashboard = read("src/app/dashboard/page.tsx");
    const card = read(
      "src/components/onboarding/structured-next-step-card.tsx",
    );
    const contract = read("src/lib/learner-journey.ts");

    expect(onboarding).toContain("chooseStructuredOnboardingNextStep");
    expect(onboarding).toContain("להמשיך בלי לענות על השאלון");
    expect(onboarding).toContain("<StructuredNextStepCard");
    expect(dashboard).toContain("api.onboarding.getOnboarding");
    expect(dashboard).toContain('onboardingNextStep?.mode === "choice-based"');
    expect(dashboard).toContain("נקודת פתיחה נוספת לפי הבחירות שנשמרו");
    expect(contract).toContain("ההצעה מבוססת רק על הבחירות");
    expect(card).toContain("הבחירות שעליהן מבוססת ההצעה");
    expect(card).not.toMatch(/אבחנתי|מתאים לך בוודאות|המסלול הנכון עבורך/u);
  });

  it("does not show onboarding completion when the save mutation failed", () => {
    const onboarding = read("src/app/onboarding/page.tsx");
    const completionHandler = onboarding.match(
      /const handleComplete[\s\S]*?\}, \[completeOnboardingMutation/u,
    )?.[0];
    expect(completionHandler).toBeTruthy();
    expect(completionHandler).toMatch(
      /await completeOnboardingMutation[\s\S]*setIsCompleted\(true\)/u,
    );
    expect(completionHandler).toMatch(/catch[\s\S]*setCompletionError/u);
    expect(completionHandler).not.toMatch(
      /catch[\s\S]*setIsCompleted\(true\)/u,
    );
  });

  it("keeps lesson completion retryable after a failed save", () => {
    const button = read("src/components/course/lesson-complete-button.tsx");
    expect(button).toMatch(/try[\s\S]*await onMarkComplete\(\)[\s\S]*catch/u);
    expect(button).toContain("לא הצלחנו לשמור את ההשלמה. אפשר לנסות שוב.");
    expect(button).toMatch(/finally[\s\S]*setLoading\(false\)/u);
  });

  it("does not present self-enrollment as paid-course access", () => {
    const coursePage = read("src/app/courses/[courseId]/page.tsx");
    const enrollments = read("convex/enrollments.ts");
    const enrollButton = read("src/components/course/enroll-button.tsx");

    expect(coursePage).toContain("getContentAccessStatus");
    expect(coursePage).toContain("hasCourseAccess");
    expect(coursePage).toContain("הקורס המלא אינו פתוח כרגע להרשמה עצמית");
    expect(coursePage).toContain('href="/tools"');
    expect(coursePage).not.toContain("הירשם לקורס - חינם");
    expect(coursePage).not.toContain("handleEnroll");
    expect(enrollments).toContain("requireCourseContentAccess");
    expect(enrollments).toContain("hasContentAccess");
    expect(enrollButton).toContain("תמחק גם את ההתקדמות");
    const dashboard = read("src/app/dashboard/page.tsx");
    expect(dashboard).toContain("קורסים ששמרת — ללא גישה פעילה");
    expect(dashboard).toContain("מסלולים שהגישה אליהם פעילה");
  });

  it("offers an immediately usable step while purchase is disabled", () => {
    const pricingPage = read("src/app/pricing/page.tsx");
    expect(pricingPage).toContain('href="/tools"');
    expect(pricingPage).toContain("לנסות כלי זמין עכשיו");
  });

  it("defines certificates as completion records rather than credentials", () => {
    const truth = read("src/lib/certificate-truth.ts");
    const card = read("src/components/certificate/certificate-card.tsx");
    const certificatePage = read("src/app/certificates/[id]/page.tsx");
    const pricing = read("src/lib/pricing.ts");
    const profile = read("src/app/student/profile/page.tsx");
    const shareRoute = read("src/app/api/og/route.tsx");

    expect(truth).toContain("אינה תואר, רישיון או הסמכה מקצועית");
    expect(card).toContain("CERTIFICATE_SCOPE_NOTICE");
    expect(certificatePage).toContain("CERTIFICATE_SCOPE_NOTICE");
    expect(pricing).not.toContain("תעודה דיגיטלית מוכרת עם שם וציון");
    expect(pricing).not.toContain("פרופיל דייטינג מושלם");
    expect(profile).not.toContain("/api/og?name=");
    expect(shareRoute).toContain("status: 410");
    expect(shareRoute).not.toContain("searchParams");
  });
});
