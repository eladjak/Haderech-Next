import { internalMutation, mutation } from "./_generated/server";

// Seed data: 3 starter courses with Hebrew content
const SEED_COURSES = [
  {
    title: "אומנות ההקשבה",
    description:
      "למדו כיצד להקשיב באמת לבן/בת הזוג שלכם. קורס מעשי שיעזור לכם לפתח הקשבה פעילה, להבין את מה שלא נאמר, וליצור תחושת ביטחון וקרבה דרך נוכחות אמיתית בשיחה.",
    imageUrl: "/images/course-communication.jpg",
    category: "תקשורת",
    level: "beginner" as const,
    estimatedHours: 5,
    lessons: [
      {
        title: "מהי הקשבה פעילה?",
        content:
          "הקשבה פעילה היא הרבה מעבר לשמיעת מילים. זהו תהליך שלם של נוכחות, קשב והבנה. בשיעור זה נלמד את ההבדל בין שמיעה להקשבה, ונבין מדוע הקשבה פעילה היא הבסיס לכל תקשורת טובה.\n\nנושאים מרכזיים:\n- ההבדל בין שמיעה פסיבית להקשבה פעילה\n- חמשת המרכיבים של הקשבה איכותית\n- למה אנחנו מפסיקים להקשיב (ומה לעשות עם זה)\n- תרגיל: דקה של הקשבה מלאה",
        duration: 720,
      },
      {
        title: "שפת הגוף בהקשבה",
        content:
          "גופנו מדבר כל הזמן - גם כשאנחנו שותקים. בשיעור זה נלמד כיצד שפת הגוף שלנו משפיעה על איכות ההקשבה, וכיצד לקרוא את שפת הגוף של בן/בת הזוג.\n\nנושאים מרכזיים:\n- קשר עין - כמה, מתי ואיך\n- תנוחת גוף פתוחה ומזמינה\n- מיקרו-ביטויים: מה הפנים מגלות\n- תרגיל: שיחה ללא מילים",
        duration: 840,
      },
      {
        title: "להקשיב מעבר למילים",
        content:
          "מה שלא נאמר חשוב לפעמים יותר ממה שנאמר. בשיעור זה נלמד לזהות את הרגשות, הצרכים והמסרים שמסתתרים מאחורי המילים.\n\nנושאים מרכזיים:\n- זיהוי רגשות בטון הדיבור\n- מה אנשים באמת אומרים כשהם אומרים 'הכל בסדר'\n- הקשבה לצרכים הלא-מילוליים\n- תרגיל: תרגום רגשי של שיחה",
        duration: 900,
      },
      {
        title: "חסמים להקשבה ואיך להתגבר עליהם",
        content:
          "כולנו מכירים את הרגעים שבהם אנחנו 'שומעים' אבל לא באמת מקשיבים. בשיעור זה נזהה את החסמים הנפוצים ונלמד טכניקות להתגברות עליהם.\n\nנושאים מרכזיים:\n- שבעת החסמים הנפוצים להקשבה\n- הטריגרים האישיים שלך\n- טכניקת 'העצירה' - איך לחזור להקשבה\n- תרגיל: יומן חסמי הקשבה",
        duration: 780,
      },
      {
        title: "שיקוף ותיקוף - כלים מעשיים",
        content:
          "שיקוף ותיקוף הם שני הכלים החזקים ביותר בהקשבה פעילה. בשיעור זה נלמד כיצד להשתמש בהם כדי שבן/בת הזוג ירגישו שהם באמת נשמעים.\n\nנושאים מרכזיים:\n- מהו שיקוף ולמה הוא עובד\n- סוגי תיקוף: רגשי, חווייתי ונורמטיבי\n- משפטי מפתח להקשבה פעילה\n- תרגיל: 10 דקות של שיקוף עם בן/בת הזוג",
        duration: 960,
      },
      {
        title: "תרגול מסכם: שיחה מקשיבה",
        content:
          "הגיע הזמן לשלב את כל מה שלמדנו. בשיעור זה נתרגל שיחה מקשיבה מלאה, עם כל הכלים שרכשנו לאורך הקורס.\n\nנושאים מרכזיים:\n- סיכום 5 העקרונות של הקשבה פעילה\n- תרגיל מונחה: שיחה מקשיבה בת 20 דקות\n- יצירת הרגל יומי של הקשבה\n- תוכנית אישית להמשך תרגול",
        duration: 1080,
      },
    ],
  },
  {
    title: "תקשורת זוגית מתקדמת",
    description:
      "העמיקו את יכולות התקשורת הזוגית שלכם. קורס מקיף שמלמד כלים מתקדמים לניהול שיחות קשות, פתרון קונפליקטים, והעמקת הקשר הרגשי דרך תקשורת פתוחה וכנה.",
    imageUrl: "/images/course-communication.jpg",
    category: "תקשורת",
    level: "intermediate" as const,
    estimatedHours: 6,
    lessons: [
      {
        title: "יסודות התקשורת הזוגית",
        content:
          "לפני שנצלול לכלים מתקדמים, חשוב להבין את היסודות. בשיעור זה נלמד את מודל התקשורת הזוגית ונבין מדוע זוגות נתקעים בדפוסים שליליים.\n\nנושאים מרכזיים:\n- ארבעת סגנונות התקשורת הזוגית\n- מעגל התקשורת: שליחה, קבלה ומשוב\n- דפוסים שליליים נפוצים (ביקורת, הגנה, בוז, הסתגרות)\n- מבחן עצמי: מהו סגנון התקשורת שלך?",
        duration: 840,
      },
      {
        title: "שיחות קשות - איך לפתוח נכון",
        content:
          "הדרך שבה אנחנו פותחים שיחה קשה קובעת לרוב את תוצאתה. בשיעור זה נלמד את 'הפתיחה הרכה' - טכניקה שמעלה משמעותית את הסיכוי לשיחה פורייה.\n\nנושאים מרכזיים:\n- מדוע 96% מהשיחות נגמרות כפי שהתחילו\n- טכניקת הפתיחה הרכה: XYZ formula\n- ההבדל בין תלונה לביקורת\n- תרגיל: המרת ביקורות לבקשות",
        duration: 900,
      },
      {
        title: "ניהול קונפליקטים בזוגיות",
        content:
          "קונפליקטים הם חלק בלתי נפרד מכל זוגיות בריאה. ההבדל בין זוגות מאושרים לאומללים הוא לא כמות הריבים, אלא הדרך שבה הם מנהלים אותם.\n\nנושאים מרכזיים:\n- בעיות פתירות vs בעיות נצחיות (69% מהקונפליקטים)\n- טכניקת ה-Time Out: איך לקחת הפסקה נכונה\n- כלי ה-Repair Attempt - לתקן שבר בזמן אמת\n- תרגיל: מפת הקונפליקט הזוגי שלנו",
        duration: 1020,
      },
      {
        title: "תקשורת רגשית - לדבר מהלב",
        content:
          "תקשורת אמיתית מתחילה כשאנחנו מדברים מהלב ולא רק מהראש. בשיעור זה נלמד כיצד לשתף ברגשות באופן שמקרב ולא מרחיק.\n\nנושאים מרכזיים:\n- מדרגות הפגיעות: מידע, מחשבות, רגשות, צרכים\n- שפת 'אני' vs שפת 'אתה'\n- כיצד לבקש מה שאנחנו צריכים\n- תרגיל: מכתב רגשי לבן/בת הזוג",
        duration: 780,
      },
      {
        title: "הקשבה אמפתית בזוגיות",
        content:
          "אמפתיה היא היכולת לראות את העולם דרך העיניים של בן/בת הזוג. בשיעור זה נלמד כיצד להקשיב באמפתיה גם כשקשה, גם כשאנחנו לא מסכימים.\n\nנושאים מרכזיים:\n- אמפתיה vs סימפתיה - ההבדל המכריע\n- טכניקת 'הכיסא של השני' - לראות מנקודת המבט של בן/בת הזוג\n- איך להקשיב כשאנחנו חלק מהבעיה\n- תרגיל: דיאלוג אמפתי מונחה",
        duration: 900,
      },
    ],
  },
  {
    title: "מפתחות לאינטימיות",
    description:
      "גלו כיצד לבנות ולחזק אינטימיות אמיתית בזוגיות. קורס שמלמד את הסודות של זוגות מאושרים - כיצד לשמור על חיבור רגשי עמוק, ליצור מרחב בטוח, ולטפח קרבה שנמשכת לאורך זמן.",
    imageUrl: "/images/course-haderech.jpg",
    category: "זוגיות",
    level: "advanced" as const,
    estimatedHours: 7,
    lessons: [
      {
        title: "מהי אינטימיות אמיתית?",
        content:
          "אינטימיות היא הרבה יותר ממה שאנשים חושבים. בשיעור זה נגדיר מחדש מהי אינטימיות ונבין את חמשת הסוגים השונים שלה.\n\nנושאים מרכזיים:\n- חמשת סוגי האינטימיות: רגשית, אינטלקטואלית, חווייתית, רוחנית ופיזית\n- מדוע אינטימיות דורשת אומץ\n- מיתוסים נפוצים על אינטימיות\n- מבחן עצמי: מפת האינטימיות הזוגית שלכם",
        duration: 720,
      },
      {
        title: "בניית ביטחון רגשי",
        content:
          "אינטימיות אמיתית יכולה לפרוח רק במרחב בטוח. בשיעור זה נלמד כיצד לבנות ביטחון רגשי בזוגיות - הבסיס לכל קרבה עמוקה.\n\nנושאים מרכזיים:\n- תיאוריית ההיקשרות בזוגיות\n- סימנים לביטחון רגשי (ולחוסר ביטחון)\n- כיצד לתקן אמון שנפגע\n- תרגיל: שיחת ביטחון רגשי",
        duration: 960,
      },
      {
        title: "פגיעות ככוח - לפתוח את הלב",
        content:
          "ברנה בראון אומרת: 'פגיעות היא מקום הלידה של אהבה, שייכות ושמחה'. בשיעור זה נלמד כיצד פגיעות הופכת מחולשה לכוח העוצמתי ביותר בזוגיות.\n\nנושאים מרכזיים:\n- מדוע אנחנו מפחדים מפגיעות\n- השריון הרגשי שלנו ואיך לפרק אותו בהדרגה\n- רמות של חשיפה עצמית\n- תרגיל: '36 השאלות' - תרגיל קרבה מוכח מחקרית",
        duration: 840,
      },
      {
        title: "ריטואלים של חיבור",
        content:
          "זוגות מאושרים לא סתם 'קורה להם' - הם בונים חיבור באופן מכוון. בשיעור זה נלמד ליצור ריטואלים יומיומיים ושבועיים שמחזקים את הקשר.\n\nנושאים מרכזיים:\n- מחקר גוטמן: 'הפניות רגשיות' וכיצד להגיב להן\n- 6 ריטואלים יומיים של זוגות מאושרים\n- תאריך שבועי: איך להפוך אותו למשמעותי\n- תרגיל: עיצוב הריטואלים הזוגיים שלכם",
        duration: 900,
      },
      {
        title: "התמודדות עם ריחוק רגשי",
        content:
          "כל זוג חווה תקופות של ריחוק רגשי. בשיעור זה נלמד לזהות את הסימנים המוקדמים ולדעת כיצד לגשר על הפער לפני שהוא הופך לתהום.\n\nנושאים מרכזיים:\n- סימנים מוקדמים לריחוק רגשי\n- 'מעגל הניתוק' - איך זוגות מתרחקים בהדרגה\n- 4 צעדים לחזרה לקרבה\n- תרגיל: שיחת 'איפה אנחנו' - צ'ק-אין זוגי",
        duration: 780,
      },
      {
        title: "לשמור על הניצוץ לאורך זמן",
        content:
          "אינטימיות לאורך זמן דורשת מאמץ מכוון. בשיעור הסיום נלמד כיצד לשמור על תשוקה, עניין והתחדשות גם אחרי שנים רבות יחד.\n\nנושאים מרכזיים:\n- מדוע אינטימיות משתנה לאורך הזמן (וזה בסדר)\n- חידוש vs חזרה: ההבדל בין שגרה לשחיקה\n- יצירת חוויות חדשות יחד\n- תרגיל: תוכנית חיבור ל-30 הימים הקרובים",
        duration: 1020,
      },
    ],
  },
] as const;

