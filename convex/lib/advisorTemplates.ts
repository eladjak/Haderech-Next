// ============================================================
// Advisor Templates — Free-Degradation Brain (Phase 18)
// ============================================================
// The Smart Advisor works WITHOUT any paid API key by using a
// deterministic, lesson-context-aware template engine written in
// Elad's voice ("אומנות הקשר"). When ANTHROPIC_API_KEY (or a
// future Gemini key) is present, the runtime upgrades to live AI
// and uses these templates only as the system-prompt scaffold.
//
// This is the "Pollr/ninja pattern": baked advisor by default,
// real AI when a key exists — so the product is always demoable.
// ============================================================

export interface LessonContext {
  lessonTitle: string;
  lessonDescription?: string;
  weekNumber?: number;
  phaseNumber?: number;
  phaseName?: string;
  // progress signals
  completedLessons: number;
  totalLessons: number;
  isLessonComplete: boolean;
}

// The 6 phases of "הדרך" — each carries the core concepts, the
// skill being trained, and Elad-voice guidance. This is the
// shared map the advisor + simulator + course all reference.
export interface PhaseProfile {
  phaseNumber: number;
  name: string;
  weeks: string;
  /** one-line essence of the phase */
  essence: string;
  /** core concepts a learner works on in this phase */
  concepts: string[];
  /** the practiceable skill — drives the simulator link */
  skill: string;
  /** opening line of the advisor, Elad voice */
  opener: string;
  /** concrete "apply it" prompts for this phase */
  applyPrompts: string[];
  /** category to match against simulator scenarios */
  simulatorCategory: string;
}

