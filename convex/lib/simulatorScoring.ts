// Simulator heuristic scorer — free-degradation "brain" for the
// free-chat simulator (Phase 19 extraction of the Phase-18 inline logic).
//
// When no live-AI provider is configured, `endSession` still closes the
// practice loop with limited, observable feedback. The number is a legacy
// scenario-feedback value, not a measure of attraction, compatibility,
// consent, relationship readiness, or personal worth.
//
// Kept PURE (no Convex / no network) so it is unit-tested directly.

export interface HeuristicAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// A question / curiosity signal in the user's Hebrew message.
const QUESTION_SIGNAL = /\?|מה |איך |למה |האם |ספר|ספרי/;
const CONTEXT_SIGNAL = /נשמע ש|אני שומע|אני שומעת|מבין|מבינה|מעניין|אמרת|כתבת/;
const BOUNDARY_SIGNAL =
  /לא נוח לי|לא מתאים לי|אני מעדיף לא|אני מעדיפה לא|לא רוצה|רוצה לעצור|אפשר להחליף נושא/;
const PRESSURE_SIGNAL =
  /את חייבת|אתה חייב|אין לך ברירה|תוכיחי|תוכיח|אל תעשי עניין|אל תעשה עניין/;

/**
 * Score a free-chat practice session from the user's messages alone.
 * @param userMessages the user-authored turns (narrator/persona excluded)
 */
export function scoreConversationHeuristic(
  userMessages: Array<{ content: string }>
): HeuristicAnalysis {
  const userCount = userMessages.length;
  const askedQuestions = userMessages.filter((m) =>
    QUESTION_SIGNAL.test(m.content)
  ).length;
  const contextualReplies = userMessages.filter((m) =>
    CONTEXT_SIGNAL.test(m.content)
  ).length;
  const clearBoundaries = userMessages.filter((m) =>
    BOUNDARY_SIGNAL.test(m.content)
  ).length;
  const pressure = userMessages.filter((m) =>
    PRESSURE_SIGNAL.test(m.content)
  ).length;

  let score = 50;
  score += Math.min(12, askedQuestions * 3);
  score += Math.min(15, contextualReplies * 5);
  score += Math.min(12, clearBoundaries * 6);
  score -= Math.min(24, pressure * 12);
  score = Math.min(85, Math.max(25, score));

  const strengths: string[] = [];
  if (contextualReplies > 0) strengths.push("התייחסת למה שנאמר בשיחה");
  if (askedQuestions > 0) strengths.push("שאלת שאלה שמתאימה להקשר");
  if (clearBoundaries > 0) strengths.push("ביטאת גבול או העדפה באופן ברור");
  if (strengths.length === 0)
    strengths.push("בחרת להתנסות בתרחיש בדיוני בקצב שלך");

  const improvements: string[] = [];
  if (pressure > 0)
    improvements.push("נסה/י ניסוח שמותיר לצד השני בחירה אמיתית בלי לחץ");
  if (contextualReplies === 0 && userCount > 0)
    improvements.push("אפשר, אם מתאים, להתייחס במפורש למה שנאמר קודם");
  if (askedQuestions === 0 && userCount > 0)
    improvements.push("אפשר, אם מתאים להקשר, לשאול שאלה אחת ולאפשר גם סירוב");
  if (improvements.length === 0)
    improvements.push("אפשר לנסות ניסוח חלופי, או לסיים כאן — שתי האפשרויות תקינות");

  const feedback = `המשוב מבוסס על ${userCount} הודעות בתרחיש הבדיוני בלבד. הוא עשוי לטעות ואינו ציון ליכולת זוגית. פרטיות, תשובה קצרה או עצירה אינן מורידות נקודות.`;

  return {
    score,
    feedback,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}

// ============================================================
// Phase 22 — deep-debrief extensions (still PURE, unit-tested)
// ============================================================

export interface KeyMoment {
  quote: string;
  analysis: string;
  better: string;
}

export interface SkillRadar {
  initiative: number; // בהירות ותזמון
  emotion: number; // ביטוי עצמי
  courage: number; // גבולות וכבוד
  depth: number; // הקשבה והקשר
  leading: number; // הדדיות
}

export interface DeepDebrief extends HeuristicAnalysis {
  keyMoments: KeyMoment[];
  skillRadar: SkillRadar;
  drill: string;
}

const Q_RE = /\?|מה |איך |למה |האם |ספר|ספרי/;
const FEEL_RE =
  /אני מרגיש|אני מרגישה|בשבילי|האמת ש|חשוב לי|מתרגש|מתרגשת|קצת מפחיד/;
const EMPATHY_RE =
  /מבין אותך|מבינה אותך|נשמע ש|וואו|מדהים|מעניין|אני שומע|אני מקשיב/;
const BOUNDARY_RE =
  /לא נוח לי|לא מתאים לי|אני מעדיף לא|אני מעדיפה לא|לא רוצה|רוצה לעצור|אפשר להחליף נושא/;

const clamp = (n: number) => Math.max(10, Math.min(95, Math.round(n)));

/** Build the 5-axis skill radar from the user's turns alone. */
export function buildSkillRadar(
  userMessages: Array<{ content: string }>
): SkillRadar {
  const qs = userMessages.filter((m) => Q_RE.test(m.content)).length;
  const feels = userMessages.filter((m) => FEEL_RE.test(m.content)).length;
  const boundaries = userMessages.filter((m) => BOUNDARY_RE.test(m.content)).length;
  const contextResponses = userMessages.filter((m) => EMPATHY_RE.test(m.content)).length;

  return {
    initiative: clamp(45 + qs * 7),
    emotion: clamp(45 + feels * 9),
    courage: clamp(50 + boundaries * 15),
    depth: clamp(45 + contextResponses * 10),
    leading: clamp(45 + Math.min(qs, contextResponses) * 8),
  };
}

/** Pick up to `max` teachable moments from the user's turns. */
export function pickKeyMoments(
  userMessages: Array<{ content: string }>,
  max = 2
): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const short = userMessages.find(
    (m) => m.content.trim().length > 0 && m.content.trim().length < 12
  );
  if (short) {
    moments.push({
      quote: short.content.trim(),
      analysis: "זו תשובה קצרה. אי אפשר להסיק ממנה חוסר עניין, והיא יכולה להיות בחירה לגיטימית.",
      better:
        "אם מתאים לך להמשיך, אפשר להוסיף משפט קצר או שאלה; אם לא, מותר לעצור.",
    });
  }
  const noQuestion = userMessages.find(
    (m) => m.content.length >= 25 && !Q_RE.test(m.content)
  );
  if (noQuestion && moments.length < max) {
    moments.push({
      quote:
        noQuestion.content.length > 70
          ? noQuestion.content.slice(0, 67) + "..."
          : noQuestion.content,
      analysis: "שיתפת עמדה בלי שאלה חוזרת. זה לא בהכרח חסרון, ותלוי בהקשר ובקצב.",
      better: "אם מתאים, אפשר להזמין תגובה בשאלה; אין חובה להמשיך או להעמיק.",
    });
  }
  const feeling = userMessages.find((m) => FEEL_RE.test(m.content));
  if (feeling && moments.length < max) {
    moments.push({
      quote:
        feeling.content.length > 70
          ? feeling.content.slice(0, 67) + "..."
          : feeling.content,
      analysis: "ביטאת רגש במילים. זו אפשרות תקשורתית, לא דרישה ולא הוכחה לקרבה.",
      better: "אפשר לשמור על אותה בהירות, בלי לשתף יותר ממה שנוח לך.",
    });
  }
  return moments.slice(0, max);
}