// Seed all courses and lessons into the database
export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if courses already exist
    const existingCourses = await ctx.db.query("courses").collect();
    if (existingCourses.length > 0) {
      return {
        success: false,
        message: `Already have ${existingCourses.length} courses. Skipping seed.`,
      };
    }

    const now = Date.now();
    const createdCourses: string[] = [];

    for (let i = 0; i < SEED_COURSES.length; i++) {
      const courseData = SEED_COURSES[i];

      // Create the course
      const courseId = await ctx.db.insert("courses", {
        title: courseData.title,
        description: courseData.description,
        imageUrl: courseData.imageUrl,
        category: courseData.category,
        level: courseData.level,
        estimatedHours: courseData.estimatedHours,
        published: true,
        order: i,
        createdAt: now,
        updatedAt: now,
      });

      // Create lessons for this course
      for (let j = 0; j < courseData.lessons.length; j++) {
        const lessonData = courseData.lessons[j];
        await ctx.db.insert("lessons", {
          courseId,
          title: lessonData.title,
          content: lessonData.content,
          videoUrl: undefined,
          duration: lessonData.duration,
          order: j,
          published: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      createdCourses.push(courseData.title);

      // Create a quiz for the first lesson of each course
      const firstLessonId = await ctx.db
        .query("lessons")
        .withIndex("by_course_order", (q) => q.eq("courseId", courseId))
        .first();

      if (firstLessonId) {
        const quizId = await ctx.db.insert("quizzes", {
          lessonId: firstLessonId._id,
          courseId,
          title: `בוחן - ${courseData.lessons[0].title}`,
          passingScore: 60,
          createdAt: now,
        });

        // Create quiz questions based on course topic
        const quizQuestions = getQuizQuestionsForCourse(i);
        for (let q = 0; q < quizQuestions.length; q++) {
          await ctx.db.insert("quizQuestions", {
            quizId,
            question: quizQuestions[q].question,
            options: quizQuestions[q].options,
            correctIndex: quizQuestions[q].correctIndex,
            explanation: quizQuestions[q].explanation,
            order: q,
          });
        }
      }
    }

    return {
      success: true,
      message: `Created ${createdCourses.length} courses with lessons and quizzes.`,
      courses: createdCourses,
    };
  },
});

