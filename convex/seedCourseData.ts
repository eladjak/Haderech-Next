/**
 * Seed Course Data - HaDerech Learning Platform
 *
 * Contains the REAL content from "Omanut HaKesher" course scripts.
 * 73 video lessons organized into 12 weeks across 6 phases.
 * Plus 3 stub courses for future expansion.
 *
 * Source: /OneDrive/עסקים/אומנות הקשר כאן ועכשיו/מסמכי קורס דרך חדשה/תסריטים/
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeedLesson {
  /** Hebrew lesson title (from script header) */
  title: string;
  /** Hebrew description extracted from script intro/topic */
  description: string;
  /** Lesson order within its module (0-based) */
  order: number;
  /** Week number (1-12) */
  weekNumber: number;
  /** Phase number (1-6) */
  phaseNumber: number;
  /** Hebrew phase name */
  phaseName: string;
  /** Estimated duration in seconds (derived from script metadata) */
  duration: number;
  /** Script index reference e.g. "1.1.1" */
  scriptIndex: string;
}

export interface SeedModule {
  /** Hebrew week/module title */
  title: string;
  /** Hebrew subtitle */
  subtitle: string;
  /** Week number (1-12) */
  weekNumber: number;
  /** Phase number (1-6) */
  phaseNumber: number;
  /** Hebrew phase name */
  phaseName: string;
  /** Lessons in this module */
  lessons: SeedLesson[];
}

export interface SeedCourse {
  /** Hebrew course title */
  title: string;
  /** Hebrew course description */
  description: string;
  /** Course category */
  category: string;
  /** Difficulty level */
  level: "beginner" | "intermediate" | "advanced";
  /** Estimated total hours */
  estimatedHours: number;
  /** Display order */
  order: number;
  /** Whether to publish immediately */
  published: boolean;
  /** Modules (weekly units) */
  modules: SeedModule[];
}

// ---------------------------------------------------------------------------
// Phase definitions
// ---------------------------------------------------------------------------

const PHASES = {
  1: { name: "גישה", nameEn: "Approach" },
  2: { name: "תקשורת", nameEn: "Communication" },
  3: { name: "מעבר ומשיכה", nameEn: "Transition & Attraction" },
  4: { name: "חיבור וכימיה", nameEn: "Connection & Chemistry" },
  5: { name: "אינטימיות", nameEn: "Intimacy" },
  6: { name: "מחויבות", nameEn: "Commitment" },
} as const;

// ---------------------------------------------------------------------------
// Main course: הדרך - אומנות הקשר
// ---------------------------------------------------------------------------

