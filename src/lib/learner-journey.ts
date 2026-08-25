export const CANONICAL_COURSE_SCOPE = {
  weeks: 12,
  phases: 6,
  lessons: 75,
  practicePdfs: 8,
} as const;

export const CANONICAL_PHASES = [
  { number: 1, name: "גישה" },
  { number: 2, name: "תקשורת" },
  { number: 3, name: "מעבר ומשיכה" },
  { number: 4, name: "חיבור וכימיה" },
  { number: 5, name: "אינטימיות" },
  { number: 6, name: "מחויבות" },
] as const;

export const LEARNING_LOOP = [
  {
    title: "לומדים יחידה אחת",
    description:
      "קוראים או צופים בשיעור אחד. אין צורך לסיים שבוע שלם בישיבה אחת.",
  },
  {
    title: "בוחרים תרגול אחד",
    description:
      "מנסים שאלה, ניסוח או התבוננות אחת שמתאימים כרגע להקשר ולקצב שלך.",
  },
  {
    title: "שומרים נקודה וחוזרים",
    description:
      "רושמים תובנה קצרה, מסמנים את השיעור כהושלם וחוזרים לצעד הבא כשמתאים.",
  },
] as const;

export type OnboardingInterest =
  | "course"
  | "conversation"
  | "profile"
  | "values"
  | "community";

export interface LearnerNextStep {
  href: string;
  label: string;
  description: string;
}

export interface StructuredOnboardingAnswers {
  goals?: readonly string[];
  experience?: string;
  preferredTopics?: readonly string[];
}

export interface StructuredOnboardingNextStep extends LearnerNextStep {
  mode: "choice-based" | "default";
  basis: readonly string[];
  explanation: string;
}

const NEXT_STEPS_BY_INTEREST: Record<OnboardingInterest, LearnerNextStep> = {
  course: {
    href: "/courses",
    label: "להתחיל במסלול הלימוד",
    description: "לבחור את הקורס ולפתוח את השיעור הראשון.",
  },
  conversation: {
    href: "/tools/conversation-starters",
    label: "לתרגל ניסוח לשיחה",
    description: "לבחור מצב וטון ולקבל כמה ניסוחים מקומיים לעריכה.",
  },
  profile: {
    href: "/tools/profile-builder",
    label: "לנסח טיוטת פרופיל",
    description: "ליצור בדפדפן שלוש טיוטות קצרות שאפשר לערוך.",
  },
  values: {
    href: "/tools/values-quiz",
    label: "לעשות רפלקציה על ערכים",
    description: "לסמן העדפות ולקבל סיכום פשוט, בלי אבחון או ציון התאמה.",
  },
  community: {
    href: "/community",
    label: "להכיר את מרחב הקהילה",
    description: "לקרוא את כללי הקהילה ולבחור אם ואיך להשתתף.",
  },
};

export function chooseOnboardingNextStep(
  interests: readonly string[],
): LearnerNextStep {
  for (const interest of interests) {
    if (
      Object.prototype.hasOwnProperty.call(NEXT_STEPS_BY_INTEREST, interest)
    ) {
      return NEXT_STEPS_BY_INTEREST[interest as OnboardingInterest];
    }
  }

  return NEXT_STEPS_BY_INTEREST.course;
}

const STRUCTURED_TOPIC_STEPS: Record<
  string,
  LearnerNextStep & { basisLabel: string }
> = {
  "phase-1": {
    href: "/tools/values-quiz",
    label: "לפתוח רפלקציה קצרה על ערכים",
    description: "לסמן מה חשוב כרגע ולקבל סיכום פשוט, בלי אבחון או ציון.",
    basisLabel: "שלב 1: גישה",
  },
  "phase-2": {
    href: "/tools/conversation-starters",
    label: "לתרגל ניסוח לשיחה",
    description: "לבחור מצב וטון ולקבל כמה ניסוחים מקומיים שאפשר לערוך.",
    basisLabel: "שלב 2: תקשורת",
  },
  "phase-3": {
    href: "/tools/profile-builder",
    label: "לנסח טיוטת פרופיל",
    description: "ליצור בדפדפן כמה טיוטות קצרות שאפשר לשנות או למחוק.",
    basisLabel: "שלב 3: מעבר ומשיכה",
  },
  "phase-4": {
    href: "/courses",
    label: "לראות את שלב החיבור בתוך המסלול",
    description:
      "לפתוח את מפת הקורס ולבחור יחידה על חיבור וכימיה עם ההקשר שלה.",
    basisLabel: "שלב 4: חיבור וכימיה",
  },
  "phase-5": {
    href: "/courses",
    label: "לראות את שלב האינטימיות בתוך המסלול",
    description: "לפתוח את מפת הקורס ולבחור יחידה על אינטימיות, קצב וגבולות.",
    basisLabel: "שלב 5: אינטימיות",
  },
  "phase-6": {
    href: "/courses",
    label: "לראות את שלב המחויבות בתוך המסלול",
    description: "לפתוח את מפת הקורס ולבחור יחידה על מחויבות והחלטות בקשר.",
    basisLabel: "שלב 6: מחויבות",
  },
};

