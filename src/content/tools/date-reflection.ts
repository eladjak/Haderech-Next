export const DATE_REFLECTION_SOURCE = {
  sourceKey: "legacy.reflective-learning-loop",
  sourceRevision: "2026-08-14.1",
  legacyCluster: "reflective_learning_loop",
  primaryInspiration: {
    recordId: "L0557",
    sha256: "d05079e64a3ddb2bb5f83d237b6947a3089bfd1b4b74a6c9b732c6a4c928ba92",
  },
  retainedIdea:
    "מחזור למידה קצר שמפריד בין מה שבחרתי לנסות, מה שקרה בפועל ומה שאבחר לשמור או לשנות.",
  rewritePolicy:
    "כל הניסוחים, השאלות והמשובים נכתבו מחדש. אין יעדי תוצאה, ניקוד, מכסות, אבחון או ניתוח של אדם אחר.",
  answerHandling: "memory-only-until-refresh",
} as const;

export const DATE_REFLECTION_STEPS = [
  {
    id: "choose",
    shortLabel: "בחירה",
    title: "מה חשוב לי להבין הפעם?",
    description: "בחירת מוקד אחד עוזרת להתבונן בלי להפוך את המפגש למבחן.",
  },
  {
    id: "try",
    shortLabel: "התבוננות",
    title: "מה ניסיתי ומה קרה?",
    description: "מתעדים את הבחירה שלי, עובדות פשוטות והחוויה שלי — בלי לפרש אדם אחר.",
  },
  {
    id: "check",
    shortLabel: "בדיקה",
    title: "מה אשמור ומה אשנה?",
    description: "מסיימים בצעד קטן שמכבד את הקצב, הגבולות וחופש הבחירה של שני הצדדים.",
  },
] as const;

export const REFLECTION_FOCUS_OPTIONS = [
  {
    id: "presence",
    label: "הנוכחות שלי",
    description: "מה עזר לי להיות בשיחה, ומה הרחיק אותי ממנה?",
  },
  {
    id: "comfort",
    label: "נוחות וקצב",
    description: "באילו רגעים הרגשתי נינוחות, עומס או צורך להאט?",
  },
  {
    id: "mutuality",
    label: "הדדיות ובחירה",
    description: "האם היה מקום לשאלות, להעדפות, ל׳לא׳ ולשינוי דעת?",
  },
  {
    id: "next-time",
    label: "הפעם הבאה",
    description: "איזה דבר אחד כדאי לשמור, לשנות או לברר?",
  },
] as const;

export const REFLECTION_FEELING_OPTIONS = [
  { id: "comfortable", label: "נינוחות" },
  { id: "curious", label: "סקרנות" },
  { id: "connected", label: "חיבור" },
  { id: "uncertain", label: "חוסר בהירות" },
  { id: "tense", label: "מתח" },
  { id: "tired", label: "עייפות" },
  { id: "guarded", label: "סגירות" },
  { id: "energized", label: "אנרגיה" },
] as const;

export const REFLECTION_NEED_OPTIONS = [
  { id: "clarity", label: "בהירות" },
  { id: "time", label: "עוד זמן" },
  { id: "space", label: "מרחב" },
  { id: "slower", label: "קצב איטי יותר" },
  { id: "directness", label: "ישירות" },
  { id: "warmth", label: "חום" },
  { id: "boundary", label: "גבול ברור" },
  { id: "rest", label: "מנוחה" },
] as const;

export const REFLECTION_CHOICE_OPTIONS = [
  {
    id: "free",
    label: "היה לי מקום לבחור",
    description: "יכולתי להאט, לשנות נושא או לומר שלא מתאים.",
  },
  {
    id: "unclear",
    label: "חלקית או לא ברור",
    description: "היו רגעים שבהם לא היה לי ברור כמה מקום יש לבחירה.",
  },
  {
    id: "pressure",
    label: "הרגשתי לחץ או חציית גבול",
    description: "משהו לא הרגיש בטוח, חופשי או מכבד.",
  },
] as const;