export const PHASE_PROFILES: Record<number, PhaseProfile> = {
  1: {
    phaseNumber: 1,
    name: "גישה",
    weeks: "שבועות 1-3",
    essence: "התבוננות פנימית — מחשבות, נסיבות, צרכים וגבולות.",
    concepts: [
      "הסיפור הפנימי (איזה סיפור אתה מספר לעצמך על אהבה)",
      "מחשבות שעוזרות מול מחשבות שמקשות, בלי להציג אותן כגורם יחיד למציאות",
      "גבולות בריאים והאחריות שלך על עצמך",
      "נקודת המוצא — איפה אתה באמת עומד היום",
    ],
    skill: "מודעות עצמית והצבת גבולות",
    opener:
      "בוא נתחיל מהיסוד. אילו מחשבות, נסיבות וצרכים משפיעים עליך כרגע, ומה מתוכם בשליטתך בלי להאשים את עצמך?",
    applyPrompts: [
      "אם מועיל לך, כתוב מחשבה אחת שעולה סביב קשר ובדוק אילו עובדות תומכות בה ואילו לא.",
      "זהה מצב אחד מהשבוע שבו לא שמרת על גבול — ומה היית עושה אחרת.",
    ],
    simulatorCategory: "פתיחה",
  },
  2: {
    phaseNumber: 2,
    name: "תקשורת",
    weeks: "שבועות 4-5",
    essence: "להכיר רגשות וצרכים, ולבחור אם וכיצד להביע אותם בבטחה.",
    concepts: [
      "זיהוי רגשות בזמן אמת",
      "להבדיל בין רגש לבין צורך",
      "לבקש צורך בלי להאשים",
      "הקשבה אמיתית מול הקשבה כדי להגיב",
    ],
    skill: "הבעת רגשות וצרכים בתקשורת",
    opener:
      "תקשורת מתחילה בלהכיר את עצמך. מה הרגשת בפעם האחרונה שמשהו 'תקע' אותך בשיחה — ומה הצורך שעמד מאחורי הרגש?",
    applyPrompts: [
      "אם מתאים, נסח בקשה שמתארת רגש וצורך בלי להאשים ובלי לצפות להסכמה.",
      "בשיחה הקרובה, שאל שאלה אחת פתוחה והקשב בלי לתכנן את התגובה.",
    ],
    simulatorCategory: "שיחה",
  },
  3: {
    phaseNumber: 3,
    name: "משיכה ומעבר",
    weeks: "שבועות 6-9",
    essence: "היכרויות ודייטים בצעדים רצוניים שמתאימים להקשר, לגבולות ולבטיחות.",
    concepts: [
      "פחד כמידע: בדיקת עובדות, רצון, הקשר ובטיחות לפני פעולה",
      "פתיחת שיחה והפיכתה לדייט",
      "ניהול דייט ראשון בלי לחץ",
      "להתמודד עם דחייה בלי להישבר",
    ],
    skill: "פתיחת שיחה, דייטינג והתמודדות עם דחייה",
    opener:
      "בשלב הזה אפשר לתרגל היכרות. מה, אם בכלל, מרגיש רצוי ובטוח השבוע — סימולציה, כתיבה או צעד במציאות בהקשר מתאים?",
    applyPrompts: [
      "אם יש הקשר מתאים ורצון, אפשר לפתוח שיחה; אין מכסה ואין חובה לפנות לאדם זר.",
      "אחרי דייט או שיחה, אפשר לרשום בלי מזהים דבר אחד שהיה נעים ודבר אחד שתרצו לשנות.",
    ],
    simulatorCategory: "דייט ראשון",
  },
  4: {
    phaseNumber: 4,
    name: "חיבור וכימיה",
    weeks: "שבועות 8-10",
    essence: "חיבור וכימיה כחוויות סובייקטיביות, לצד התאמה, תקשורת ובטיחות.",
    concepts: [
      "הקשבה וסקרנות בלי טכניקות שנועדו לגרום לאדם אחר להיקשר",
      "לבנות אמון דרך זמן, עקביות וכבוד לגבולות",
      "כימיה — מה זה באמת ואיך לא לבלבל אותה עם דרמה",
      "לבחור מה לשתף ומה להשאיר פרטי",
    ],
    skill: "יצירת אינטימיות וחיבור עמוק",
    opener:
      "חיבור יכול להיבנות בדרכים שונות. מה עוזר לך להרגיש נוכחות, הדדיות ובטיחות — בלי להסיק מזה התאמה אוטומטית?",
    applyPrompts: [
      "אם יש אמון ורצון הדדי, אפשר לשתף דבר קטן ולא מזהה; אפשר גם לשמור על פרטיות או לדלג.",
      "זהה רגע שבו בלבלת דרמה עם כימיה — ומה ההבדל מבחינתך.",
    ],
    simulatorCategory: "חיבור",
  },
  5: {
    phaseNumber: 5,
    name: "אינטימיות",
    weeks: "שבוע 11",
    essence: "קרבה שנבנית מבחירה, בקצב הדדי ועם זכות מלאה לפרטיות.",
    concepts: [
      "פגיעוּת כאפשרות ולא כחובה",
      "הדדיות, גבולות והסכמה מתמשכת",
      "שאלות קרבה שאפשר לבחור, לשנות או לדלג עליהן",
      "פרטיות ומינימיזציה של מידע רגיש",
    ],
    skill: "בניית קרבה תוך שמירה על גבולות",
    opener:
      "קרבה אינה מבחן. איזה קצב ואילו גבולות יעזרו לך להרגיש שיש גם חיבור וגם חופש בחירה?",
    applyPrompts: [
      "בחרו יחד שאלה אחת שנוח לשניכם לענות עליה, או החליטו לדלג.",
      "חשבו איזה מידע נשאר פרטי ואיך מכבדים עצירה באמצע שיחה.",
    ],
    simulatorCategory: "חיבור",
  },
  6: {
    phaseNumber: 6,
    name: "מחויבות",
    weeks: "שבוע 12",
    essence: "בחירה הדדית בקשר, בלי לחץ ובלי ויתור על עצמאות או בטיחות.",
    concepts: [
      "שיחת הגדרת קשר בהסכמה",
      "ערכים, ציפיות והתאמה לטווח ארוך",
      "הבחנה בין פחד פנימי לבין סימני סכנה ממשיים",
      "הזכות להאט, לומר לא או לשנות החלטה",
    ],
    skill: "שיחה הדדית על ציפיות ומחויבות",
    opener:
      "מחויבות בריאה היא בחירה של שני אנשים. מה חשוב לך לברר כדי להחליט בחופשיות ובבטחה?",
    applyPrompts: [
      "נסח שלושה ערכים חשובים לך והבדל אותם מהעדפות גמישות.",
      "אם שני הצדדים רוצים, תרגלו פתיחה לשיחת הגדרת קשר בלי אולטימטום.",
    ],
    simulatorCategory: "מערכת יחסים",
  },
};

// Fallback profile when a lesson has no phase mapping yet.
export const DEFAULT_PROFILE: PhaseProfile = {
  phaseNumber: 0,
  name: "הדרך",
  weeks: "",
  essence: "המסע שלך לזוגיות — צעד אחר צעד.",
  concepts: [
    "אמת, כלים, כבוד (אמ\"כ) — שלושת הערכים",
    "אפשרויות מעשיות שאפשר להתאים או לדלג עליהן",
    "אחריות על בחירות בלי להתעלם מנסיבות ומגבולות",
  ],
  skill: "תקשורת בינאישית",
  opener:
    "אני כלי AI לתרגול ורפלקציה. במה תרצה להתמקד, בלי לשתף פרטים מזהים או מידע שאינך רוצה שיעובד אצל ספק חיצוני?",
  applyPrompts: [
    "בחר דבר אחד קטן מהשיעור שאתה יכול ליישם כבר השבוע.",
  ],
  simulatorCategory: "שיחה",
};