function getQuizQuestionsForCourse(courseIndex: number) {
  const allQuizzes = [
    // Course 0: אומנות ההקשבה
    [
      {
        question: "מהו ההבדל המרכזי בין שמיעה להקשבה פעילה?",
        options: [
          "שמיעה היא תהליך פיזי, הקשבה פעילה כוללת נוכחות והבנה",
          "אין הבדל - שניהם אותו דבר",
          "שמיעה טובה יותר כי היא מהירה",
          "הקשבה פעילה מתאימה רק למומחים",
        ],
        correctIndex: 0,
        explanation:
          "שמיעה היא תהליך פיזי אוטומטי, בעוד הקשבה פעילה כוללת נוכחות מלאה, קשב מכוון והבנה עמוקה של מה שנאמר.",
      },
      {
        question: "כמה מרכיבים יש להקשבה איכותית לפי השיעור?",
        options: ["שלושה", "ארבעה", "חמישה", "שבעה"],
        correctIndex: 2,
        explanation: "לפי השיעור, ישנם חמישה מרכיבים של הקשבה איכותית.",
      },
      {
        question: "מהי הטכניקה המומלצת כשמרגישים שמפסיקים להקשיב?",
        options: [
          "לעזוב את השיחה",
          "להעמיד פנים שמקשיבים",
          "לחזור לנוכחות דרך קשב מכוון",
          "לשנות נושא",
        ],
        correctIndex: 2,
        explanation:
          "כשמזהים שהקשב נדד, הטכניקה המומלצת היא לחזור בעדינות לנוכחות מלאה בשיחה.",
      },
    ],
    // Course 1: תקשורת זוגית מתקדמת
    [
      {
        question: "מה אחוז השיחות שנגמרות כפי שהתחילו?",
        options: ["50%", "75%", "88%", "96%"],
        correctIndex: 3,
        explanation:
          "לפי מחקרים, 96% מהשיחות נגמרות כפי שהתחילו - לכן הפתיחה הרכה כל כך חשובה.",
      },
      {
        question: "כמה אחוז מהקונפליקטים הזוגיים הם 'בעיות נצחיות'?",
        options: ["23%", "45%", "69%", "85%"],
        correctIndex: 2,
        explanation:
          "לפי מחקר גוטמן, 69% מהקונפליקטים הזוגיים הם בעיות נצחיות שדורשות ניהול ולא פתרון.",
      },
      {
        question: 'מהי "פתיחה רכה" בשיחה קשה?',
        options: [
          "לדבר בשקט",
          "להשתמש בנוסחת XYZ - לתאר מצב, רגש ובקשה",
          "לפתוח בבדיחה",
          "לחכות שהצד השני ידבר קודם",
        ],
        correctIndex: 1,
        explanation:
          "פתיחה רכה משתמשת בנוסחת XYZ: תיאור המצב, הרגש שהוא מעורר, ובקשה ספציפית.",
      },
    ],
    // Course 2: מפתחות לאינטימיות
    [
      {
        question: "כמה סוגי אינטימיות קיימים לפי השיעור?",
        options: ["שניים", "שלושה", "חמישה", "שבעה"],
        correctIndex: 2,
        explanation:
          "ישנם חמישה סוגי אינטימיות: רגשית, אינטלקטואלית, חווייתית, רוחנית ופיזית.",
      },
      {
        question: 'מהו הבסיס ל"ביטחון רגשי" בזוגיות?',
        options: [
          "הסכם כלכלי משותף",
          "תקשורת פתוחה ותיקוף רגשי",
          "ביחד כל הזמן",
          "הסכמה על הכל",
        ],
        correctIndex: 1,
        explanation:
          "ביטחון רגשי נבנה דרך תקשורת פתוחה, תיקוף רגשי, ויצירת מרחב בטוח לפגיעות.",
      },
      {
        question: 'מהי "הפנייה רגשית" לפי מחקר גוטמן?',
        options: [
          "לשנות נושא כשמרגישים רגש",
          "ניסיון ליצור קשר רגשי עם בן/בת הזוג",
          "להסתובב פיזית לכיוון בן/בת הזוג",
          "לפנות למטפל זוגי",
        ],
        correctIndex: 1,
        explanation:
          "הפנייה רגשית היא כל ניסיון - גדול או קטן - ליצור קשר, תשומת לב או חיבור עם בן/בת הזוג.",
      },
    ],
  ];

  return allQuizzes[courseIndex] ?? allQuizzes[0];
}