export const REFLECTION_DIRECTION_OPTIONS = [
  {
    id: "keep",
    label: "לשמור",
    description: "להמשיך, בקצב שנעים לי, משהו שכבר עזר.",
  },
  {
    id: "adjust",
    label: "לשנות דבר אחד",
    description: "לנסות שינוי קטן בלי להצמיד לו יעד תוצאה.",
  },
  {
    id: "clarify",
    label: "לברר",
    description: "לשאול ישירות ולהשאיר מקום ל׳כן׳, ל׳לא׳ או ל׳עוד לא׳.",
  },
  {
    id: "pause",
    label: "לעצור בינתיים",
    description: "לקחת זמן בלי לקבוע המשך כרגע.",
  },
  {
    id: "end",
    label: "לא להמשיך",
    description: "לבחור בסיום; אין צורך לנמק מעבר למה שנוח.",
  },
  {
    id: "support",
    label: "לשתף ולהיעזר",
    description: "לשתף אדם אמין במה שקרה ולבחור את הצעד הבא עם תמיכה.",
  },
] as const;

export type ReflectionFocusId = (typeof REFLECTION_FOCUS_OPTIONS)[number]["id"];
export type ReflectionFeelingId = (typeof REFLECTION_FEELING_OPTIONS)[number]["id"];
export type ReflectionNeedId = (typeof REFLECTION_NEED_OPTIONS)[number]["id"];
export type ReflectionChoiceId = (typeof REFLECTION_CHOICE_OPTIONS)[number]["id"];
export type ReflectionDirectionId = (typeof REFLECTION_DIRECTION_OPTIONS)[number]["id"];

export type DateReflectionDraft = {
  focus: ReflectionFocusId | null;
  intention: string;
  observation: string;
  feelings: ReflectionFeelingId[];
  needs: ReflectionNeedId[];
  choice: ReflectionChoiceId | null;
  direction: ReflectionDirectionId | null;
  nextStep: string;
};

export const EMPTY_DATE_REFLECTION: DateReflectionDraft = {
  focus: null,
  intention: "",
  observation: "",
  feelings: [],
  needs: [],
  choice: null,
  direction: null,
  nextStep: "",
};

const findLabel = <T extends { id: string; label: string }>(
  options: readonly T[],
  id: string | null,
) => options.find((option) => option.id === id)?.label;

const cleanLine = (value: string) => value.trim().replace(/\s+/gu, " ");

export function buildDateReflectionSummary(draft: DateReflectionDraft): string {
  const lines = [
    "סיכום פרטי — רפלקציה אחרי מפגש",
    "זהו תיעוד של הבחירות והחוויה שלי, לא ניתוח של האדם האחר.",
  ];

  const focus = findLabel(REFLECTION_FOCUS_OPTIONS, draft.focus);
  const choice = findLabel(REFLECTION_CHOICE_OPTIONS, draft.choice);
  const direction = findLabel(REFLECTION_DIRECTION_OPTIONS, draft.direction);
  const feelings = draft.feelings
    .map((id) => findLabel(REFLECTION_FEELING_OPTIONS, id))
    .filter(Boolean)
    .join(", ");
  const needs = draft.needs
    .map((id) => findLabel(REFLECTION_NEED_OPTIONS, id))
    .filter(Boolean)
    .join(", ");

  if (focus) lines.push(`המוקד שבחרתי: ${focus}`);
  if (cleanLine(draft.intention)) {
    lines.push(`מה בחרתי לנסות: ${cleanLine(draft.intention)}`);
  }
  if (cleanLine(draft.observation)) {
    lines.push(`מה קרה בפועל: ${cleanLine(draft.observation)}`);
  }
  if (feelings) lines.push(`מה הרגשתי: ${feelings}`);
  if (needs) lines.push(`מה היה חסר או חשוב לי: ${needs}`);
  if (choice) lines.push(`בדיקת בחירה וגבולות: ${choice}`);
  if (direction) lines.push(`הכיוון שבחרתי: ${direction}`);
  if (cleanLine(draft.nextStep)) {
    lines.push(`הצעד הקטן שלי: ${cleanLine(draft.nextStep)}`);
  }

  lines.push("מותר לי לשנות את הבחירה כשיגיע מידע חדש.");
  return lines.join("\n");
}
