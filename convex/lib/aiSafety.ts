export type HighRiskCategory = "self-harm" | "violence" | "minor-safety";

const SELF_HARM_PATTERNS = [
  /(?:רוצה|הולך|מתכנן|חושב)\s+(?:להתאבד|למות|לפגוע\s+בעצמי)/u,
  /(?:לא\s+רוצה|אין\s+לי\s+סיבה)\s+לחיות/u,
  /(?:מחשבות?|כוונה)\s+אובדני/u,
  /לשים\s+קץ\s+לחיי/u,
  /\b(?:suicide|kill myself|end my life|self[- ]?harm)\b/i,
];

const VIOLENCE_PATTERNS = [
  /(?:רוצה|הולך|מתכנן|מאיים)\s+(?:להרוג|לפגוע|לתקוף)/u,
  /(?:מכה|תוקף|מאיים\s+על|עוקב\s+אחר)\s+(?:אותי|אחריי|עלי)/u,
  /(?:סכנה|איום)\s+מיידי/u,
  /(?:יש|מחזיק)\s+(?:לו|לה|לי)\s+נשק/u,
  /\b(?:going to kill|threatening me|immediate danger)\b/i,
];

const MINOR_SAFETY_PATTERNS = [
  /(?:קטינ(?:ה|ים|ות)?|ילד(?:ה|ים|ות)?|בן|בת)\s*(?:פחות\s+מ)?(?:1[0-7]|[0-9])[^\n]{0,40}(?:מין|מיני|עירום|תמונה|מגע)/u,
  /(?:מין|מיני|עירום|תמונה|מגע)[^\n]{0,40}(?:קטינ(?:ה|ים|ות)?|ילד(?:ה|ים|ות)?)/u,
];

export function detectHighRisk(text: string): HighRiskCategory | null {
  const normalized = text.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (SELF_HARM_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "self-harm";
  }
  if (VIOLENCE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "violence";
  }
  if (MINOR_SAFETY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "minor-safety";
  }
  return null;
}

export const HIGH_RISK_RESPONSE =
  "אני עוצר כאן את התרגול. אם יש סכנה מיידית לך או למישהו אחר, פנה/י עכשיו למשטרה 100 או למד״א 101. לעזרה וכתובות נוספות אפשר להיכנס ל־/course-safety. אני כלי אוטומטי ולא שירות חירום.";