// ─── Community Seed Data ───────────────────────────────────────────────────────

const SEED_COMMUNITY_TOPICS = [
  {
    title: "איך להתכונן לדייט ראשון?",
    content:
      "שלום לכולם! אני עומד על דייט ראשון שלי בעוד יומיים ואני קצת מעוצבן. מה הטיפים שלכם להתכונן? מה עושים ביום לפני? מה לובשים? איך מתחילים שיחה?\n\nאני מכירה אותה מאפליקציה כבר שבועיים ואנחנו מדברים טוב - אבל פנים אל פנים זה אחר לגמרי.",
    category: "questions" as const,
    pinned: false,
    likesCount: 12,
    repliesCount: 8,
  },
  {
    title: "סיפור ההצלחה שלי - מצאתי את הזוגית!",
    content:
      "חייב לשתף אתכם - אחרי שנתיים של דייטינג מתסכל, אני סוף סוף מאושר עם אישה מדהימה!\n\nמה עזר לי:\n1. הפסקתי לחשוב כמה דייטים עוד יש לי והתחלתי להיות נוכח בכל מפגש\n2. למדתי להקשיב אמיתית - לא רק לחכות לתורי לדבר\n3. היה לי אומץ לדבר על מה שבאמת חשוב לי\n\nמקווה שזה יעזור למי שמרגיש תקוע!",
    category: "success-stories" as const,
    pinned: true,
    likesCount: 47,
    repliesCount: 23,
  },
  {
    title: "5 טיפים לתקשורת טובה יותר בדייט",
    content:
      "שיתפתי את הטיפים האלה עם חבר ועזר לו מאוד, אז החלטתי לשתף גם כאן:\n\n**1. שאל שאלות פתוחות** - במקום 'אתה עובד?' שאל 'ספר לי על העבודה שלך'\n\n**2. הקשב לתשובות** - אל תחשוב על מה תגיד אחר כך בזמן שהם מדברים\n\n**3. שתף גם אתה** - שיחה היא שני-כיוונית, אל תיהפך לעיתונאי\n\n**4. הכר בשיתופים שלהם** - 'זה נשמע מאתגר, איך התמודדת?'\n\n**5. דבר על ערכים, לא רק עובדות** - מה אתה אוהב ולמה, לא רק מה\n\nשתפו בתגובות מה עוד עובד לכם!",
    category: "dating-tips" as const,
    pinned: false,
    likesCount: 31,
    repliesCount: 15,
  },
  {
    title: "איך להתמודד עם דחייה?",
    content:
      "הייתה לי דחייה אתמול אחרי שלושה דייטים שהלכו לדעתי מצוין. שלחה לי הודעה שהיא לא מרגישה חיבור.\n\nאני יודע שזה חלק מהתהליך, אבל עדיין כואב. איך אתם מתמודדים עם דחייה? כמה זמן לוקח לכם 'להתאושש'? יש פעולות שעוזרות לכם?",
    category: "advice" as const,
    pinned: false,
    likesCount: 19,
    repliesCount: 34,
  },
  {
    title: "מה עובד באפליקציות דייטינג?",
    content:
      "רוצה לשמוע חוויות אמיתיות - מה עובד לכם בפרופיל, בשיחות, ובמעבר לפגישה?\n\nאני כרגע ב-Hinge ו-Bumble. הפרופיל שלי נראה לי סביר אבל Match Rate נמוך מדי לטעמי. האם תמונה ראשונה קובעת הכל? כדאי לשים תמונה עם חברים או לבד?\n\nתודה לכל המשיבים!",
    category: "general" as const,
    pinned: false,
    likesCount: 8,
    repliesCount: 42,
  },
  {
    title: "על חשיבות ההיכרות העצמית לפני דייטינג",
    content:
      "שנה שעברה הייתי בכמה מערכות יחסים שלא עבדו, ובסופו של דבר הבנתי שהבעיה לא הייתה 'שהאנשים לא היו מתאימים' - הבעיה הייתה שלא ידעתי מה אני בעצמי מחפש.\n\nהשקעתי חצי שנה בעבודה על עצמי - מה הערכים שלי? מה גבולות שלי? מה אני מביא לזוגיות ומה אני צריך? \n\nזה שינה הכל. הדייטים עצמם קיבלו מטרה אחרת - לא 'להרשים' אלא 'לבדוק האם אנחנו מתאימים'.",
    category: "advice" as const,
    pinned: false,
    likesCount: 55,
    repliesCount: 17,
  },
  {
    title: "כיצד יוצרים פרופיל דייטינג שמושך את האנשים הנכונים?",
    content:
      "שאלה טכנית - עברתי על פרופיל שלי מחדש ואני לא בטוח אם הוא 'מושך' את הסוג של אנשים שאני מחפש.\n\nשאלות שמתעסק בהן:\n- האם לכתוב על הטיול האחרון שעשיתי? (אולי נשמע חנון?)\n- כמה הומור לשים? אני מצחיק אבל לא תמיד עובד בכתב\n- האם להזכיר שאני מחפש משהו רציני? לא רוצה להרתיע\n\nמה דעתכם?",
    category: "dating-tips" as const,
    pinned: false,
    likesCount: 14,
    repliesCount: 19,
  },
  {
    title: "ברוכים הבאים לקהילת הדרך!",
    content:
      "שלום לכולם!\n\nזהו המרחב שלנו - מקום בטוח לשאול, לשתף, ולתמוך זה בזה במסע לזוגיות.\n\nכמה כללי קהילה:\n✓ כבוד הדדי - כולנו כאן ללמוד וצומחים\n✓ שמירה על פרטיות - אל תשתפו פרטים מזהים על אחרים\n✓ תמיכה לא ביקורת - אנחנו עוזרים, לא שופטים\n✓ חוויות אמיתיות - כנות מקדמת!\n\nשמחים שאתם כאן. בהצלחה לכולם!",
    category: "general" as const,
    pinned: true,
    likesCount: 88,
    repliesCount: 12,
  },
];

