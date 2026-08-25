/**
 * Seed Course Data - HaDerech Learning Platform
 *
 * Metadata for the current "הדרך" course placement in the LMS.
 * 75 progress-bearing lessons plus one optional practice, organized into 12 weeks across 6 phases, with 8 linked
 * practice PDFs. Learner-facing lesson text is generated separately from the
 * canonical Git manifest; this file does not establish research or outcome proof.
 *
 * Mapping source: ../omanut-hakesher-course/content/course-content-manifest.json
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
  /** Stable identity from the canonical course manifest */
  contentKey?: string;
  learnerAvailability?: "required" | "optional";
  completionAffectsProgress?: boolean;
  assessmentOrScoring?: boolean;
  personalDisclosureRequired?: boolean;
  relationshipOrPartnerRequired?: boolean;
  learnerAlternatives?: string[];
  /** Filename of an accompanying PDF resource (optional) */
  pdfUrl?: string;
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
  /** Estimated total hours, only when a reviewed estimate exists */
  estimatedHours?: number;
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
          "ברכת פתיחה ומה מחכה לכם בתוכנית. ב-12 השבועות הקרובים נעבור יחד תהליך מובנה לתרגול ולהתבוננות - מהעבודה הפנימית ועד לתקשורת וחיבור. אפשר להתחיל בשאלון ההיכרות, לדלג עליו או לחזור אליו בהמשך.",
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
          "התבוננות במה שאפשר ללמוד מחלק מהמצבים המאתגרים, בלי להניח שכל קושי הוא רצוי או שחייבים להישאר בו. אפשר לבחור קצב מתאים, לעצור או לבקש תמיכה; בטיחות קודמת לתרגול.",
        order: 1,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 120,
        scriptIndex: "1.1.2",
      },
      {
        title: "עקרון רואן - פעולה לצד שיקול דעת",
        description:
          "סיפור איגרת לגרסיה כנקודת מוצא לשיחה על יוזמה. המטרה היא להבחין בין שאלות שמקדמות בהירות לבין הימנעות, ולבחור צעד קטן שאינו עוקף שיקול דעת, בטיחות, הסכמה או תשובה שלילית.",
        order: 2,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.2.1",
      },
      {
        title: "אחריות אישית בלי אשמה",
        description:
          "הבחנה בין מה שנמצא בשליטתנו לבין נסיבות, מערכות ומעשים של אנשים אחרים. אחריות אישית יכולה להתמקד בבחירות ובתגובה שלנו; היא אינה אשמה בנזק שנגרם לנו ואינה מבטלת אחריות של אחרים.",
        order: 3,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.2.2",
      },
      {
        title: "בחירה בהפסקה מדייטים",
        description:
          "בדיקה אם הפסקה זמנית מהיכרויות יכולה לפנות מקום למנוחה או להתבוננות. ההפסקה אינה חובה, אין לה משך נכון אחד והיא אינה תנאי להצלחה; אפשר לבחור להמשיך להכיר אנשים או לעצור בהתאם לצרכים ולנסיבות.",
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
          "תרגיל רפלקציה אופציונלי על כיוונים רצויים בשמונה תחומי חיים, ובהם קשרים, בריאות, עבודה והתפתחות. חזון אינו גורם לאדם מתאים להגיע ואינו חוזה עתיד; אפשר לבחור רק תחומים שרלוונטיים כרגע ולעדכן אותם בהמשך.",
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
        title: "מסמך כוונה אישי - בחירה ולא הבטחה",
        description:
          "מסמך תרגול אופציונלי להגדרת כוונה, זמן וגבולות ללמידה. אי אפשר להתחייב לתוצאה זוגית או לשלוט בבחירות של אדם אחר; אין חובה להוריד, למלא, לחתום או לשתף את המסמך.",
        order: 7,
        weekNumber: 1,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "1.5.1",
        pdfUrl: "מסמך_כוונה_אישי.pdf",
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
          'זיהוי פרשנויות חוזרות על עצמנו, על אנשים אחרים ועל קשרים, למשל "אני לא מספיק" או "כולם רוצים רק...". לא מניחים מראש שכל מחשבה שגויה: מפרידים בין עובדה, פרשנות ותחזית ובודקים ראיות, הקשר והשפעה.',
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
          "תרגיל לבניית פרשנות מאוזנת ומבוססת יותר לצד סיפור מכאיב. אין צורך להחליף מחשבה קשה בסיסמה חיובית; אפשר לנסח אפשרויות, לזהות מה עדיין לא ידוע ולבחור צעד קטן שנמצא בשליטתכם.",
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
          "בדיקה של אמונות לפי הראיות, ההקשר וההשפעה שלהן על הבחירות שלנו. לא כל אמונה היא רק עניין של בחירה, ואין צורך להתעלם מעובדות או מחוויה קשה; המטרה היא להחזיק ניסוח מדויק וגמיש יותר.",
        order: 2,
        weekNumber: 2,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "2.2.1",
      },
      {
        title: "תרגול אמונות - בקצב שמתאים",
        description:
          "תרגיל אופציונלי לחזרה על ניסוח מאוזן ולבדיקה כיצד הוא משפיע לאורך זמן. אין תדירות קסם, וכל קריאה אינה הוכחה לשינוי מוחי מסוים; אפשר לבחור תזכורת שמתאימה או לדלג על התרגיל.",
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
          'התבוננות במחשבות שחוזרות במהירות ובפרשנויות שעלולות לסתור זו את זו, למשל "מי שאני רוצה לא רוצה אותי" לצד "כשמישהו רוצה אותי אני מאבד/ת עניין". זיהוי עשוי לעזור, אך שינוי דפוס יכול להיות הדרגתי ולעיתים מצריך תמיכה.',
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
          "סיכום הכלים שנדונו השבוע: הפרדה בין עובדות לפרשנות, ניסוח חלופות מאוזנות, בדיקת אמונות וזיהוי דפוסים אוטומטיים. אפשר לבחור כלי אחד לבדיקה, בלי להניח שמחשבה לבדה קובעת את החיים או את תוצאת הקשר.",
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
    title: "שבוע 3: פחדים, גבולות וחמלה עצמית",
    subtitle: "להבחין, להציב גבול ולבחור תגובה תומכת",
    weekNumber: 3,
    phaseNumber: 1,
    phaseName: PHASES[1].name,
    lessons: [
      {
        title: "פחד וההתמודדות איתו",
        description:
          "להתבונן בפחד בלי להפוך אותו לאויב או למצפן יחיד. נבדיל בין עובדות, פרשנות, צורך, גבול ואילוץ ממשי, ונבחן איזו תגובה מתאימה עכשיו — פעולה, מידע, תמיכה, זמן או עצירה.",
        order: 0,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.1.1",
      },
      {
        title: "פחדים ואילוצים סביב זוגיות",
        description:
          "רשימת רפלקציה על פחדים אפשריים, מדחייה ועד אובדן עצמאות. זו אינה רשימה מקיפה, אבחון או הסבר יחיד לקושי, וזיהוי לבדו אינו פתרון. אפשר לדלג על סעיף, לבחור קצב בטוח ולפנות לתמיכה כשצריך.",
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
          "תרגול בהגדרת מה מתאים ומה לא ובתקשור גבול ברור. גבול אינו הבטחה שהצד השני יכבד אותו או שהקשר יהיה בטוח; מותר להתרחק, להפסיק שיחה או לבקש עזרה בלי לנהל משא ומתן על בטיחות.",
        order: 2,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.2.1",
      },
      {
        title: "לומר לא ולבקש בבירור",
        description:
          "כמה דרכים קצרות ונגישות להציב גבול, לבקש שינוי, לקחת זמן או לסיים שיחה. אין מכסת תרגול ואין חובה להסביר; במצב של לחץ, איום או פחד בטיחות קודמת לניסוח מושלם.",
        order: 3,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.2.2",
      },
      {
        title: "חמלה עצמית - יחס שאפשר לתרגל",
        description:
          "רעיונות לתרגול יחס מדויק ותומך כלפי עצמכם, בלי להפוך חמלה עצמית לתנאי לזוגיות. דף הכתיבה הנלווה הוא אופציונלי, פרטי ואינו מיועד לשליחה; אין חובה לסלוח, לברך או לתאר פגיעה.",
        order: 4,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.3.1",
        pdfUrl: "דף_חמלה_עצמית.pdf",
      },
      {
        title: "שיתוף ופרטיות - בחירה הדרגתית",
        description:
          "בחינה של שיתוף אישי לצד הזכות לפרטיות. שיתוף יכול לתמוך בקרבה כשהוא רצוני, הדדי ומתאים להקשר, אך הוא אינו חובה או מבחן לאומץ; מותר לדלג, להציב גבול או לעצור בכל שלב.",
        order: 5,
        weekNumber: 3,
        phaseNumber: 1,
        phaseName: PHASES[1].name,
        duration: 150,
        scriptIndex: "3.3.2",
      },
      {
        title: "שגרות אישיות - בוקר וערב",
        description:
          "אפשרויות קצרות לפתיחה או לסיום של היום, כגון תכנון, מנוחה או רפלקציה. אין שגרה אחת שמתאימה לכולם ואין הבטחה לתוצאה; אפשר להתאים לצרכים, ליכולת וללוח הזמנים או לוותר.",
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
          "תרגיל היכרות עצמית סביב חוזקות, ערכים והעדפות בקשרים. אין צורך להגיע להבנה מלאה של עצמכם לפני היכרות עם אדם אחר, והתשובות יכולות להשתנות עם הזמן והניסיון.",
        order: 0,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.1.1",
      },
      {
        title: "מסגרת של ארבעה סגנונות",
        description:
          "היכרות ביקורתית עם מסגרת שמחלקת דפוסים לארבעה סגנונות לצורך שיחה ורפלקציה. היא אינה אבחון, אינה ממצה אישיות ואינה מזהה איזה אדם ישלים אתכם או ינבא התאמה.",
        order: 1,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.1.2",
      },
      {
        title: "אילו דפוסים אני מזהה?",
        description:
          "שאלון רפלקציה על דפוסים והעדפות, לא מבחן אישיות או אבחון. אפשר לבחור יותר מתשובה אחת, לדלג ולעדכן את התמונה עם הזמן; התוצאה אינה קובעת מה תביאו לקשר או מה אתם חייבים לקבל.",
        order: 2,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.2.1",
      },
      {
        title: "מה מתאים לי להרגיש ולבדוק",
        description:
          "התבוננות ברגשות, בתחושות גוף, בעובדות ובקצב שמתאים לכם בזמן היכרות. אין הרגשה אחת 'נכונה', והתרגשות או נוחות אינן הוכחה להתאמה, להסכמה או לבטיחות.",
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
          "בניית רשימה גמישה של ערכים, צרכים, העדפות וגבולות לצורך רפלקציה. הרשימה אינה מדרגת בני אדם ואינה מבטיחה לזהות התאמה; אפשר להבחין בין גבולות בטיחותיים לבין העדפות ולעדכן אותה עם הזמן.",
        order: 4,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.3.1",
      },
      {
        title: "5 בדיקות לרשימת העדפות",
        description:
          "חמש שאלות לבדיקה כאשר רשימת העדפות נעשית קשיחה או רחבה מדי. המטרה אינה לשכנע להתפשר על גבול, בטיחות או ערך חשוב, אלא להבחין בין צורך, העדפה והנחה שראוי לבדוק.",
        order: 5,
        weekNumber: 4,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "4.3.2",
      },
      {
        title: "סיכום תקופת ההתבוננות",
        description:
          "סיכום של מה שנבדק בתקופה האחרונה ובחירה אם להמשיך להתבונן, לחזור להיכרויות או לבחור כיוון אחר. אין חובה לעצור לשלושים יום או לחזור לדייטים בנקודה מסוימת.",
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
          "בירור צרכים אפשריים לצד רגשות, עובדות, הקשר ותחושות גוף. אין התאמה קבועה שלפיה מאחורי כל רגש מסתתר צורך אחד; אפשר להציע השערה, לבדוק אותה ולנסח בקשה שאפשר גם לסרב לה.",
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
          "התבוננות בנתינה, בקבלה וביכולת לבקש לאורך זמן, בלי לדרוש סימטריה בכל רגע. הדדיות אינה סיבה להישאר בקשר פוגעני ואינה הופכת אחריות לנזק לשווה; בטיחות וגבולות קודמים לאיזון.",
        order: 2,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.2.1",
      },
      {
        title: "ניהול קונפליקטים - תקשורת מקרבת (NVC)",
        description:
          "מסגרת התצפית, הרגש, הצורך והבקשה המזוהה עם NVC, כאפשרות אחת לארגון שיחה. היא אינה נוסחה שמבטיחה למנוע האשמה או לפתור קונפליקט, ואינה מיועדת למשא ומתן על אלימות, כפייה או בטיחות.",
        order: 3,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 300,
        scriptIndex: "5.2.2",
        pdfUrl: "דף_תרגול_NVC.pdf",
      },
      {
        title: "העדפות חיבה — אוצר מילים לשיחה",
        description:
          "המודל הפופולרי של גארי צ'פמן כאוצר מילים לשיחה על העדפות, לא כאבחון, סוג קבוע או מבחן התאמה. העדפות יכולות להשתנות; מגע פיזי דורש הסכמה עדכנית בכל פעם, ואין דרך אחת שמבטיחה חיבור.",
        order: 4,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 180,
        scriptIndex: "5.3.1",
        pdfUrl: "מפת_העדפות_חיבה.pdf",
      },
      {
        title: "לבחור אם לקבל — תרגול רשות",
        description:
          "תרגול אופציונלי על קבלה וסירוב: אפשר לעבוד עם תרחיש בדיוני, לבחור חלופת כתיבה פרטית או לדלג. אין צורך בחשיפה אישית, באדם נוסף או בקשר, והתרגול אינו משפיע על ההתקדמות ואינו מקבל ציון.",
        order: 5,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 90,
        scriptIndex: "5.3.2",
        contentKey: "oh.course.lesson.receiving-practice",
        learnerAvailability: "optional",
        completionAffectsProgress: false,
        assessmentOrScoring: false,
        personalDisclosureRequired: false,
        relationshipOrPartnerRequired: false,
        learnerAlternatives: ["written-fictional", "private-written", "skip"],
      },
      {
        title: "התנהגויות שעשויות לצמצם זמינות",
        description:
          "בחינה של הרגלים, עומס, קשרי עבר וגבולות שעשויים להשפיע על הרצון או היכולת להכיר כרגע. זו אינה אבחנה או הבטחה ששינוי התנהגות יוביל לזוגיות; גם בחירה לא להיות זמינים היא לגיטימית.",
        order: 6,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.4.1",
      },
      {
        title: "סיכום שלב התקשורת",
        description:
          "סיכום שבועות 4-5: הכרת עצמנו, רגשות, צרכים, המודל הפופולרי של שפות אהבה והדדיות. אפשר לבחור מה להמשיך לתרגל ובאיזה קצב; אין חובה לצאת להיכרויות או לבצע משימת חשיפה כדי להתקדם בקורס.",
        order: 7,
        weekNumber: 5,
        phaseNumber: 2,
        phaseName: PHASES[2].name,
        duration: 150,
        scriptIndex: "5.5.1",
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
          "מעבר אפשרי מרפלקציה לצעד מעשי שנבחר מראש ומתאים ליכולת, להקשר ולבטיחות. אין הנחה שכולם מרגישים מוכנים אחרי חמישה שבועות, ואפשר להמשיך להתבונן, לדלג או לבחור תרגול שאינו כולל אדם אחר.",
        order: 0,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.1.1",
      },
      {
        title: "רושם ראשוני בהקשר",
        description:
          "התבוננות באופן שבו הקשר, תרבות, נגישות, מצב רוח ומידע חלקי עשויים להשפיע על התרשמות ראשונית. אין חלון זמן קבוע ואין שליטה מלאה באופן שבו אדם אחר יפרש אותנו.",
        order: 1,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.1.2",
      },
      {
        title: "הופעה אישית לפי בחירה",
        description:
          "אפשרויות לטיפוח, לבוש ונוחות לקראת מפגש, בלי לקבוע תקן משיכה או מראה נכון. התאמות נגישות, תרבות, תקציב, גוף וזהות משתנים בין אנשים; כל סעיף הוא בחירה ולא חובה.",
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
          "תרגיל תנועה אופציונלי לבדיקת נוחות ונוכחות, אם הוא מתאים לגוף וליכולת. יציבה אינה מדד לביטחון, כנות או משיכה, ואין צורך לבצע את התרגיל מדי יום או בכלל.",
        order: 3,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 120,
        scriptIndex: "6.2.2",
      },
      {
        title: "נוכחות ואופן תקשורת",
        description:
          "בדיקה של קצב, טון, סקרנות וגבולות בשיחה, בלי לדרוש חיוביות או זמינות מתמדת. אופן תקשורת אינו גורם לאנשים להימשך ואינו מבטל העדפות, הקשר או בחירה של הצד השני.",
        order: 4,
        weekNumber: 6,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "6.3.1",
      },
      {
        title: "מתכנון לצעד בטוח",
        description:
          "בחירת צעד קטן ומוגדר כאשר פעולה מתאימה, לצד האפשרות להמשיך לתכנן או לא לפעול כרגע. יוזמה אינה עוקפת הסכמה, תשובה שלילית, היעדר מענה או תחושת חוסר ביטחון.",
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
          "שמונה אפשרויות לתרגול בחירה מול חשש, בלי להגדיר אומץ כחובה לפעול. אפשר לבחור תרגיל קטן, לשנות אותו או לדלג; אין צורך להתקרב לזר, לחשוף מידע או להישאר במצב לא בטוח.",
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
          "כלים לעיבוד ביקורת או דחייה ולבחירת הצעד הבא בלי להפוך דחייה לכישלון אישי. תשובה שלילית או היעדר מענה אינם הזמנה לשכנע, לנסות ערוץ אחר או להמשיך לפנות.",
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
          "מסגרת רפלקציה על היבטים פיזיים, אישיותיים וערכיים שעשויים להיות חלק מחוויית משיכה. זו אינה נוסחה, היררכיה או דרך לשלוט במשיכה של אדם אחר, והעדפות משתנות בין אנשים ובהקשרים שונים.",
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
          "היכרות עם המושג הפסיכולוגי שמתאר נטייה אפשרית להעריך ביתר כמה אחרים מבחינים בנו. זו אינה אמת על כל מצב ואינה מבטיחה להפחית לחץ; אפשר להשתמש בה כהשערה ולבדוק מה עוזר בפועל.",
        order: 3,
        weekNumber: 7,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 150,
        scriptIndex: "7.2.2",
      },
      {
        title: "6 אפשרויות לתרגול אומץ",
        description:
          "שישה רעיונות אופציונליים לתרגול בחירה ובקשת עזרה בקצב מתאים. אין חובה לתרגל מדי יום, לפנות לזר, ליצור קשר עין, לחשוף מידע אישי או לבצע פעולה שמרגישה לא בטוחה.",
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
        title: "תמונת פרופיל - 7 נקודות לבדיקה",
        description:
          "שבע נקודות אופציונליות לבחירת תמונה ברורה ועדכנית שמרגישה לכם מייצגת. אין זמן קסם, תמונה 'מנצחת' או עיקרון שמבטיח תשומת לב, התאמה או תגובה; נגישות, פרטיות והעדפה אישית קודמות לכל כלל צילום.",
        order: 0,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 360,
        scriptIndex: "8.1.1",
      },
      {
        title: "טקסט בפרופיל - בהירות ואותנטיות",
        description:
          "אפשרויות לכתיבת טקסט קצר, ברור וספציפי על תחומי עניין והכוונה שלכם. אין נוסחה שמייצרת חיבור או תגובה, ואין חובה להשתמש בהומור, לחשוף מידע אישי או להציג גרסה 'מושכת' של עצמכם.",
        order: 1,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 330,
        scriptIndex: "8.1.2",
      },
      {
        title: "התכתבויות ורשתות חברתיות",
        description:
          "עקרונות להתכתבות ברורה, הדדית ושומרת פרטיות. פגישה אינה המטרה המחייבת של כל שיחה ואין לוח זמנים נכון לשליחה או מעבר למפגש; תשובה שלילית או היעדר מענה מכובדים ועוצרים את הפנייה.",
        order: 2,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 390,
        scriptIndex: "8.2.1",
      },
      {
        title: "מפגש ראשון - מהאונליין לאמת",
        description:
          "אפשרויות להצעת מפגש בלי לחץ ולבחירת מקום ציבורי, נגיש ונוח לשני הצדדים, עם דרך הגעה וחזרה עצמאית. אין חובה להיפגש, להמשיך מפגש לא נעים או לתת הזדמנות נוספת; אפשר לשתף אדם קרוב בפרטים ולצאת בכל רגע.",
        order: 3,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 330,
        scriptIndex: "8.2.2",
      },
      {
        title: "סיכום יומי ושבועי",
        description:
          "רפלקציה יומית או שבועית אופציונלית על עובדות, תחושות, גבולות ומה תרצו לעשות אחרת. מדידה אינה מבטיחה שיפור, ואין צורך לתעד פרטים מזהים או אינטימיים על אדם אחר.",
        order: 4,
        weekNumber: 8,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 360,
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
          "בדיקת מיקום, נגישות, לבוש נוח, תחבורה וגבולות לקראת מפגש. אין מקום, הופעה או מצב רגשי נכונים לכולם; עדיף לבחור יחד מקום ציבורי שמאפשר שיחה ויציאה עצמאית ולהתאים לצרכים בפועל.",
        order: 0,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 420,
        scriptIndex: "9.1.1",
      },
      {
        title: "10 הצעות לשיחה בדייט",
        description:
          "עשר הצעות שאפשר להתאים לשיחה, כגון שאלות פתוחות, הקשבה ושיתוף הדדי. הן אינן כללים מבוססי תוצאה ואינן מבטיחות זרימה או חיבור; שתיקה, קשר עין וסגנון תקשורת משתנים בין אנשים.",
        order: 1,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 480,
        scriptIndex: "9.1.2",
      },
      {
        title: "שאלות מעולות לדייטים",
        description:
          "מאגר שאלות אופציונלי לשיחה, משאלות קלות ועד שאלות אישיות יותר. שאלה אינה יוצרת חיבור או מקנה זכות לחשיפה; מבקשים רשות לפני נושא רגיש, מאפשרים לדלג ועוברים נושא או עוצרים בלי לדרוש הסבר.",
        order: 2,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 390,
        scriptIndex: "9.2.1",
      },
      {
        title: "אחרי הדייט - מה עכשיו?",
        description:
          "אפשרויות לרפלקציה ולמסר ברור אחרי מפגש, בלי כללי המתנה או טקטיקות זמינות. אם רוצים המשך אפשר להציע פעם אחת; תשובה שלילית או היעדר תשובה אינם הזמנה לשכנע, לפנות מערוץ אחר או להמשיך לשלוח הודעות.",
        order: 3,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 360,
        scriptIndex: "9.2.2",
      },
      {
        title: "רפלקציה אחרי דייט — מה קרה ומה מתאים לי",
        description:
          "תבנית פרטית ואופציונלית לתיעוד עובדות, תחושות, גבולות ושאלות להמשך. היא אינה מיועדת לדרג או לאבחן את האדם האחר, ואין לשמור בה מידע מזהה או אינטימי שאינו נחוץ.",
        order: 4,
        weekNumber: 9,
        phaseNumber: 3,
        phaseName: PHASES[3].name,
        duration: 330,
        scriptIndex: "9.3.1",
        pdfUrl: "תבנית_רפלקציה_אחרי_דייט.pdf",
      },
    ],
  },

  // =========================================================================
  // PHASE 4: חיבור וכימיה (Connection & Chemistry) - שבוע 10
  // =========================================================================
  {
    title: "שבוע 10: כימיה והקשבה",
    subtitle: "הבנת כימיה ויצירת חיבור עמוק",
    weekNumber: 10,
    phaseNumber: 4,
    phaseName: PHASES[4].name,
    lessons: [
      {
        title: "כימיה וחיבור — תחושה, הקשר ובחירה",
        description:
          "התבוננות מעשית בחוויה שאנחנו מכנים כימיה: משיכה, נוחות, סקרנות, עוררות והקשר. אין כאן מדד מדעי שמכריע אם הכימיה 'אמיתית', והיא אינה הוכחה להתאמה או לבטיחות. 'מפת החיבור האישית' היא תרגיל רפלקציה אופציונלי על חוויות מדייטים קודמים.",
        order: 0,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 420,
        scriptIndex: "10.1.1",
        pdfUrl: "מפת_חיבור_אישית.pdf",
      },
      {
        title: "מיתוסים על כימיה - מה עושה ומה לא עושה",
        description:
          "בחינה ביקורתית של כמה הנחות נפוצות על כימיה, למשל שהיא חייבת להיות מיידית או שהיא מוכיחה התאמה. אין תשובה אחת לגבי המשך היכרות, ואין חובה לתת דייט נוסף; בודקים רצון, גבולות, בטיחות והקשר.",
        order: 1,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 390,
        scriptIndex: "10.1.2",
      },
      {
        title: "דיוק החיפוש - 2-3 תכונות קריטיות",
        description:
          "תרגיל אופציונלי לזיהוי מספר קטן של ערכים, צרכים או גבולות שחשוב לבדוק. הוא אינו קובע אילו העדפות 'לא נכונות', אינו מסווג אדם כמתאים ואינו מחייב להתפשר על בטיחות או רצון.",
        order: 2,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 360,
        scriptIndex: "10.2.1",
      },
      {
        title: "הקשבה פעילה - אבני הבניין",
        description:
          "תרגול הקשבה, שיקוף ובדיקת הבנה כאפשרויות לתמיכה בשיחה. הקשבה אינה מבטיחה אמון, קרבה או כימיה, ואין סגנון אחד או 'רמה עליונה' שמתאימים לכולם; קשר עין ותנועתיות אינם מדדי הקשבה.",
        order: 3,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 390,
        scriptIndex: "10.2.2",
      },
      {
        title: "יצירת הזדמנויות לחיבור",
        description:
          "רעיונות לפעילויות או שיחות ששני הצדדים יכולים לבחור יחד, בלי להציג אותן כמנגנון ליצירת כימיה. מתאימים את הפעילות לנגישות, לפרטיות, לבטיחות ולרצון העדכני, ומותר לעצור או לבחור שלא להשתתף.",
        order: 4,
        weekNumber: 10,
        phaseNumber: 4,
        phaseName: PHASES[4].name,
        duration: 360,
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
          "התבוננות בקרבה כתהליך שיכול להתפתח בקצבים ובסדרים שונים. אין מסלול אוניברסלי או 'סוף' שחייבים להגיע אליו; כל שיתוף, מגע או מעבר דורשים רצון והסכמה עדכניים, ומותר להאט או לעצור.",
        order: 0,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 150,
        scriptIndex: "11.1.1",
      },
      {
        title: "36 שאלות לקרבה - סט 1",
        description:
          "סט ראשון מתוך פרוטוקול מחקרי של 36 שאלות שנועד לבחון יצירת קרבה בין-אישית בתנאים מסוימים. השאלות אינן גורמות להתאהבות ואינן מתאימות לכל אדם או שלב בקשר. בוחרים יחד, ומותר לדלג או לעצור בלי להסביר.",
        order: 1,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.1.2",
      },
      {
        title: "36 שאלות לקרבה - סטים 2 ו-3",
        description:
          "שאלות אישיות יותר מתוך הפרוטוקול המחקרי, לשימוש אופציונלי ובהסכמה. חשיפה רבה יותר אינה אמיצה או טובה יותר ואינה מבטיחה חיבור; אפשר לבחור שאלה, לדלג, לשנות נושא או לעצור בלי להסביר.",
        order: 2,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 180,
        scriptIndex: "11.2.1",
      },
      {
        title: "תרגיל מבט אופציונלי",
        description:
          "אפשרות אחת, ורק בהסכמה הדדית, לסיים את תרגיל השאלות. אין חובה להגיע לארבע דקות, לשמור קשר עין או לבצע את התרגיל. אפשר להסתכל הצידה, לדבר, לבחור חלופה או לעצור בכל רגע.",
        order: 3,
        weekNumber: 11,
        phaseNumber: 5,
        phaseName: PHASES[5].name,
        duration: 150,
        scriptIndex: "11.2.2",
      },
      {
        title: "שיתוף רצוני וגבולות",
        description:
          "בחינה של שיתוף אישי לצד פרטיות, הדדיות והקשר. אין חובה לחשוף חולשה כדי להוכיח אותנטיות או ליצור אינטימיות; אפשר לשתף מעט, לבקש זמן, להציב גבול או לא לשתף כלל.",
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
          "אפשרויות למסירת החלטה ברורה ולשמירה על גבולות כאשר קשר אינו מתאים. אין דרך אחת נכונה, ואין חובה להיפרד פנים אל פנים או להמשיך שיחה כאשר יש חשש לבטיחות; אפשר לבחור מרחק, תמיכה או ערוץ בטוח.",
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
          "שאלות לרפלקציה ולשיחה הדדית על רצון, קצב, גבולות וציפיות. אין רשימת סימנים שמוכיחה מוכנות, ואין צורך להתקדם משום שעבר זמן מסוים או מפני שהצד השני מצפה לכך.",
        order: 0,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.1.1",
      },
      {
        title: "20 נושאים אפשריים לשיחה לפני מחויבות",
        description:
          "מאגר אופציונלי לשיחה על ערכים, גבולות, כסף, משפחה ותוכניות, לפי הרלוונטיות וההסכמה. אין חובה לענות על הכול, והשאלות אינן חושפות 'תאימות אמיתית' או מונעות אי-ודאות והפתעות.",
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
          "בירור חששות שעשויים לעלות סביב מחויבות, בלי להניח שכמעט כולם חווים אותם או שהחשש הוא חסם שצריך להתגבר עליו. בודקים גם חוסר רצון, פערים, סימני אזהרה ובטיחות לפני כל החלטה.",
        order: 2,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.2.1",
      },
      {
        title: "שיחת הגדרת קשר — בקשה לבהירות ובחירה",
        description:
          "אפשרויות לשיחה ברורה והדדית על הגדרת הקשר, בלי לוח זמנים או מסלול מחייב. התסריט המצורף הוא נקודת פתיחה שאפשר להתאים; כל צד רשאי לבקש זמן, לא להסכים או לבחור שלא להמשיך.",
        order: 3,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.2.2",
        pdfUrl: "נוסחים_לשיחת_הגדרת_קשר.pdf",
      },
      {
        title: "עקרונות לשיחה על קשר",
        description:
          "רעיונות לשיחה על תקשורת, גבולות, תיקון וציפיות לאורך קשר. אלה אינם חוקים מדעיים ואינם מבטיחים זוגיות בריאה, מאושרת או יציבה; במצב של אלימות או כפייה בטיחות ותמיכה קודמות לתרגול זוגי.",
        order: 4,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.3.1",
      },
      {
        title: "סיכום הקורס — מה אני לוקח/ת מכאן",
        description:
          "סיכום 12 השבועות ובחירה אישית במה לשמור, לשנות או להניח בצד. ערכת התרגול מרכזת 32 אפשרויות לעיון ולתרגול חוזר; אין חובה להשלים כל תרגיל או להמשיך בתהליך מסוים.",
        order: 5,
        weekNumber: 12,
        phaseNumber: 6,
        phaseName: PHASES[6].name,
        duration: 180,
        scriptIndex: "12.4.1",
        pdfUrl: "ערכת_תרגול_לקורס_הדרך.pdf",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Archived, unpublished drafts with no canonical manifest mapping.
// They are retained only for source review and are not part of SEED_COURSES.
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

const LEGACY_UNPUBLISHED_COURSE_DRAFTS = [
  OMANUT_HASICHA_MODULES,
  PROFILE_MENATZEACH_MODULES,
  SIMULATOR_DATIM_MODULES,
] as const;

export const LEGACY_UNPUBLISHED_COURSE_DRAFT_COUNT =
  LEGACY_UNPUBLISHED_COURSE_DRAFTS.length;

// ---------------------------------------------------------------------------
// Exported course data
// ---------------------------------------------------------------------------

export const SEED_COURSES: SeedCourse[] = [
  {
    title: "הדרך - אומנות הקשר",
    description:
      "תוכנית למידה ותרגול בת 12 שבועות וב-6 שלבים סביב היכרות, תקשורת וקשרים. היא כוללת 75 שיעורי ליבה, תרגול רשות אחד ו-8 מסמכי PDF לתרגול, בלי להבטיח תוצאה אישית.",
    category: "זוגיות",
    level: "beginner",
    order: 0,
    published: true,
    modules: HADERECH_MODULES,
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
//   - 12 modules (weeks), 76 content items: 75 progress-bearing lessons + 1 optional practice
//   - Phase 1 (גישה): Weeks 1-3 = 22 lessons  (8+6+8)
//   - Phase 2 (תקשורת): Weeks 4-5 = 15 items (14 progress-bearing + 1 optional)
//     - 5.2.2: NVC / ניהול קונפליקטים (updated from original "להסכים לקבל")
//     - 5.3.1: שפות האהבה (new lesson added in Iter 2)
//     - 5.3.2: לבחור אם לקבל (optional; no progress, score or disclosure)
//   - Phase 3 (מעבר ומשיכה): Weeks 6-9 = 21 lessons  (6+5+5+5)
//   - Phase 4 (חיבור וכימיה): Week 10 = 5 lessons
//     - 10.1.2: מיתוסים על כימיה (new lesson added in Iter 2)
//   - Phase 5 (אינטימיות): Week 11 = 7 lessons
//   - Phase 6 (מחויבות): Week 12 = 6 lessons
//   Total: 8+6+8+7+7+6+5+5+5+5+7+6 = 75 lessons
//
// PDFs linked to lessons (pdfUrl field) — 8 total:
//   - מסמך_כוונה_אישי.pdf               → 1.5.1  (Week 1: personal intention document)
//   - דף_חמלה_עצמית.pdf                 → 3.3.1  (Week 3: self-compassion worksheet)
//   - דף_תרגול_NVC.pdf                  → 5.2.2  (Week 5: NVC practice worksheet)
//   - מפת_העדפות_חיבה.pdf               → 5.3.1  (Week 5: affection-preference map)
//   - תבנית_רפלקציה_אחרי_דייט.pdf       → 9.3.1  (Week 9: post-date reflection)
//   - מפת_חיבור_אישית.pdf               → 10.1.1 (Week 10: personal connection map)
//   - נוסחים_לשיחת_הגדרת_קשר.pdf        → 12.2.2 (Week 12: relationship-definition prompts)
//   - ערכת_תרגול_לקורס_הדרך.pdf         → 12.4.1 (Week 12: course practice kit)
//
// Three pre-canonical drafts remain archived above and are not exported through
// SEED_COURSES, so seedHaderech cannot insert them.
