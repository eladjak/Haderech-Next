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
    description: "קוראים או צופים בשיעור אחד. אין צורך לסיים שבוע שלם בישיבה אחת.",
  },
  {
    title: "בוחרים תרגול אחד",
    description: "מנסים שאלה, ניסוח או התבוננות אחת שמתאימים כרגע להקשר ולקצב שלך.",
  },
  {
    title: "שומרים נקודה וחוזרים",
    description: "רושמים תובנה קצרה, מסמנים את השיעור כהושלם וחוזרים לצעד הבא כשמתאים.",
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
  interests: readonly string[]
): LearnerNextStep {
  for (const interest of interests) {
    if (interest in NEXT_STEPS_BY_INTEREST) {
      return NEXT_STEPS_BY_INTEREST[interest as OnboardingInterest];
    }
  }

  return NEXT_STEPS_BY_INTEREST.course;
}

export function getWeeklyGoalMessage(
  goalPercent: number,
  currentStreak: number
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
  weeklyHoursLearned: number
): number {
  if (!Number.isFinite(weeklyGoalHours) || !Number.isFinite(weeklyHoursLearned)) {
    return 0;
  }

  return Math.max(0, Math.round((weeklyGoalHours - weeklyHoursLearned) * 60));
}