export function getPhaseProfile(phaseNumber?: number): PhaseProfile {
  if (phaseNumber && PHASE_PROFILES[phaseNumber]) {
    return PHASE_PROFILES[phaseNumber];
  }
  return DEFAULT_PROFILE;
}

// ------------------------------------------------------------
// System prompt builder — used for BOTH the live-AI path (as the
// system prompt) and the template path (as the knowledge base).
// ------------------------------------------------------------
export function buildAdvisorSystemPrompt(ctx: LessonContext | null): string {
  const base = `אתה כלי AI לתרגול ורפלקציה של "אומנות הקשר". אל תציג את עצמך כאדם, מטפל, מאמן מוסמך או מומחה קליני, ואל תטען לניסיון או לתוצאות אישיות.

הפילוסופיה שלך: אמת, כלים, כבוד (אמ"כ). הצע אפשרויות, לא הוראות; אין הבטחת תוצאה.
אל תאבחן ואל תנחש כוונות, רגשות, התאמה או הסכמה. שתיקה, שפת גוף ואי-מענה אינם הסכמה.
אל תדחוף פנייה, מגע, חשיפה, דייט נוסף, סליחה, פרידה פנים-אל-פנים או מחויבות.
שאל רק מידע נחוץ ואל תבקש שמות, כתובות, צילומי מסך או פרטים מזהים.
אם יש איום, אלימות, כפייה, מעקב, פגיעה עצמית או מצוקה חריפה, עצור עצות זוגיות והפנה ל-/course-safety ולשירות חירום מתאים.

סגנון: עברית ישראלית יומיומית, ישיר וכן (לא עוטף בצמר גפן), מחמם ומעודד.
שואל שאלה אחת ממוקדת שמעמיקה את ההבנה. עונה תמיד בעברית. תשובות קצרות וממוקדות.`;

  if (!ctx) return base;

  const profile = getPhaseProfile(ctx.phaseNumber);
  const progressLine =
    ctx.totalLessons > 0
      ? `המשתמש השלים ${ctx.completedLessons} מתוך ${ctx.totalLessons} שיעורים.`
      : "";

  return `${base}

--- ההקשר של המשתמש כרגע (חשוב מאוד — התאם את התשובה לזה) ---
המשתמש נמצא כעת בשיעור: "${ctx.lessonTitle}"${
    ctx.lessonDescription ? `\nתיאור השיעור: ${ctx.lessonDescription}` : ""
  }
${profile.phaseNumber > 0 ? `שלב ${profile.phaseNumber} — ${profile.name} (${profile.weeks})` : ""}${
    ctx.weekNumber ? ` · שבוע ${ctx.weekNumber}` : ""
  }
מהות השלב: ${profile.essence}
מושגי הליבה של השלב: ${profile.concepts.join("; ")}
הכישור שמתאמנים עליו: ${profile.skill}
${progressLine}
${ctx.isLessonComplete ? "המשתמש כבר סיים את השיעור הזה." : "המשתמש עדיין באמצע השיעור."}

חבר את התשובה שלך לשיעור ולשלב הספציפיים האלה. כשרלוונטי, הצע לתרגל את הכישור בסימולטור הדייטינג.`;
}

// ------------------------------------------------------------
// Template engine — produces a useful, lesson-aware reply with NO
// API key. Picks a response strategy from the user's message.
// ------------------------------------------------------------
type Intent =
  | "greeting"
  | "stuck"
  | "rejection"
  | "howto"
  | "summary"
  | "practice"
  | "general";

function detectIntent(message: string): Intent {
  const m = message.toLowerCase();
  if (/^(היי|שלום|הי|אהלן|מה נשמע|בוקר טוב|ערב טוב)/.test(message.trim())) {
    return "greeting";
  }
  if (/(דחייה|דחו אותי|לא ענת|לא ענה|התעלמ|פsilenced|ghosting|נעלם)/.test(m)) {
    return "rejection";
  }
  if (/(תקוע|תקועה|לא יודע|לא יודעת|מתוסכל|מיואש|אבוד|בודד|לבד|קשה לי)/.test(m)) {
    return "stuck";
  }
  if (/(איך|כיצד|מה לעשות|מה אני אמור|מה הצעד)/.test(m)) {
    return "howto";
  }
  if (/(סכם|תסכם|מה למדתי|מה השיעור|על מה|הסבר)/.test(m)) {
    return "summary";
  }
  if (/(תרגל|תרגול|סימולציה|להתאמן|לתרגל|דייט אמיתי)/.test(m)) {
    return "practice";
  }
  return "general";
}