// Seed community topics (uses a system/first admin user)
export const seedCommunity = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if community topics already exist
    const existingTopics = await ctx.db.query("communityTopics").take(1);
    if (existingTopics.length > 0) {
      return {
        success: false,
        message: `Community topics already exist. Skipping seed.`,
      };
    }

    // Find or create a system user to author the seed topics
    let systemUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "system@haderech.co.il"))
      .unique();

    if (!systemUser) {
      const now = Date.now();
      const systemUserId = await ctx.db.insert("users", {
        clerkId: "system_seed_user",
        email: "system@haderech.co.il",
        name: "צוות הדרך",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      systemUser = await ctx.db.get(systemUserId);
    }

    if (!systemUser) throw new Error("Failed to create system user");

    const now = Date.now();
    const createdTopics: string[] = [];

    for (let i = 0; i < SEED_COMMUNITY_TOPICS.length; i++) {
      const topicData = SEED_COMMUNITY_TOPICS[i];
      await ctx.db.insert("communityTopics", {
        userId: systemUser._id,
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
        pinned: topicData.pinned,
        likesCount: topicData.likesCount,
        repliesCount: topicData.repliesCount,
        createdAt: now - (SEED_COMMUNITY_TOPICS.length - i) * 1000 * 60 * 60, // stagger creation times
      });
      createdTopics.push(topicData.title);
    }

    return {
      success: true,
      message: `Created ${createdTopics.length} community topics.`,
      topics: createdTopics,
    };
  },
});

