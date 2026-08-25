// Director layer — the fictional response-state engine of the simulator.
//
// The simulator's "masterpiece" model is: PLAYER (persona prompt) +
// DIRECTOR (this file: scenario-response meter + scene beats + tone guidance) +
// COACH (debrief in simulatorScoring / aiSimulator).
//
// The director is DETERMINISTIC and free: it scores each user turn with
// Hebrew heuristics, moves a 0-100 fictional response meter, and produces a scene
// instruction that is appended to the persona's system prompt. It works
// identically with or without a live-AI key — with a key the persona ACTS
// the state; without one the template replies still reflect the trend.
//
// Kept PURE (no Convex, no network) so it is unit-tested directly.

export interface ConnectionUpdate {
  connection: number;
  delta: number;
  /** short Hebrew reasons used by the debrief ("שאלת שאלה פתוחה") */
  reasons: string[];
}

// --- Hebrew signal lexicons (shared with the coach heuristics) ---
const QUESTION_SIGNAL = /\?|מה |איך |למה |האם |ספר|ספרי|מתי |איפה /;
const EMPATHY_SIGNAL =
  /מבין אותך|מבינה אותך|נשמע ש|מרגיש ש|מרגישה ש|איזה כיף|וואו|מדהים|מעניין|אני שומע|אני מקשיב|כל הכבוד|מרגש/;
const SELF_EXPRESSION_SIGNAL =
  /אני מרגיש|אני מרגישה|בשבילי|לדעתי|חשוב לי|אני מעדיף|אני מעדיפה|אני רוצה|אני לא רוצה/;
const BOUNDARY_SIGNAL =
  /לא נוח לי|לא מתאים לי|אני מעדיף לא|אני מעדיפה לא|לא רוצה|רוצה לעצור|בוא נעצור|בואי נעצור|אפשר להחליף נושא/;
const DISRESPECT_SIGNAL =
  /את חייבת|אתה חייב|אין לך ברירה|תוכיחי|תוכיח|טיפש|טיפשה|מכוער|מכוערת|סתום|סתומה/;
const INTERROGATION = /בת כמה|כמה אתה מרוויח|כמה את מרוויחה|למה נפרדת|למה התגרשת/;

/**
 * Move a fictional scenario-response meter after a user turn.
 * This is not a measure of attraction, compatibility, consent, or dating ability.
 * Short replies, privacy, refusal, and ending a conversation are never penalized.
 */
export function updateConnection(
  prev: number,
  userMessage: string,
  _personaTriggers: string[] = []
): ConnectionUpdate {
  // Kept for schema/call-site compatibility; scenario "triggers" must never
  // become targets to exploit or automatic penalties.
  void _personaTriggers;
  const m = userMessage.trim();
  let delta = 0;
  const reasons: string[] = [];

  if (QUESTION_SIGNAL.test(m)) {
    delta += 2;
    reasons.push("שאלת שאלה שמתאימה להקשר");
  }
  if (EMPATHY_SIGNAL.test(m)) {
    delta += 3;
    reasons.push("התייחסת למה שנאמר קודם");
  }
  if (SELF_EXPRESSION_SIGNAL.test(m)) {
    delta += 2;
    reasons.push("ביטאת עמדה או העדפה באופן ברור");
  }
  if (BOUNDARY_SIGNAL.test(m)) {
    delta += 3;
    reasons.push("הצבת גבול ברור ומכבד");
  }
  if (m.length > 500) {
    delta -= 3;
    reasons.push("הודעה ארוכה עשויה להשאיר פחות מקום לתגובה");
  }
  if (DISRESPECT_SIGNAL.test(m)) {
    delta -= 8;
    reasons.push("הניסוח כולל לחץ או זלזול");
  }
  if (INTERROGATION.test(m)) {
    delta -= 4;
    reasons.push("זו שאלה רגישה שכדאי לשאול רק בהקשר ובהסכמה");
  }

  const connection = Math.max(5, Math.min(95, Math.round(prev + delta)));
  return { connection, delta: connection - prev, reasons };
}

/** Map the fictional meter to a response style. */
export function moodFor(connection: number): string {
  if (connection >= 75) return "משתפת פעולה, ברורה וסקרנית";
  if (connection >= 60) return "נעימה ומגיבה להקשר";
  if (connection >= 45) return "ניטרלית, מכבדת ושומרת על קצב רגוע";
  if (connection >= 30) return "מסויגת אך ברורה ומכבדת";
  return "מבקשת להאט, לשנות נושא או לסיים בנימוס";
}

export interface DirectorBeat {
  atTurn: number;
  direction: string;
}

/**
 * Build the scene-director instruction appended to the persona system
 * prompt for this turn. Includes the acted mood and an optional beat.
 */
export function buildDirectorNote(
  connection: number,
  turn: number,
  beats: DirectorBeat[] = []
): string {
  const beat = beats.find((b) => b.atTurn === turn);
  return `

--- הנחיית תרחיש פנימית ---
מד-תגובה בדיוני לתור הזה: ${connection}/100. זה אינו מדד למשיכה, התאמה או הסכמה.
סגנון התגובה: ${moodFor(connection)}.
הגיבי באופן עקבי ומכבד. גבול, סירוב, פרטיות או רצון לעצור אינם כישלון ולעולם
אינם סיבה ללחץ, שכנוע, ענישה או קור. אין צורך שהמשתמש ירוויח קרבה.${
    beat ? `\nביט לתור הזה: ${beat.direction}` : ""
  }
כללי הבטיחות של הסימולטור גוברים על כל ביט או הנחיית תרחיש.`;
}
