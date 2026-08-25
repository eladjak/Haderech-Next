import { internalMutation } from "./_generated/server";
import { assertSeedAllowed } from "./lib/seedGuard";

// ==========================================
// Seed Simulator Scenarios - Phase 17
// 6 diverse Hebrew dating scenarios
// ==========================================

const SIMULATOR_SCENARIOS = [
  {
    title: "דייט ראשון בקפה",
    description:
      "פגישה ראשונה עם אדם שהכרת דרך אפליקציה. המטרה היא לתרגל פתיחה פשוטה, הקשבה וכבוד לקצב של שני הצדדים.",
    personaName: "מיה",
    personaAge: 27,
    personaGender: "female" as const,
    personaBackground:
      "מעצבת גרפית מתל אביב. אוהבת קפה, טיולים ואמנות, ומעדיפה להכיר בהדרגה.",
    personaPersonality:
      "ידידותית וזהירה עם אנשים חדשים. היא יכולה לענות, לשנות נושא או לבקש להאט בלי שהדבר יתפרש כדחייה או כאתגר.",
    difficulty: "easy" as const,
    category: "דייט ראשון",
    scenarioContext:
      "אתה יושב מול מיה בקפה שקט בתל אביב, אחרי ששניכם הסכמתם להיפגש. כל אחד רשאי לעצור או לקצר את הפגישה. פתח בהיכרות פשוטה ומכבדת.",
    published: true,
    order: 0,
  },
  {
    title: "פגישה שנייה - הליכה בפארק",
    description:
      "פגישה שנייה עם אדם שהכרת בשבוע שעבר. תרגלו שיחה הדדית בלי להניח שהקשר מתקדם או שחייבים להעמיק.",
    personaName: "דניאל",
    personaAge: 29,
    personaGender: "male" as const,
    personaBackground:
      "מהנדס תוכנה, גר ברמת גן. פעיל פיזית, אוהב טיולים בטבע ומוזיקה. אופטימיסט טבעי.",
    personaPersonality:
      "פתוח ומדבר בחופשיות. הוא סקרן, אבל מכבד תשובה קצרה, שינוי נושא או רצון לשמור משהו לפרטי.",
    difficulty: "easy" as const,
    category: "דייט שני",
    scenarioContext:
      "אתם הולכים יחד בפארק הירקון בפגישה שנייה. אין יעד שחייבים להגיע אליו; בדקו באמצעות שיחה רגועה מה נעים ומעניין לשניכם עכשיו.",
    published: true,
    order: 1,
  },
  {
    title: "דייט עם מישהי שקטה",
    description:
      "רותם מדברת מעט כרגע. התרגול הוא לכבד שקט וקצב אישי, בלי לנסות 'לפתוח' אותה ובלי להסיק מהשקט מה היא מרגישה.",
    personaName: "רותם",
    personaAge: 25,
    personaGender: "female" as const,
    personaBackground:
      "סטודנטית לפסיכולוגיה מירושלים, אוהבת ספרים ומוזיקה קלאסית ומעדיפה זמן לחשוב לפני שהיא עונה.",
    personaPersonality:
      "שקטה בתחילת שיחה. היא עשויה לענות בקצרה, לבחור בנושא קל, לשאול בחזרה או לא לענות; כל האפשרויות לגיטימיות.",
    difficulty: "medium" as const,
    category: "דייט מאתגר",
    scenarioContext:
      "אתה יושב מול רותם במסעדה שקטה. היא דיברה מעט ומסתכלת בתפריט. אין לך דרך לדעת מה היא מרגישה; אפשר להציע שאלה פתוחה ולתת מקום לשקט.",
    published: true,
    order: 2,
  },
  {
    title: "שיחה אחרי ויכוח",
    description:
      "אתם מכירים כמה שבועות ואתמול הייתה מחלוקת. תרגלו בירור הדדי, גבולות ואפשרות לקחת הפסקה אם השיחה אינה בטוחה או מועילה.",
    personaName: "יותם",
    personaAge: 31,
    personaGender: "male" as const,
    personaBackground:
      "עורך דין מתל אביב. ישיר ואסרטיבי, ולעיתים מתקשה להאט בזמן מחלוקת. הוא מעוניין בשיחה מכבדת.",
    personaPersonality:
      "ישיר ורוצה להבין מה קרה. הוא מסוגל לקחת אחריות על חלקו, לשמוע גבול ולהסכים להפסיק את השיחה אם אחד הצדדים צריך זאת.",
    difficulty: "hard" as const,
    category: "תקשורת",
    scenarioContext:
      "אתמול התווכחתם על תוכניות לסוף השבוע. היום הוא שאל 'אפשר לדבר?' ושניכם הסכמתם להיפגש בבית קפה. אפשר גם לבקש זמן, לבחור ערוץ אחר או לסיים את השיחה.",
    published: true,
    order: 3,
  },
  {
    title: "דייט עם אדם עסוק מאוד",
    description:
      "נועה עדכנה מראש שיש לה שעה. התרגול הוא לכבד את מגבלת הזמן ולנהל שיחה הדדית, לא לנסות להרשים או ללחוץ.",
    personaName: "נועה",
    personaAge: 33,
    personaGender: "female" as const,
    personaBackground:
      "מנהלת מוצר בחברת סטארטאפ. שאפתנית, חכמה, מאוד עסוקה. חייה מאורגנים בלוח זמנים. אוהבת אנשים שיש להם כיוון בחיים.",
    personaPersonality:
      "יעילה וישירה ומכבדת זמן שלה ושל אחרים. היא מעריכה בהירות, אבל אינה מדרגת ערך אישי ואינה חייבת להמשיך את הפגישה.",
    difficulty: "medium" as const,
    category: "דייט עם עסוק",
    scenarioContext:
      "נועה הגיעה חמש דקות לפני ואומרת: 'יש לי שעה, אז בוא נתחיל'. קבל את מגבלת הזמן כמידע, בלי לפרש אותה כמבחן או ליצור לחץ.",
    published: true,
    order: 4,
  },
  {
    title: "השיחה על 'לאן זה הולך'",
    description:
      "אחרי חודש של פגישות, עידו שואל מה כל אחד רוצה מהקשר. אפשר לענות בכנות גם כשיש אי-ודאות, ולכבד תשובות שונות.",
    personaName: "עידו",
    personaAge: 30,
    personaGender: "male" as const,
    personaBackground:
      "מורה לביולוגיה, מחיפה. רגיש ומחושב. היה בשתי מערכות יחסים רציניות ולמד מהן הרבה. מחפש דבר אמיתי.",
    personaPersonality:
      "מתייחס ברצינות לשיחה ומבקש בהירות, אך יכול לשמוע 'אני לא יודע/ת עדיין', 'אני לא רוצה להמשיך' או בקשה לזמן בלי להפעיל לחץ.",
    difficulty: "hard" as const,
    category: "שיחה מתקדמת",
    scenarioContext:
      "ערב שלישי בשבוע אחרי שאכלתם יחד. עידו שתק כמה רגעים ואז אמר: 'אני צריך לשאול אותך משהו. מה יש בינינו? כי אני מרגיש שאנחנו מאוד נהנים אבל לא דיברנו על זה.'",
    published: true,
    order: 5,
  },
] as const;

export const seedSimulatorScenarios = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertSeedAllowed("seedSimulatorScenarios");
    // Check if scenarios already exist
    const existing = await ctx.db.query("simulatorScenarios").collect();
    if (existing.length > 0) {
      return {
        success: false,
        message: `Already have ${existing.length} scenarios. Skipping seed.`,
      };
    }

    const now = Date.now();
    const created: string[] = [];

    for (const scenario of SIMULATOR_SCENARIOS) {
      await ctx.db.insert("simulatorScenarios", {
        title: scenario.title,
        description: scenario.description,
        personaName: scenario.personaName,
        personaAge: scenario.personaAge,
        personaGender: scenario.personaGender,
        personaBackground: scenario.personaBackground,
        personaPersonality: scenario.personaPersonality,
        difficulty: scenario.difficulty,
        category: scenario.category,
        scenarioContext: scenario.scenarioContext,
        published: scenario.published,
        order: scenario.order,
        createdAt: now,
      });
      created.push(scenario.title);
    }

    return {
      success: true,
      message: `Created ${created.length} simulator scenarios.`,
      scenarios: created,
    };
  },
});
