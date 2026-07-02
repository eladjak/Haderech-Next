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