// Unified seed command - seeds all data
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: { courses?: string; simulator?: string; community?: string } = {};

    // 1. Seed courses
    const existingCourses = await ctx.db.query("courses").collect();
    if (existingCourses.length > 0) {
      results.courses = `Skipped - ${existingCourses.length} courses already exist`;
    } else {
      const now = Date.now();
      const createdCourses: string[] = [];

      for (let i = 0; i < SEED_COURSES.length; i++) {
        const courseData = SEED_COURSES[i];
        const courseId = await ctx.db.insert("courses", {
          title: courseData.title,
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          category: courseData.category,
          level: courseData.level,
          estimatedHours: courseData.estimatedHours,
          published: true,
          order: i,
          createdAt: now,
          updatedAt: now,
        });

        for (let j = 0; j < courseData.lessons.length; j++) {
          const lessonData = courseData.lessons[j];
          await ctx.db.insert("lessons", {
            courseId,
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: undefined,
            duration: lessonData.duration,
            order: j,
            published: true,
            createdAt: now,
            updatedAt: now,
          });
        }
        createdCourses.push(courseData.title);
      }

      results.courses = `Created ${createdCourses.length} courses: ${createdCourses.join(", ")}`;
    }

    // 2. Seed simulator scenarios
    const existingScenarios = await ctx.db
      .query("simulatorScenarios")
      .take(1);
    if (existingScenarios.length > 0) {
      results.simulator = `Skipped - simulator scenarios already exist`;
    } else {
      results.simulator = `Simulator scenarios: run seedSimulatorScenarios mutation separately (it's in seedSimulatorData.ts)`;
    }

    // 3. Seed community topics
    const existingTopics = await ctx.db.query("communityTopics").take(1);
    if (existingTopics.length > 0) {
      results.community = `Skipped - community topics already exist`;
    } else {
      let systemUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", "system@haderech.co.il"))
        .unique();

      if (!systemUser) {
        const now2 = Date.now();
        const systemUserId = await ctx.db.insert("users", {
          clerkId: "system_seed_user",
          email: "system@haderech.co.il",
          name: "צוות הדרך",
          role: "admin",
          createdAt: now2,
          updatedAt: now2,
        });
        systemUser = await ctx.db.get(systemUserId);
      }

      if (systemUser) {
        const now3 = Date.now();
        for (let i = 0; i < SEED_COMMUNITY_TOPICS.length; i++) {
          const topicData = SEED_COMMUNITY_TOPICS[i];
          await ctx.db.insert("communityTopics", {
            userId: systemUser._id,
            title: topicData.title,
            content: topicData.content,
            category: topicData.category,
            pinned: topicData.pinned,
            likesCount: topicData.likesCount,
            repliesCount: topicData.repliesCount,
            createdAt: now3 - (SEED_COMMUNITY_TOPICS.length - i) * 1000 * 60 * 60,
          });
        }
        results.community = `Created ${SEED_COMMUNITY_TOPICS.length} community topics`;
      }
    }

    return {
      success: true,
      results,
      summary: Object.entries(results)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    };
  },
});

// Clear all seed data (for development - use carefully)
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "notifications",
      "notes",
      "comments",
      "quizAttempts",
      "quizQuestions",
      "quizzes",
      "certificates",
      "progress",
      "enrollments",
      "lessons",
      "courses",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { success: true, message: "All course data cleared." };
  },
});