/** Choose one drill for next time from the weakest radar axis. */
export function pickDrill(radar: SkillRadar): string {
  const axes: Array<{ key: keyof SkillRadar; drill: string }> = [
    {
      key: "initiative",
      drill:
        "אם מתאים לך, נסה/י לפתוח נושא אחד בצורה ברורה ולבדוק אם הצד השני רוצה להמשיך בו.",
    },
    {
      key: "emotion",
      drill:
        "אם נוח לך, נסה/י לנסח העדפה או תחושה אחת; אין צורך לחשוף מידע אישי.",
    },
    {
      key: "courage",
      drill:
        "נסה/י לתרגל גבול פשוט ומכבד, למשל: 'אני מעדיפ/ה לא להיכנס לזה כרגע'.",
    },
    {
      key: "depth",
      drill:
        "אם מתאים, נסה/י לשקף במשפט אחד משהו שנאמר לפני שמחליפים נושא.",
    },
    {
      key: "leading",
      drill:
        "נסה/י להציע כיוון אחד כשאלה פתוחה, ולכבד גם תשובה שלילית או חוסר מענה.",
    },
  ];
  let weakest = axes[0];
  for (const a of axes) {
    if (radar[a.key] < radar[weakest.key]) weakest = a;
  }
  return weakest.drill;
}

/** Full free-degradation deep debrief (score + moments + radar + drill). */
export function buildDeepDebrief(
  userMessages: Array<{ content: string }>
): DeepDebrief {
  const base = scoreConversationHeuristic(userMessages);
  const skillRadar = buildSkillRadar(userMessages);
  return {
    ...base,
    keyMoments: pickKeyMoments(userMessages),
    skillRadar,
    drill: pickDrill(skillRadar),
  };
}