const HADERECH_MODULES: SeedModule[] = [
  // =========================================================================
  // PHASE 1: גישה (Approach) - שבועות 1-3
  // =========================================================================
  {
    title: "שבוע 1: פתיחת המסע",
    subtitle: "יסודות פנימיים והתחייבות לתהליך",
    weekNumber: 1,
    phaseNumber: 1,
    phaseName: PHASES[1].name,
    lessons: [
      {
        title: "פתיחת המסע - ברוכים הבאים לדרך!",
        description:
          "ברכת פתיחה ומה מחכה לכם בתוכנית. ב-12 השבועות הקרובים נעבור יחד תהליך מובנה ומוכח - מהעבודה הפנימית ועד ליצירת חיבור אמיתי. המשימה הראשונה: למלא את שאלון ההיכרות ולהבין מה באמת מניע אתכם.",
        order: 0,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.1.1",
      },
      {
        title: "צמיחה דרך קושי",
        description:
          "למה הרגעים הקשים הם ההזדמנות הגדולה ביותר לצמיחה. הצמיחה הגדולה ביותר שלנו מגיעה דווקא מתוך חיכוך ומצבים שמוציאים אותנו מאזור הנוחות. במקום לראות אתגר ולחשוב שמשהו לא בסדר - אפשר לראות אותו כהזדמנות.",
        order: 1,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 120,
        scriptIndex: "1.1.2",
      },
      {
        title: "עקרון רואן - לעשות בלי תירוצים",
        description:
          "סיפור איגרת לגרסיה ועקרון הפעולה ללא תירוצים. רואן לא שאל שאלות - הוא פשוט יצא לדרך. גם בזוגיות אפשר לשאול אינסוף שאלות, או שאפשר להיות כמו רואן - לקחת את המשימה ולצאת לדרך.",
        order: 2,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.2.1",
      },
      {
        title: "אחריות אישית - אתה קפטן הספינה",
        description:
          'אתה אחראי לכל מה שמתרחש בחייך. כשאתה לוקח אחריות מלאה, במקום להרגיש כמו קורבן של הנסיבות, אתה מרגיש כמו קפטן של הספינה. נכון, יש סערות - אבל ההגה בידיים שלך. לקחת אחריות זה להחזיר לעצמך את הכוח.',
        order: 3,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.2.2",
      },
      {
        title: "החופשה מדייטים מתחילה - 30 יום",
        description:
          "למה 30 יום ללא דייטים זה המפתח להצלחה. רוב האנשים ממהרים לצאת לדייטים בלי לעשות את העבודה הפנימית - זה כמו לבנות בית בלי יסודות. 30 הימים האלה הם הזמן שלכם לבנות את היסודות.",
        order: 4,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.3.1",
      },
      {
        title: "כתיבת חזון אישי - 8 תחומי חיים",
        description:
          'איך לכתוב חזון שימשוך אליכם את הזוגיות הנכונה. דמיינו את עצמכם בעוד 10 שנים ב-8 תחומי חיים: משפחה, זוגיות, חברים, בריאות הגוף, בריאות הנפש, כלכלה, קריירה והתפתחות אישית. חזון הוא לא חלום באוויר - חזון הוא חלום עם כתובת.',
        order: 5,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.3.2",
      },
      {
        title: "מטרות קטנות - מהחזון לפעולה",
        description:
          'איך לפרק את החזון הגדול למטרות קטנות שאפשר להשיג. "איך אוכלים פיל? נתח אחרי נתח." חזון בלי פעולה הוא רק חלום. פעולה בלי חזון היא רק עיסוק. אבל חזון עם פעולה - זה מה שמשנה חיים.',
        order: 6,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.4.1",
      },
      {
        title: "תעודת מחויבות - ההבטחה לעצמך",
        description:
          'חשיבות ההתחייבות הרשמית לתהליך. יש הבדל עצום בין "אני רוצה למצוא זוגיות" לבין "אני מתחייב למצוא זוגיות". הראשון הוא משאלה, השני הוא החלטה. התחייבות היא לא כלא - התחייבות היא חירות.',
        order: 7,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.5.1",
      },
    ],
  },

  {
    title: "שבוע 2: אמונות וסיפורים",
    subtitle: "זיהוי ושינוי הסיפורים שמעכבים אתכם",
    weekNumber: 2,
    phaseNumber: 1,
    phaseName: PHASES[1].name,
    lessons: [
      {
        title: "סיפורים מגבילים - מה אתם מספרים לעצמכם",
        description:
          'זיהוי הסיפורים השליליים שאנחנו מספרים לעצמנו. שלושה סוגים: סיפורים על עצמנו ("אני לא מספיק"), סיפורים על המין השני ("כולם רוצים רק..."), וסיפורים על זוגיות בכלל ("אהבה אמיתית לא קיימת"). הסיפורים האלה לא נכונים - הם פשוט אמונות שקיבלנו.',
        order: 0,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.1.1",
      },
      {
        title: "לכתוב מחדש את הסיפור",
        description:
          'איך להפוך סיפורים מגבילים לסיפורים מעצימים. הסיפור ההפוך לסיפור שאתם מספרים לעצמכם עשוי להיות נכון בדיוק באותה מידה. "אני לא מספיק" יכול להיות גם "אני מעולה". שני הסיפורים הם פרשנויות - לא עובדות. אתם הסופרים של הסיפור שלכם.',
        order: 1,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.1.2",
      },
      {
        title: "אמונות מקדמות מול אמונות מגבילות",
        description:
          'ההבדל בין אמונות שמקדמות אותנו לאמונות שמעכבות. שני סוגי האמונות הם רק מחשבות - לא עובדות. אתם יכולים לבחור באיזו אמונה להחזיק. זה לא שקר, זו לא הונאה עצמית - זו בחירה מודעת באמונה שמשרתת אתכם.',
        order: 2,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.2.1",
      },
      {
        title: "תרגיל אמונות - 4 פעמים ביום",
        description:
          "איך לתרגל אמונה חדשה עד שהיא נקלטת. הטכניקה: לקרוא את האמונה החדשה ארבע פעמים ביום - בבוקר, בלילה, ועוד פעמיים במהלך היום. בכל פעם שקוראים את המשפט, נוצר חיבור חדש במוח. זה לא קסם - זו נוירופלסטיות.",
        order: 3,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.2.2",
      },
      {
        title: "דפוסי חשיבה אוטומטיים",
        description:
          'זיהוי ופירוק דפוסי חשיבה שסותרים זה את זה. דפוס אוטומטי מסתתר בין שני סיפורים שביחד יוצרים מלכודת: "מי שאני רוצה לא רוצה אותי" + "כשמישהו רוצה אותי אני מאבדת עניין" = אי אפשר לנצח. ברגע שזיהיתם את הדפוס - קל לפרק אותו.',
        order: 4,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.3.1",
      },
      {
        title: "סיכום שבוע 2 - סיפורים ואמונות",
        description:
          "סיכום הכלים שלמדנו השבוע: סיפורים מגבילים, כתיבה מחדש, אמונות מקדמות מול מגבילות, תרגול 4 פעמים ביום, ודפוסים אוטומטיים. המילים שאנחנו אומרים לעצמנו הן המילים שמעצבות את חיינו - בחרו מילים טובות.",
        order: 5,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.4.1",
      },
    ],
  },

  {
    title: "שבוע 3: פחדים, גבולות ואהבה עצמית",
    subtitle: "התמודדות עם חסמים פנימיים ובניית ביטחון",
    weekNumber: 3,
    phaseNumber: 1,
    phaseName: PHASES[1].name,
    lessons: [
      {
        title: "פחד וההתמודדות איתו",
        description:
          "להבין את הפחד ולהפוך אותו לבעל ברית. הפחד הוא לא האויב - הוא מצביע על מה שחשוב לנו. כשמבינים מאיפה הפחד מגיע, אפשר להשתמש בו ככלי לצמיחה במקום לתת לו לשתק אותנו.",
        order: 0,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.1.1",
      },
      {
        title: "14 הפחדים שמונעים זוגיות",
        description:
          "הפחדים הקלאסיים שחוסמים אנשים מזוגיות. מפחד מדחייה ועד פחד מאובדן עצמאות - רשימה מקיפה של 14 הפחדים הנפוצים ביותר שעוצרים אנשים מלצאת לדרך. זיהוי הפחד הוא חצי מהפתרון.",
        order: 1,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.1.2",
      },
      {
        title: "אומנות הצבת גבולות",
        description:
          "למה גבולות חשובים ואיך להתחיל להציב אותם. גבולות בריאים הם לא קירות - הם גדרות עם שער. הם מגדירים מה בסדר ומה לא, ודווקא מאפשרים קרבה אמיתית כי הם יוצרים תחושת ביטחון.",
        order: 2,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.2.1",
      },
      {
        title: "ללמוד לומר לא",
        description:
          'איך לומר לא בלי להרגיש אשמים. לומר "לא" לדברים שלא נכונים לנו זה בעצם לומר "כן" לעצמנו. כלים מעשיים להציב גבולות בצורה ברורה, מכובדת ואסרטיבית.',
        order: 3,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.2.2",
      },
      {
        title: "אהבה עצמית - לא מה שחשבתם",
        description:
          "מה זה באמת אהבה עצמית ואיך מתרגלים אותה. אהבה עצמית היא לא נרקיסיזם ולא פינוק - היא ההכרה שאתם ראויים לאהבה כמו שאתם. תרגילים מעשיים לבניית יחס בריא ומאוזן כלפי עצמכם.",
        order: 4,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.3.1",
      },
      {
        title: "פגיעות - הסרת שכבות הגנה",
        description:
          "למה פגיעות היא כוח ולא חולשה. כדי ליצור חיבור אמיתי עם מישהו אחר, צריך קודם להסיר את שכבות ההגנה שבנינו סביב עצמנו. פגיעות היא הדרך האמיצה ביותר להראות מי אנחנו באמת.",
        order: 5,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.3.2",
      },
      {
        title: "שגרות מנצחות - טקסי בוקר וערב",
        description:
          "איך שגרה יומית פשוטה משנה את הגישה לחיים. טקסי בוקר וערב שיעזרו לכם להתחיל ולסיים כל יום עם מיקוד, הכרת תודה ומוטיבציה. שינויים קטנים בשגרה מובילים לתוצאות גדולות.",
        order: 6,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.4.1",
      },
      {
        title: "להזיז את ההר - 10 חלומות",
        description:
          "סיום שלב הגישה עם משימת החלומות. כתבו 10 חלומות שאתם רוצים להגשים - לא רק בזוגיות, בכל תחומי החיים. זה הזמן לחלום בגדול ולהתחיל להזיז את ההר, צעד אחד בכל פעם.",
        order: 7,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.5.1",
      },
    ],
  },

  // =========================================================================
  // PHASE 2: תקשורת (Communication) - שבועות 4-5
  // =========================================================================
  {
    title: "שבוע 4: הכרת עצמי",
    subtitle: "מי אני, מה אני מחפש, ואיך לבנות את הרשימה",
    weekNumber: 4,
    phaseNumber: 2,
    phaseName: PHASES[2].name,
    lessons: [
      {
        title: "מי אני ומה טיבי",
        description:
          "הכרת עצמי כבסיס לזוגיות נכונה. לפני שמחפשים מישהו אחר, צריך להכיר את עצמנו לעומק - מה החוזקות שלנו, מה הערכים שלנו, ומה באמת חשוב לנו בחיים ובזוגיות.",
        order: 0,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.1.1",
      },
      {
        title: "4 טיפוסי אישיות",
        description:
          "הכרת ארבעת סוגי האישיות הבסיסיים. הבנת טיפוסי האישיות עוזרת לנו להבין את עצמנו טוב יותר, לדעת מה אנחנו צריכים בזוגיות, ולזהות איזה טיפוס ישלים אותנו.",
        order: 1,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.1.2",
      },
      {
        title: "איזה טיפוס אני?",
        description:
          "שאלון לזיהוי טיפוס האישיות שלכם. שאלון מעשי שיעזור לכם לזהות את סוג האישיות שלכם ולהבין את ההשלכות על חיי הזוגיות שלכם - מה אתם מביאים לקשר ומה אתם צריכים לקבל.",
        order: 2,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.2.1",
      },
      {
        title: "מה אני צריך להרגיש",
        description:
          "החשיבות של הרגשה נכונה בזוגיות. לא מספיק שמישהו יתאים ברשימה - צריך גם להרגיש נכון. איך מזהים את ההרגשה הנכונה, ומה ההבדל בין התרגשות ראשונית לחיבור אמיתי.",
        order: 3,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.2.2",
      },
      {
        title: "הרשימה שלי - בנייה נכונה",
        description:
          "איך לבנות רשימת תכונות שעובדת. לא כל תכונה שווה - יש תכונות הכרחיות, תכונות חשובות ותכונות נחמדות. שיטה מעשית לבניית רשימה שתעזור לכם למקד את החיפוש בלי לפספס אנשים מתאימים.",
        order: 4,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.3.1",
      },
      {
        title: "5 טעויות נפוצות ברשימה",
        description:
          "הטעויות שמונעות מאנשים למצוא זוגיות. מרשימה ארוכה מדי ועד דרישות שלא באמת חשובות - חמש הטעויות הנפוצות שגורמות לאנשים לפספס פרטנרים מעולים.",
        order: 5,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.3.2",
      },
      {
        title: "סוף החופשה מדייטים - סיכום חודש",
        description:
          "סיכום 30 יום ללא דייטים והכנה לשלב הבא. הגיע הזמן לסכם את העבודה הפנימית שעשיתם ולהתכונן לשלב הפעולה. מה השתנה בכם? מה למדתם? ואיך יוצאים לדרך מחדש - הפעם עם יסודות חזקים.",
        order: 6,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.4.1",
      },
    ],
  },

  {
    title: "שבוע 5: צרכים, רגשות והדדיות",
    subtitle: "הכרת הרגשות והצרכים שלכם בזוגיות",
    weekNumber: 5,
    phaseNumber: 2,
    phaseName: PHASES[2].name,
    lessons: [
      {
        title: "הכרת הרגשות",
        description:
          "להכיר ולזהות את הרגשות שלנו. רבים מאיתנו לא יודעים לזהות את הרגשות שלנו ולתת להם שם. כלים מעשיים לפיתוח אוריינות רגשית שתעזור לנו לתקשר טוב יותר בזוגיות.",
        order: 0,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.1.1",
      },
      {
        title: "הכרת הצרכים",
        description:
          "להבין את הצרכים שמאחורי הרגשות. מאחורי כל רגש מסתתר צורך. כשמבינים את הצרכים שלנו, אנחנו יכולים לבטא אותם בצורה ברורה ולבנות זוגיות שנותנת מענה לשני הצדדים.",
        order: 1,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.1.2",
      },
      {
        title: "עקרון ההדדיות",
        description:
          "איזון בין נתינה לקבלה בזוגיות. זוגיות בריאה מבוססת על הדדיות - לא חשבונות מדויקים, אלא תחושה שהשניים נותנים ומקבלים. איך יוצרים איזון בריא ונמנעים מדפוסים של חוסר איזון.",
        order: 2,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.2.1",
      },
      {
        title: "להסכים לקבל",
        description:
          "למה קשה לנו לקבל ואיך מתגברים על זה. הרבה אנשים יודעים לתת אבל מתקשים לקבל. להסכים לקבל אהבה, עזרה ותמיכה זה חלק חיוני מזוגיות מאוזנת ובריאה.",
        order: 3,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.2.2",
      },
      {
        title: 'התנהגויות שמשאירות "לא פנוי"',
        description:
          'ההתנהגויות שמונעות מכם למצוא זוגיות. לפעמים אנחנו עושים דברים שמשדרים "לא פנוי" בלי להיות מודעים לזה. זיהוי ההתנהגויות האלה הוא הצעד הראשון לשינוי.',
        order: 4,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.3.1",
      },
      {
        title: "סיכום שלב התקשורת",
        description:
          "סיכום שבועות 4-5 והכנה לשלב המשיכה. סקירה של כל מה שלמדנו על הכרת עצמנו, רגשות, צרכים והדדיות. עכשיו שיש לכם את היסודות הפנימיים והתקשורתיים - הגיע הזמן לצאת לפעולה.",
        order: 5,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.4.1",
      },
    ],
  },

  // =========================================================================
  // PHASE 3: מעבר ומשיכה (Transition & Attraction) - שבועות 6-9
  // =========================================================================
  {
    title: "שבוע 6: שבוע המעבר",
    subtitle: "מעבודה פנימית לפעולה בעולם האמיתי",
    weekNumber: 6,
    phaseNumber: 3,
    phaseName: PHASES[3].name,
    lessons: [
      {
        title: "מעבודה פנימית לפעולה",
        description:
          "המעבר משלב ההכנה לשלב הפעולה. עשיתם עבודה פנימית עצומה בחמשת השבועות האחרונים. עכשיו הגיע הזמן לקחת את כל מה שלמדתם ולצאת לעולם האמיתי - מחזקים, בטוחים ומוכנים.",
        order: 0,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.1.1",
      },
      {
        title: "רושם ראשוני - 7 השניות הראשונות",
        description:
          "מה אנשים רואים ברגעים הראשונים. תוך 7 שניות אנשים יוצרים עלינו רושם ראשוני. מה משפיע על הרושם הזה, ואיך אפשר לשלוט בו כדי שישדר את מי שאנחנו באמת.",
        order: 1,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.1.2",
      },
      {
        title: "7 מפתחות להיראות נפלא",
        description:
          "טיפים מעשיים לשיפור ההופעה החיצונית. לא מדובר בשינוי מי שאתם - אלא בלהציג את עצמכם בצורה הטובה ביותר. 7 מפתחות פרקטיים שכל אחד יכול ליישם.",
        order: 2,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.2.1",
      },
      {
        title: "תרגיל יציבה - ספר על הראש",
        description:
          "תרגיל פשוט לשיפור יציבה ונוכחות. יציבה טובה משפיעה על איך אנשים תופסים אותנו ועל איך אנחנו מרגישים. תרגיל קצר ומעשי שתוכלו לעשות בכל יום.",
        order: 3,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 120,
        scriptIndex: "6.2.2",
      },
      {
        title: "גישה מדבקת - האנרגיה שמושכת",
        description:
          "איך להקרין אנרגיה שמושכת אנשים. האנרגיה שאנחנו מקרינים מדבקת - אם אנחנו פתוחים, חיוביים ונגישים, אנשים נמשכים אלינו באופן טבעי. איך מפתחים את הגישה המדבקת.",
        order: 4,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.3.1",
      },
      {
        title: "פשוט עשה זאת - מחשיבה לפעולה",
        description:
          "לעבור מתכנון ומחשבה לפעולה בפועל. הגיע הזמן להפסיק לתכנן ולהתחיל לעשות. כלים להתגברות על פרוקרסטינציה ופחדים שמונעים מאיתנו לפעול.",
        order: 5,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.4.1",
      },
    ],
  },

  {
    title: "שבוע 7: אומץ ומשיכה",
    subtitle: "בניית אומץ ויצירת משיכה אמיתית",
    weekNumber: 7,
    phaseNumber: 3,
    phaseName: PHASES[3].name,
    lessons: [
      {
        title: "8 דרכים לחיים של אומץ",
        description:
          "בניית אומץ וחוסן מנטלי. אומץ הוא לא היעדר פחד - אומץ הוא לפעול למרות הפחד. 8 דרכים מעשיות לשלב אומץ בחיי היומיום ולהפוך אותו להרגל.",
        order: 0,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "7.1.1",
      },
      {
        title: "התמודדות עם ביקורת ופחד מדחייה",
        description:
          "איך להתמודד עם הפחד שעוצר אותנו. פחד מדחייה הוא אחד החסמים הגדולים ביותר בחיפוש אחר זוגיות. כלים להתמודדות עם ביקורת ודחייה כך שלא יעצרו אתכם מלנסות.",
        order: 1,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "7.1.2",
      },
      {
        title: "שלוש רמות המשיכה",
        description:
          "הבנת מה גורם לאנשים להימשך אלינו. משיכה היא לא רק מראה - יש שלוש רמות של משיכה שפועלות יחד. כשמבינים אותן, אפשר לחזק את מה שמושך אנשים אלינו באופן אותנטי.",
        order: 2,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "7.2.1",
      },
      {
        title: "אפקט אור הזרקורים",
        description:
          "למה אנחנו חושבים שכולם מסתכלים עלינו - ולמה זה לא נכון. מחקרים מראים שאנשים שמים לב אלינו הרבה פחות ממה שאנחנו חושבים. הידיעה הזו משחררת מלחץ ומאפשרת לנו להיות יותר טבעיים.",
        order: 3,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "7.2.2",
      },
      {
        title: "6 תרגילי אומץ יומיים",
        description:
          "תרגילים מעשיים לבניית אומץ בשגרה. שישה תרגילים שאפשר לעשות כל יום כדי לצאת מאזור הנוחות ולהרגיל את עצמנו לפעול למרות הפחד. כל תרגיל קטן בונה שריר של אומץ.",
        order: 4,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "7.3.1",
      },
    ],
  },

  {
    title: "שבוע 8: היכרויות אונליין",
    subtitle: "פרופיל, התכתבויות ומעבר לפגישה אמיתית",
    weekNumber: 8,
    phaseNumber: 3,
    phaseName: PHASES[3].name,
    lessons: [
      {
        title: "תמונת פרופיל מנצחת - 7 עקרונות",
        description:
          "איך לצלם תמונת פרופיל שעובדת. התמונה שלכם היא הדבר הראשון שאנשים רואים. 7 עקרונות צילום שיעזרו לכם לבחור תמונה שמציגה אתכם בצורה הטובה והאותנטית ביותר.",
        order: 0,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "8.1.1",
      },
      {
        title: "טקסט בפרופיל - אותנטיות ושובבות",
        description:
          "איך לכתוב טקסט פרופיל שמושך תשומת לב. הטקסט צריך להיות אותנטי, מעניין ומזמין - לא גנרי ולא מנסה יותר מדי. טיפים לכתיבת טקסט שמשקף את מי שאתם ומעורר סקרנות.",
        order: 1,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "8.1.2",
      },
      {
        title: "התכתבויות ורשתות חברתיות",
        description:
          "איך לנהל שיחות אונליין שמובילות לפגישה. ההתכתבות היא לא המטרה - המטרה היא להיפגש. כלים לניהול שיחה מעניינת שיוצרת סקרנות ומובילה באופן טבעי לפגישה אמיתית.",
        order: 2,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "8.2.1",
      },
      {
        title: "מפגש ראשון - מהאונליין לאמת",
        description:
          "איך עוברים מהתכתבות לפגישה אמיתית. הרגע שבו מציעים להיפגש, איך בוחרים מקום, ומה לעשות כדי שהמעבר מאונליין לפגישה פנים אל פנים יהיה חלק וטבעי.",
        order: 3,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "8.2.2",
      },
      {
        title: "סיכום יומי ושבועי",
        description:
          "כלים למעקב והתקדמות. שיטת הסיכום היומי והשבועי שתעזור לכם לעקוב אחרי ההתקדמות, להפיק לקחים ולהשתפר כל הזמן. כי מה שנמדד - משתפר.",
        order: 4,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "8.3.1",
      },
    ],
  },

  {
    title: "שבוע 9: תרגול דייטים",
    subtitle: "הכנה, שיחה ולקחים מכל דייט",
    weekNumber: 9,
    phaseNumber: 3,
    phaseName: PHASES[3].name,
    lessons: [
      {
        title: "הכנה לדייט - מיקום והימנעות מטעויות",
        description:
          "איך להתכונן לדייט בצורה נכונה. מבחירת המיקום ועד ההכנה המנטלית - כל מה שצריך לדעת כדי להגיע לדייט מוכנים, רגועים ובגרסה הטובה ביותר של עצמכם.",
        order: 0,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "9.1.1",
      },
      {
        title: "10 כללים לשיחה מנצחת",
        description:
          "איך לנהל שיחה טובה בדייט. שיחה טובה היא הבסיס לכל חיבור. 10 כללים פרקטיים שיעזרו לכם ליצור שיחה זורמת, מעניינת ומחברת - בלי מבוכות ושתיקות מוזרות.",
        order: 1,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 180,
        scriptIndex: "9.1.2",
      },
      {
        title: "שאלות מעולות לדייטים",
        description:
          "רשימת שאלות שיוצרות חיבור. לא שאלות ראיון עבודה - שאלות שיוצרות שיחה מעניינת, חושפות את האדם שמולכם, ומאפשרות חיבור אמיתי כבר מהדייט הראשון.",
        order: 2,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "9.2.1",
      },
      {
        title: "אחרי הדייט - מה עכשיו?",
        description:
          "איך להתנהל אחרי דייט. מה עושים אחרי דייט טוב? ואחרי דייט לא טוב? איך מחליטים אם רוצים דייט שני, ואיך מתקשרים את זה. כללי ההתנהלות לאחר מפגש ראשון.",
        order: 3,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "9.2.2",
      },
      {
        title: "איך כותבים דיווח דייט",
        description:
          "תיעוד והפקת לקחים מכל דייט. כתיבת דיווח אחרי כל דייט היא כלי חזק ללמידה והשתפרות. מה לרשום, איך לנתח את החוויה, ואיך להשתמש בלקחים לדייטים הבאים.",
        order: 4,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "9.3.1",
      },
    ],
  },

  // =========================================================================
  // PHASE 4: חיבור וכימיה (Connection & Chemistry) - שבועות 10-11
  // =========================================================================
  {
    title: "שבוע 10: כימיה והקשבה",
    subtitle: "הבנת כימיה ויצירת חיבור עמוק",
    weekNumber: 10,
    phaseNumber: 4,
    phaseName: PHASES[4].name,
    lessons: [
      {
        title: "מהי כימיה וחיבור רגשי",
        description:
          "הבנת הכימיה בין אנשים. מה זו בעצם כימיה? האם היא עניין של מזל או שאפשר ליצור אותה? הבנה מעמיקה של מה שגורם לנו להרגיש חיבור עם מישהו, ואיך לזהות כימיה אמיתית.",
        order: 0,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 180,
        scriptIndex: "10.1.1",
      },
      {
        title: "דיוק החיפוש - 2-3 תכונות קריטיות",
        description:
          "איך לדעת מה באמת חשוב לכם. במקום רשימה ארוכה של דרישות, מתמקדים ב-2-3 תכונות שהן באמת קריטיות. כלים לדייק את החיפוש כדי לא לפספס פרטנרים מתאימים.",
        order: 1,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 150,
        scriptIndex: "10.1.2",
      },
      {
        title: "הקשבה פעילה - אבני הבניין",
        description:
          "איך להקשיב באמת. הקשבה פעילה היא אחד הכלים החזקים ביותר ליצירת חיבור. כשמישהו מרגיש שמקשיבים לו באמת - נוצר אמון, קרבה וכימיה טבעית.",
        order: 2,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 180,
        scriptIndex: "10.2.1",
      },
      {
        title: "יצירת הזדמנויות לחיבור",
        description:
          "איך ליצור רגעים של חיבור אמיתי. חיבור לא קורה סתם - צריך ליצור לו הזדמנויות. שיטות מעשיות ליצירת רגעים משמעותיים שמעמיקים את הקשר עם הפרטנר הפוטנציאלי.",
        order: 3,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 150,
        scriptIndex: "10.3.1",
      },
    ],
  },

  // =========================================================================
  // PHASE 5: אינטימיות (Intimacy) - שבוע 11
  // =========================================================================
  {
    title: "שבוע 11: אינטימיות ופגיעות",
    subtitle: "בניית קרבה אמיתית ועמוקה",
    weekNumber: 11,
    phaseNumber: 5,
    phaseName: PHASES[5].name,
    lessons: [
      {
        title: "אינטימיות כתהליך מדורג",
        description:
          "הבנת שלבי האינטימיות וחשיבות ההדרגתיות. אינטימיות אמיתית נבנית בשלבים - לא קופצים לסוף. הבנת התהליך המדורג ואיך לנוע בו בקצב שנכון לשני הצדדים.",
        order: 0,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 150,
        scriptIndex: "11.1.1",
      },
      {
        title: "36 שאלות להתאהבות - סט 1",
        description:
          "השאלות בסיכון נמוך - פתיחת השיחה. סט ראשון מתוך 36 השאלות של ד\"ר ארתור ארון שהוכחו מחקרית כמקרבות בין אנשים. שאלות נגישות שפותחות שיחה אמיתית.",
        order: 1,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.1.2",
      },
      {
        title: "36 שאלות להתאהבות - סט 2 ו-3",
        description:
          "השאלות בסיכון בינוני וגבוה - העמקת הקשר. הסטים המתקדמים שדורשים יותר אומץ ופגיעות, אבל גם יוצרים חיבור עמוק יותר. איך להשתמש בשאלות בצורה טבעית.",
        order: 2,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.2.1",
      },
      {
        title: "תרגיל המבט - 4 דקות",
        description:
          "הסיום העוצמתי של 36 השאלות. 4 דקות של מבט עיניים - התרגיל שמשלים את 36 השאלות ויוצר חיבור עמוק ומפתיע. תרגיל פשוט שמפיל מחסומים ופותח את הלב.",
        order: 3,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 150,
        scriptIndex: "11.2.2",
      },
      {
        title: "פגיעות כגשר לאינטימיות",
        description:
          "למה לחשוף חולשות הוא המפתח לחיבור אמיתי. פגיעות היא לא חולשה - היא הגשר שמחבר בין שני אנשים. כשנותנים למישהו לראות אותנו באמת, עם כל הפגמים, נוצר חיבור שלא ניתן ליצור בדרך אחרת.",
        order: 4,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.3.1",
      },
      {
        title: "מה הופך את הקשר לייחודי",
        description:
          "לזהות ולטפח את מה שמיוחד רק לכם. כל קשר הוא ייחודי - יש לו את הבדיחות הפנימיות שלו, את הרגעים המשותפים, את השפה המשותפת. איך לזהות ולטפח את מה שהופך את הקשר שלכם למיוחד.",
        order: 5,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 150,
        scriptIndex: "11.3.2",
      },
      {
        title: "פרידה בכבוד - כשזה לא מתאים",
        description:
          "איך להיפרד בצורה נכונה ומכבדת. לא כל קשר מיועד להתפתח. לדעת מתי ואיך לסיים - בכבוד, בהגינות ובלי לפגוע מיותר - זה חלק חשוב מהדרך למציאת הזוגיות הנכונה.",
        order: 6,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.4.1",
      },
    ],
  },

  // =========================================================================
  // PHASE 6: מחויבות (Commitment) - שבוע 12
  // =========================================================================
  {
    title: "שבוע 12: ההחלטה",
    subtitle: "מחויבות, זוגיות רשמית וסיום המסע",
    weekNumber: 12,
    phaseNumber: 6,
    phaseName: PHASES[6].name,
    lessons: [
      {
        title: "מוכנות להתחייבות - איך יודעים",
        description:
          "סימנים שאתם מוכנים לקחת את הצעד הבא. איך יודעים שהגיע הזמן להתחייב? מה הסימנים שאומרים שאתם ושהקשר מוכנים? כלים להערכת מוכנות אמיתית להתחייבות.",
        order: 0,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.1.1",
      },
      {
        title: "20 שאלות לפני שמתחייבים",
        description:
          'השאלות החשובות לפני שאומרים "כן". 20 שאלות שחייבים לשאול - את עצמכם ואת הפרטנר - לפני שמחליטים להתחייב. שאלות שחושפות תאימות אמיתית ומונעות הפתעות בהמשך.',
        order: 1,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.1.2",
      },
      {
        title: "התמודדות עם פחד מהתחייבות",
        description:
          "איך להתנהל מול הפחדים שמלווים את המחויבות. פחד מהתחייבות הוא נורמלי - כמעט כולם חווים אותו. איך מזהים אם זה פחד בריא שכדאי להקשיב לו, או פחד שמעכב אתכם.",
        order: 2,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.2.1",
      },
      {
        title: "איך מתחילים קשר רשמי",
        description:
          "הצעדים המעשיים לתחילת זוגיות. מהדייטים הראשונים לקשר רשמי - מה הצעדים, מתי מגדירים את הקשר, ואיך עושים את המעבר בצורה בריאה וטבעית.",
        order: 3,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.2.2",
      },
      {
        title: "חוקי הזוגיות - מבוא",
        description:
          "עקרונות יסוד לשמירה על זוגיות בריאה. למצוא את הזוגיות זה רק ההתחלה - עכשיו צריך גם לשמור עליה. עקרונות יסוד מחקריים לבניית זוגיות בריאה, מאושרת ויציבה לאורך זמן.",
        order: 4,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.3.1",
      },
      {
        title: "סיכום הקורס - המסע שלך רק מתחיל",
        description:
          "דברי סיכום, השראה והמשך הדרך. 12 שבועות של עבודה, למידה וצמיחה - אבל המסע עוד לא נגמר. הוא רק מתחיל. סיכום של הדרך שעברנו יחד, עם מבט קדימה למה שמחכה.",
        order: 5,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.4.1",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stub courses for future expansion
// ---------------------------------------------------------------------------

const OMANUT_HASICHA_MODULES: SeedModule[] = [
  {
    title: "אומנות השיחה",
    subtitle: "8 שיעורים ליצירת שיחות מעניינות ומשמעותיות",
    weekNumber: 1,
    phaseNumber: 1,
    phaseName: "יסודות",
    lessons: [
      {
        title: "למה שיחות נכשלות",
        description:
          "הסיבות הנפוצות ששיחות הופכות למשעממות או מביכות. נלמד לזהות את הדפוסים שהורגים שיחות ואיך להימנע מהם.",
        order: 0,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.1",
      },
      {
        title: "אנרגיה בשיחה",
        description:
          "איך להביא אנרגיה חיובית לכל שיחה. האנרגיה שלכם קובעת את הטון - נלמד איך לכוון אותה כדי שאנשים ירצו להמשיך לדבר איתכם.",
        order: 1,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.2",
      },
      {
        title: "שאלות שפותחות אנשים",
        description:
          "סוגי השאלות שגורמים לאנשים להיפתח ולשתף. ההבדל בין שאלות שמקרבות לשאלות שמרחיקות, עם דוגמאות מעשיות.",
        order: 2,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.3",
      },
      {
        title: "הקשבה שיוצרת חיבור",
        description:
          "הקשבה שמראה לאדם שמולכם שאתם באמת שם. טכניקות שיקוף, סיכום והעמקה שיגרמו לאנשים להרגיש נשמעים.",
        order: 3,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.4",
      },
      {
        title: "סטוריטלינג - לספר סיפורים שמושכים",
        description:
          "איך לספר סיפורים שגורמים לאנשים להקשיב. נלמד את המבנה של סיפור טוב ואיך לשלב סיפורים בשיחה בצורה טבעית.",
        order: 4,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.5",
      },
      {
        title: "הומור בשיחה",
        description:
          "איך להשתמש בהומור כדי ליצור חיבור. לא צריך להיות סטנד-אפיסט - נלמד סוגי הומור שכל אחד יכול להשתמש בהם.",
        order: 5,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.6",
      },
      {
        title: "נושאים שמעמיקים קשר",
        description:
          "נושאי שיחה שיוצרים חיבור עמוק מעבר לסמול-טוק. איך לעבור משיחת שטח לשיחה משמעותית בלי שזה ירגיש מאולץ.",
        order: 6,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.7",
      },
      {
        title: "תרגול מסכם - שיחה מושלמת",
        description:
          "שילוב כל הכלים לשיחה מלאה. תרגיל מעשי לשלב את כל מה שלמדנו - פתיחה, שאלות, הקשבה, סיפורים והומור - לשיחה אחת מחברת.",
        order: 7,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "יסודות",
        duration: 600,
        scriptIndex: "S.1.8",
      },
    ],
  },
];

const PROFILE_MENATZEACH_MODULES: SeedModule[] = [
  {
    title: "פרופיל מנצח",
    subtitle: "5 שיעורים לבניית פרופיל היכרויות שמושך",
    weekNumber: 1,
    phaseNumber: 1,
    phaseName: "בנייה",
    lessons: [
      {
        title: "מה הופך פרופיל למנצח",
        description:
          "ניתוח של פרופילים שעובדים ופרופילים שלא. מה גורם לאנשים לעצור ולקרוא, ומה גורם להם להחליק הלאה תוך שנייה.",
        order: 0,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "בנייה",
        duration: 720,
        scriptIndex: "P.1.1",
      },
      {
        title: "תמונות שעוצרות גלילה",
        description:
          "איך לבחור ולצלם תמונות שמציגות אתכם בצורה הטובה ביותר. מהתמונה הראשית ועד תמונות משניות - הכל חשוב.",
        order: 1,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "בנייה",
        duration: 720,
        scriptIndex: "P.1.2",
      },
      {
        title: "כתיבת ביו שמושכת",
        description:
          "נוסחה לכתיבת טקסט פרופיל שמראה מי אתם באמת. איך להיות אותנטיים, מעניינים ומזמינים - בכמה שורות.",
        order: 2,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "בנייה",
        duration: 720,
        scriptIndex: "P.1.3",
      },
      {
        title: "טעויות קלאסיות בפרופילים",
        description:
          "הטעויות שרוב האנשים עושים בפרופיל ההיכרויות שלהם. מתמונות גרועות ועד טקסטים שמרחיקים - נלמד מה לא לעשות.",
        order: 3,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "בנייה",
        duration: 720,
        scriptIndex: "P.1.4",
      },
      {
        title: "אופטימיזציה ותחזוקת פרופיל",
        description:
          "איך לשפר את הפרופיל לאורך זמן על בסיס תוצאות. מתי לעדכן תמונות, איך לבדוק מה עובד, ואיך לשמור על הפרופיל רלוונטי.",
        order: 4,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "בנייה",
        duration: 720,
        scriptIndex: "P.1.5",
      },
    ],
  },
];

const SIMULATOR_DATIM_MODULES: SeedModule[] = [
  {
    title: "סימולטור דייטים",
    subtitle: "4 שיעורים שמכינים אתכם לכל מצב בדייט",
    weekNumber: 1,
    phaseNumber: 1,
    phaseName: "הכנה",
    lessons: [
      {
        title: "הדקות הראשונות",
        description:
          "איך להתחיל דייט בצורה שיוצרת רושם חיובי. מהרגע שנכנסים לבית הקפה ועד השיחה הראשונה - כל שנייה חשובה.",
        order: 0,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "הכנה",
        duration: 900,
        scriptIndex: "D.1.1",
      },
      {
        title: "מצבים מביכים - מה עושים?",
        description:
          "תרחישים של מבוכה בדייט ואיך להתמודד איתם. שתיקה מוזרה, שאלה לא נעימה, דעה שונה - כלים להפוך כל מצב לטובתכם.",
        order: 1,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "הכנה",
        duration: 900,
        scriptIndex: "D.1.2",
      },
      {
        title: 'סימנים שזה "כן" וסימנים שזה "לא"',
        description:
          "איך לקרוא את הסימנים במהלך דייט. שפת גוף, עניין, יוזמה - נלמד לזהות את הסימנים שאומרים אם יש פוטנציאל או לא.",
        order: 2,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "הכנה",
        duration: 900,
        scriptIndex: "D.1.3",
      },
      {
        title: "הסיום המושלם",
        description:
          "איך לסיים דייט - בין אם רוצים עוד ובין אם לא. כלים לסיום חיובי שמשאיר את הדלת פתוחה, או סיום מכובד כשמרגישים שזה לא מתאים.",
        order: 3,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: "הכנה",
        duration: 900,
        scriptIndex: "D.1.4",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Exported course data
// ---------------------------------------------------------------------------

export const SEED_COURSES: SeedCourse[] = [
  {
    title: "הדרך - אומנות הקשר",
    description:
      "תוכנית מקיפה בת 12 שבועות למציאת זוגיות משמעותית. מהעבודה הפנימית ועד ליצירת חיבור אמיתי - תהליך מובנה ומוכח שמלווה אתכם צעד אחרי צעד. 73 שיעורי וידאו, תרגילים מעשיים, ותמיכה קהילתית.",
    category: "זוגיות",
    level: "beginner",
    estimatedHours: 24,
    order: 0,
    published: true,
    modules: HADERECH_MODULES,
  },
  {
    title: "אומנות השיחה",
    description:
      "קורס קצר ומרוכז ליצירת שיחות מעניינות ומשמעותיות. 8 שיעורים שילמדו אתכם איך לפתוח שיחה, לשמור על עניין, ולגרום לאנשים לרצות עוד. מיועד לכל מי שרוצה לשפר את כישורי התקשורת שלו.",
    category: "תקשורת",
    level: "beginner",
    estimatedHours: 5,
    order: 1,
    published: false,
    modules: OMANUT_HASICHA_MODULES,
  },
  {
    title: "פרופיל מנצח",
    description:
      "5 שיעורים מעשיים לבניית פרופיל היכרויות שמושך. מתמונות ועד טקסט - כל מה שצריך כדי להפוך את הפרופיל שלכם ממשהו שמדלגים עליו למשהו שעוצר גלילה.",
    category: "היכרויות",
    level: "beginner",
    estimatedHours: 3,
    order: 2,
    published: false,
    modules: PROFILE_MENATZEACH_MODULES,
  },
  {
    title: "סימולטור דייטים",
    description:
      "קורס מבוא מעשי שמכין אתכם לכל מצב שאפשר לפגוש בדייט. מהדקות הראשונות ועד הסיום - 4 שיעורים שיגרמו לכם להרגיש מוכנים ובטוחים.",
    category: "דייטים",
    level: "beginner",
    estimatedHours: 2,
    order: 3,
    published: false,
    modules: SIMULATOR_DATIM_MODULES,
  },
];

// ---------------------------------------------------------------------------
// Utility: flatten all lessons from a course
// ---------------------------------------------------------------------------

export function flattenLessons(course: SeedCourse): SeedLesson[] {
  return course.modules.flatMap((mod) => mod.lessons);
}

/**
 * Total lesson count for a course
 */
export function lessonCount(course: SeedCourse): number {
  return course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
}

/**
 * Get the total duration in minutes for a course
 */
export function totalDurationMinutes(course: SeedCourse): number {
  const totalSeconds = course.modules.reduce(
    (sum, mod) =>
      sum + mod.lessons.reduce((s, l) => s + l.duration, 0),
    0
  );
  return Math.round(totalSeconds / 60);
}

// ---------------------------------------------------------------------------
// Summary (for verification)
// ---------------------------------------------------------------------------
// Course 1: "הדרך - אומנות הקשר"
//   - 12 modules (weeks), 73 lessons
//   - Phase 1 (גישה): Weeks 1-3 = 22 lessons
//   - Phase 2 (תקשורת): Weeks 4-5 = 13 lessons
//   - Phase 3 (מעבר ומשיכה): Weeks 6-9 = 21 lessons
//   - Phase 4 (חיבור וכימיה): Weeks 10-11 = 11 lessons
//   - Phase 5 (מחויבות): Week 12 = 6 lessons
//   Total: 8+6+8+7+6+6+5+5+5+4+7+6 = 73 lessons
//
// Course 2: "אומנות השיחה" - 8 lessons (stub)
// Course 3: "פרופיל מנצח" - 5 lessons (stub)
// Course 4: "סימולטור דייטים" - 4 lessons (stub)
