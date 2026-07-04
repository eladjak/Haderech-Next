// Simulator heuristic scorer — free-degradation "brain" for the
// free-chat simulator (Phase 19 extraction of the Phase-18 inline logic).
//
// When no live-AI provider is configured, `endSession` still needs to
// close the practice loop with a meaningful score + Hebrew feedback.
// This deterministic scorer rewards engagement, curiosity (questions),
// and depth (message length) — the three things the coach analysis also
// looks for — so a student always gets useful feedback with zero credentials.
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
  const avgLen =
    userMessages.reduce((sum, m) => sum + m.content.length, 0) /
    Math.max(1, userCount);

  let score = 45;
  score += Math.min(20, userCount * 4); // engagement
  score += Math.min(20, askedQuestions * 7); // curiosity
  score += avgLen > 40 ? 12 : avgLen > 20 ? 6 : 0; // depth
  score = Math.min(92, Math.max(30, score));

  const strengths: string[] = [];
  if (userCount >= 4) strengths.push("ניהלת שיחה מתמשכת וזורמת");
  if (askedQuestions >= 2) strengths.push("שאלת שאלות והראית עניין אמיתי");
  if (avgLen > 40) strengths.push("פתחת והעמקת במקום תשובות קצרות");
  if (strengths.length === 0)
    strengths.push("התחלת את התרגול — זה הצעד הכי חשוב");

  const improvements: string[] = [];
  if (askedQuestions < 2)
    improvements.push("שאל/י יותר שאלות פתוחות כדי להוביל את השיחה");
  if (avgLen <= 20)
    improvements.push("הרחב/י קצת — תשובה קצרה מדי מקשה על חיבור");
  if (userCount < 4)
    improvements.push("נהל/י שיחה ארוכה יותר כדי לבנות כימיה");
  if (improvements.length === 0)
    improvements.push("המשך/י לתרגל בתרחישים קשים יותר");

  const feedback = `סיימת את התרגול עם ${userCount} הודעות. ${
    score >= 75
      ? "ניהלת שיחה טובה — אתה בכיוון הנכון!"
      : score >= 55
        ? "בסיס טוב. עוד תרגול ותשתפר/י משמעותית."
        : "התחלה טובה. בוא/י נתרגל עוד כדי לבנות ביטחון."
  }`;

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
  initiative: number; // יוזמה (שלב 3)
  emotion: number; // הבעת רגש (שלב 2)
  courage: number; // אומץ וגבולות (שלב 1)
  depth: number; // עומק ופגיעות (שלב 4)
  leading: number; // הובלה (שלב 5)
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

const clamp = (n: number) => Math.max(10, Math.min(95, Math.round(n)));

/** Build the 5-axis skill radar from the user's turns alone. */
export function buildSkillRadar(
  userMessages: Array<{ content: string }>
): SkillRadar {
  const n = Math.max(1, userMessages.length);
  const qs = userMessages.filter((m) => Q_RE.test(m.content)).length;
  const feels = userMessages.filter((m) => FEEL_RE.test(m.content)).length;
  const empathy = userMessages.filter((m) => EMPATHY_RE.test(m.content)).length;
  const avgLen =
    userMessages.reduce((s, m) => s + m.content.length, 0) / n;
  const longShare =
    userMessages.filter((m) => m.content.length > 60).length / n;

  return {
    initiative: clamp(35 + qs * 12 + (n >= 4 ? 10 : 0)),
    emotion: clamp(30 + feels * 18 + empathy * 8),
    courage: clamp(30 + feels * 10 + (avgLen > 40 ? 15 : 0)),
    depth: clamp(25 + longShare * 45 + feels * 10),
    leading: clamp(30 + qs * 8 + (n >= 5 ? 15 : 0)),
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
      analysis: "תשובה קצרה מאוד — בצד השני זה מרגיש כמו חוסר עניין או מאמץ.",
      better:
        "הרחב במשפט אחד וסיים בשאלה פתוחה — 'כן, ממש! ואצלך, איך זה היה?'",
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
      analysis: "שיתפת יפה — אבל לא החזרת את הכדור. שיחה טובה היא פינג-פונג.",
      better: "אחרי שאתה משתף, סיים בשאלה שמזמינה אותה/אותו פנימה.",
    });
  }
  const feeling = userMessages.find((m) => FEEL_RE.test(m.content));
  if (feeling && moments.length < max) {
    moments.push({
      quote:
        feeling.content.length > 70
          ? feeling.content.slice(0, 67) + "..."
          : feeling.content,
      analysis: "רגע חזק — הבעת רגש אמיתי. זה בדיוק מה שבונה חיבור.",
      better: "שים לב מה זה עשה לשיחה, וחזור על זה גם בדייטים אמיתיים.",
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
        "בסימולציה הבאה: פתח/י לפחות 3 נושאים חדשים בעצמך, בלי לחכות שישאלו אותך.",
    },
    {
      key: "emotion",
      drill:
        "בסימולציה הבאה: שלב/י לפחות פעם אחת 'אני מרגיש/ה ש...' — רגש אמיתי, לא דיווח.",
    },
    {
      key: "courage",
      drill:
        "בסימולציה הבאה: אמור/אמרי דבר אחד שקצת מפחיד להגיד — דעה אמיתית או גבול.",
    },
    {
      key: "depth",
      drill:
        "בסימולציה הבאה: קח/י שאלה אחת של הפרסונה והעמק/העמיקי בה באמת במקום לענות ולהחליף נושא.",
    },
    {
      key: "leading",
      drill:
        "בסימולציה הבאה: הוביל/י — הצע/הציעי כיוון, תכנית או רעיון, ובדוק/בדקי איך זה מתקבל.",
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
