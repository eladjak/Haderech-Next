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
    essence: "עבודה פנימית — הסיפורים שאתה מספר לעצמך, והגבולות שלך.",
    concepts: [
      "הסיפור הפנימי (איזה סיפור אתה מספר לעצמך על אהבה)",
      "אמונות מגבילות מול אמונות מצמיחות",
      "גבולות בריאים והאחריות שלך על עצמך",
      "נקודת המוצא — איפה אתה באמת עומד היום",
    ],
    skill: "מודעות עצמית והצבת גבולות",
    opener:
      "בוא נתחיל מהיסוד. בשלב הזה לא מדברים על השני — מדברים עליך. מה הסיפור שאתה מספר לעצמך על למה זה לא קורה לך?",
    applyPrompts: [
      "כתוב משפט אחד שאתה אומר לעצמך על אהבה — ובדוק אם הוא עוזר או מעכב.",
      "זהה מצב אחד מהשבוע שבו לא שמרת על גבול — ומה היית עושה אחרת.",
    ],
    simulatorCategory: "פתיחה",
  },
  2: {
    phaseNumber: 2,
    name: "תקשורת",
    weeks: "שבועות 4-5",
    essence: "להכיר את עצמך — רגשות, צרכים, ולהביע אותם בלי לפחד.",
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
      "נסח בקשה אחת בנוסח 'אני מרגיש... כי אני צריך...' במקום האשמה.",
      "בשיחה הקרובה, שאל שאלה אחת פתוחה והקשב בלי לתכנן את התגובה.",
    ],
    simulatorCategory: "שיחה",
  },
  3: {
    phaseNumber: 3,
    name: "משיכה ומעבר",
    weeks: "שבועות 6-9",
    essence: "אומץ לפעולה — היכרויות, דייטים, לצאת מהראש אל המציאות.",
    concepts: [
      "אומץ מול נוחות — לעשות את הצעד למרות הפחד",
      "פתיחת שיחה והפיכתה לדייט",
      "ניהול דייט ראשון בלי לחץ",
      "להתמודד עם דחייה בלי להישבר",
    ],
    skill: "פתיחת שיחה, דייטינג והתמודדות עם דחייה",
    opener:
      "פה נכנסים לפעולה. הידע לבד לא מספיק — צריך לתרגל במציאות. מה הצעד הקטן שאתה יכול לעשות השבוע, גם אם זה לא נוח?",
    applyPrompts: [
      "פתח שיחה אחת אמיתית השבוע — אונליין או פנים אל פנים.",
      "אחרי דייט/שיחה, רשום דבר אחד שעבד ודבר אחד לשפר — בלי לשפוט את עצמך.",
    ],
    simulatorCategory: "דייט ראשון",
  },
  4: {
    phaseNumber: 4,
    name: "חיבור וכימיה",
    weeks: "שבועות 10-11",
    essence: "אינטימיות ופגיעות — להעמיק קשר במקום להישאר על פני השטח.",
    concepts: [
      "פגיעוּת כמפתח לחיבור עמוק",
      "לבנות אמון בהדרגה",
      "כימיה — מה זה באמת ואיך לא לבלבל אותה עם דרמה",
      "להעז להראות מי אתה",
    ],
    skill: "יצירת אינטימיות וחיבור עמוק",
    opener:
      "חיבור אמיתי נבנה מפגיעוּת, לא משליטה. איפה אתה נוטה 'לשמור על קור רוח' במקום להראות מה באמת קורה לך?",
    applyPrompts: [
      "שתף משהו אמיתי וקצת חשוף בשיחה הקרובה — ושים לב מה זה עושה לקשר.",
      "זהה רגע שבו בלבלת דרמה עם כימיה — ומה ההבדל מבחינתך.",
    ],
    simulatorCategory: "חיבור",
  },
  5: {
    phaseNumber: 5,
    name: "מחויבות",
    weeks: "שבוע 12",
    essence: "לבנות זוגיות — מהיכרות לקשר שמחזיק לאורך זמן.",
    concepts: [
      "המעבר מ'אנחנו יוצאים' ל'אנחנו זוג'",
      "שיחת הגדרת הקשר (DTR) בלי דרמה",
      "ציפיות, ערכים והתאמה לטווח ארוך",
      "לתחזק קשר — לא רק להתחיל אותו",
    ],
    skill: "בניית מחויבות וזוגיות יציבה",
    opener:
      "להתחיל קשר זה דבר אחד, לבנות אותו זה אחר. מה מפחיד אותך יותר — להישאר לבד, או להתחייב?",
    applyPrompts: [
      "נסח לעצמך 3 ערכים שחייבים להיות בבן/בת הזוג — והבדל אותם מ'נחמד שיהיה'.",
      "תרגל פתיחה לשיחת הגדרת-קשר בנימה רגועה, בלי אולטימטום.",
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
    "כלים מעשיים שעובדים מחר בבוקר",
    "אחריות אישית על השינוי",
  ],
  skill: "תקשורת בינאישית",
  opener:
    "אני כאן בשבילך. מה עובר עליך עכשיו? ספר לי ונתחיל לעבוד יחד.",
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
  const base = `אתה היועץ החכם של "אומנות הקשר" — הגישה הישראלית לזוגיות.
יש לך ניסיון של 15+ שנה בליווי זוגות, ועבדת עם למעלה מ-461 זוגות שמצאו אהבה.

הפילוסופיה שלך: אמת, כלים, כבוד (אמ"כ). לא מטיפים, לא שופטים — רק עוזרים.
כלים מעשיים שעובדים מחר בבוקר.

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
        text: `דחייה כואבת — וזה בסדר להרגיש את זה. אבל דחייה היא לא הוכחה על הערך שלך, היא מידע. בשלב ${profile.name} אנחנו לומדים בדיוק את זה: ${profile.essence}\n\nשאלה אחת: מה הסיפור שאתה מספר לעצמך עכשיו על מה שקרה? לפעמים הסיפור כואב יותר מהאירוע עצמו.\n\nרוצה לתרגל איך מתמודדים עם זה בסימולטור, בלי הסיכון האמיתי?`,
        suggestSimulator: true,
      };
    case "stuck":
      return {
        text: `אני שומע אותך. תקיעות זה לא כישלון — זה הנקודה שבה הצמיחה מתחילה. ${inLessonRef} (${profile.name}) המוקד הוא: ${concept}.\n\nבוא נקטין את זה לצעד אחד קטן: ${apply}\n\nמה מהשניים מרגיש לך אפשרי יותר עכשיו?`,
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
        text: `מצוין שאתה רוצה לתרגל — שם השינוי האמיתי קורה. בשלב ${profile.name} מתאמנים על ${profile.skill}.\n\nהסימולטור נותן לך לתרגל בדיוק את זה בסביבה בטוחה: דמות שמגיבה כמו בן/בת זוג אמיתי, ומשוב מותאם בסוף. אני ממליץ על תרחיש בקטגוריית "${profile.simulatorCategory}".`,
        suggestSimulator: true,
      };
    default:
      return {
        text: `אני איתך. בהקשר של ${lessonRef}${
          profile.phaseNumber > 0 ? ` (שלב ${profile.name})` : ""
        }, המוקד הוא ${concept}.\n\nספר לי קצת יותר — מה בדיוק עולה לך עכשיו? ככל שאדע יותר, אוכל לכוון אותך מדויק יותר. ובינתיים, צעד קטן ליישום: ${apply}`,
        suggestSimulator: false,
      };
  }
}