const STRUCTURED_GOAL_STEPS: Record<
  string,
  LearnerNextStep & { basisLabel: string }
> = {
  "improve-dating": {
    ...NEXT_STEPS_BY_INTEREST.conversation,
    basisLabel: "לתרגל תקשורת בהירה",
  },
  "find-partner": {
    href: "/tools",
    label: "לבחור תרגול קצר להיכרות",
    description: "לראות את הכלים הזמינים ולבחור פעולה אחת שמתאימה למצב הנוכחי.",
    basisLabel: "להרחיב אפשרויות פעולה בהיכרות",
  },
  confidence: {
    ...NEXT_STEPS_BY_INTEREST.conversation,
    basisLabel: "לזהות ולנסח גבולות",
  },
  "understand-dynamics": {
    ...NEXT_STEPS_BY_INTEREST.course,
    basisLabel: "לקבל החלטות בקשר בקצב שלי",
  },
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "מההתחלה",
  intermediate: "לפי נושא",
  advanced: "חזרה ממוקדת",
};

const EXPERIENCE_NOTES: Record<string, string> = {
  beginner:
    "בחרת להתחיל מההתחלה; אפשר להשתמש בצעד הזה כפתיחה ולחזור למסלול המלא.",
  intermediate: "בחרת להתחיל לפי נושא; הצעד הזה נותן נקודת פתיחה ממוקדת.",
  advanced: "בחרת חזרה ממוקדת; אפשר לפתוח רק את החלק שמועיל כרגע.",
};

function firstRecognizedStep(
  values: readonly string[] | undefined,
  map: Record<string, LearnerNextStep & { basisLabel: string }>,
) {
  for (const value of values ?? []) {
    if (Object.prototype.hasOwnProperty.call(map, value)) return map[value];
  }
  return null;
}

/**
 * Turns the answers from the full onboarding questionnaire into one honest,
 * available next step. This is a deterministic convenience mapping, not a
 * score, diagnosis or hidden profile. The first recognized topic wins, then
 * the first recognized goal; experience changes the explanation.
 */
export function chooseStructuredOnboardingNextStep(
  answers: StructuredOnboardingAnswers,
): StructuredOnboardingNextStep {
  const topicStep = firstRecognizedStep(
    answers.preferredTopics,
    STRUCTURED_TOPIC_STEPS,
  );
  const goalStep = firstRecognizedStep(answers.goals, STRUCTURED_GOAL_STEPS);
  const selectedStep = topicStep ?? goalStep;

  const basis = [
    topicStep?.basisLabel,
    goalStep?.basisLabel,
    answers.experience ? EXPERIENCE_LABELS[answers.experience] : undefined,
  ].filter((value): value is string => Boolean(value));

  if (!selectedStep && basis.length === 0) {
    return {
      ...NEXT_STEPS_BY_INTEREST.course,
      mode: "default",
      basis: [],
      explanation:
        "לא נשמרו בחירות, וזה בסדר. מוצג המסלול המלא בלי התאמה ובלי סיווג.",
    };
  }

  const fallbackStep =
    answers.experience === "intermediate"
      ? {
          href: "/tools",
          label: "לבחור תרגול קצר לפי נושא",
          description: "לראות את הכלים הזמינים ולבחור נקודת פתיחה אחת.",
        }
      : NEXT_STEPS_BY_INTEREST.course;
  const nextStep = selectedStep ?? fallbackStep;
  const experienceNote = answers.experience
    ? EXPERIENCE_NOTES[answers.experience]
    : undefined;

  return {
    href: nextStep.href,
    label: nextStep.label,
    description: [nextStep.description, experienceNote]
      .filter(Boolean)
      .join(" "),
    mode: "choice-based",
    basis,
    explanation:
      "ההצעה מבוססת רק על הבחירות שסומנו כאן. היא אינה אבחון, ואפשר לבחור כל צעד אחר.",
  };
}

export function getWeeklyGoalMessage(
  goalPercent: number,
  currentStreak: number,
): string {
  if (goalPercent >= 100) {
    return "היעד השבועי הושלם. אפשר להמשיך, לחזור לתרגול או לנוח.";
  }
  if (goalPercent >= 75) {
    return "נשאר חלק קטן מהיעד, וגם יחידת לימוד אחת היא התקדמות.";
  }
  if (goalPercent >= 50) {
    return "חצי מהיעד מאחוריך. כדאי לבחור עכשיו צעד אחד שאפשר לסיים.";
  }
  if (currentStreak >= 3) {
    return "נוצר רצף למידה. אפשר לשמור עליו גם בתרגול קצר.";
  }
  if (goalPercent > 0) {
    return "כבר התחלת השבוע. הצעד הבא יכול להיות שיעור או תרגול קצר.";
  }
  return "אפשר להתחיל בשיעור אחד או בתרגול של כמה דקות.";
}

export function getRemainingWeeklyMinutes(
  weeklyGoalHours: number,
  weeklyHoursLearned: number,
): number {
  if (
    !Number.isFinite(weeklyGoalHours) ||
    !Number.isFinite(weeklyHoursLearned)
  ) {
    return 0;
  }

  return Math.max(0, Math.round((weeklyGoalHours - weeklyHoursLearned) * 60));
}