export interface TemplateReply {
  text: string;
  /** when true, the UI should surface a "practice in simulator" CTA */
  suggestSimulator: boolean;
}

export function buildTemplateReply(
  userMessage: string,
  ctx: LessonContext | null
): TemplateReply {
  const profile = getPhaseProfile(ctx?.phaseNumber);
  const intent = detectIntent(userMessage);
  const lessonRef = ctx ? `"${ctx.lessonTitle}"` : "השיעור שלך";
  // Grammar-safe "in the lesson" form: prefixing ב to "השיעור שלך" produced
  // "בהשיעור שלך" (found live on prod, fixed 2026-07-05).
  const inLessonRef = ctx ? `ב"${ctx.lessonTitle}"` : "בשיעור שלך";
  const concept = profile.concepts[0] ?? "תקשורת בינאישית";
  const apply = profile.applyPrompts[0] ?? "בחר צעד קטן אחד ליישם השבוע.";

  switch (intent) {
    case "greeting":
      return {
        text: `${profile.opener}\n\nאני רואה שאתה עכשיו ${inLessonRef}${
          profile.phaseNumber > 0 ? ` — שלב ${profile.name}` : ""
        }. רוצה שנעבוד על ${profile.skill}?`,
        suggestSimulator: false,
      };
    case "rejection":
      return {
        text: `דחייה יכולה לכאוב, והיא אינה קביעה על הערך שלך. כדאי להפריד בין מה שנאמר או נעשה בפועל לבין פרשנויות שאין דרך לדעת. "לא" או אי-מענה אינם הזמנה לנסות שוב.\n\nמה יעזור לך כרגע — זמן, תמיכה מאדם מהימן, או תרגול של תגובה מכבדת בסימולטור?`,
        suggestSimulator: true,
      };
    case "stuck":
      return {
        text: `אני שומע שקשה כרגע. אין חובה להפוך את התחושה מיד למשימת פעולה. ${inLessonRef} (${profile.name}) המוקד הוא: ${concept}.\n\nאם מועיל, אפשר לשקול צעד קטן: ${apply}\n\nאפשר גם לעצור, לכתוב לעצמך או לבקש תמיכה. מה מתאים יותר כרגע?`,
        suggestSimulator: false,
      };
    case "howto":
      return {
        text: `שאלה טובה. בשלב ${profile.name} הכלי המרכזי הוא ${profile.skill}.\n\nהדרך המעשית: ${apply}\n\nוזכור — אמ"כ: אמת (תהיה כן עם עצמך), כלים (תשתמש במה שלמדת ${inLessonRef}), כבוד (גם כלפיך וגם כלפי השני). רוצה לתרגל את זה בסימולטור לפני המציאות?`,
        suggestSimulator: true,
      };
    case "summary":
      return {
        text: `${lessonRef}${
          profile.phaseNumber > 0 ? ` שייך לשלב ${profile.name} (${profile.weeks})` : ""
        }.\n\nמהות: ${profile.essence}\n\nמושגי הליבה:\n${profile.concepts
          .map((c) => `• ${c}`)
          .join("\n")}\n\nהכישור שמתאמנים עליו: ${profile.skill}.\n\nרוצה ליישם? ${apply}`,
        suggestSimulator: true,
      };
    case "practice":
      return {
        text: `אפשר לתרגל את ${profile.skill} בסימולטור לפני החלטה על צעד במציאות. זו סביבה מבוקרת עם דמות AI, אבל היא עלולה לטעות ואינה מנבאת כיצד אדם אמיתי ירגיש או יגיב. אפשר לעצור בכל רגע. הקטגוריה המתאימה היא "${profile.simulatorCategory}".`,
        suggestSimulator: true,
      };
    default:
      return {
        text: `בהקשר של ${lessonRef}${
          profile.phaseNumber > 0 ? ` (שלב ${profile.name})` : ""
        }, המוקד הוא ${concept}.\n\nאפשר לתאר את השאלה בלי שמות או פרטים מזהים. אם מתאים, אפשרות אחת לבדיקה היא: ${apply}`,
        suggestSimulator: false,
      };
  }
}
