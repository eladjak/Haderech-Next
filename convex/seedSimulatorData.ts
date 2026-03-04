import { mutation } from "./_generated/server";

// ==========================================
// Seed Simulator Scenarios - Phase 17
// 6 diverse Hebrew dating scenarios
// ==========================================

const SIMULATOR_SCENARIOS = [
  {
    title: "דייט ראשון בקפה",
    description:
      "הפגישה הראשונה עם מישהי שהכרת דרך אפליקציה. היא יושבת בקפה ומחכה. זו ההזדמנות שלך להתחיל על הצד הנכון.",
    personaName: "מיה",
    personaAge: 27,
    personaGender: "female" as const,
    personaBackground:
      "מעצבת גרפית, מתל אביב. אוהבת קפה, טיולים ואמנות. הייתה ביחסים רציניים אחד ועכשיו מחפשת משהו אמיתי.",
    personaPersonality:
      "פתוחה וידידותית, אבל קצת זהירה עם אנשים חדשים. אוהבת שיחות עמוקות. מגיבה טוב להומור ולמקוריות.",
    difficulty: "easy" as const,
    category: "דייט ראשון",
    scenarioContext:
      "אתה יושב מול מיה בקפה שקט בתל אביב. זהו הדייט הראשון שלכם אחרי שהתאמתם באפליקציה. היא חייכה כשנכנסת. פתח שיחה.",
    published: true,
    order: 0,
  },
  {
    title: "פגישה שנייה - הליכה בפארק",
    description:
      "הדייט השני עם אדם שהכרת שבוע שעבר. יצאתם כבר לפגישה אחת ועכשיו הולכים ביחד בפארק. הקשר מתחיל להתפתח.",
    personaName: "דניאל",
    personaAge: 29,
    personaGender: "male" as const,
    personaBackground:
      "מהנדס תוכנה, גר ברמת גן. פעיל פיזית, אוהב טיולים בטבע ומוזיקה. אופטימיסט טבעי.",
    personaPersonality:
      "מתלהב ופתוח. מדבר בחופשיות ושואל שאלות. אוהב לדעת מה מניע אנשים. מגיב טוב לעניין אמיתי.",
    difficulty: "easy" as const,
    category: "דייט שני",
    scenarioContext:
      "אתם הולכים ביחד בפארק הירקון. האוויר נעים, דניאל לצידך. זה הדייט השני שלכם. השיחה הראשונה הלכה טוב, עכשיו צריך לעמיק את הקשר.",
    published: true,
    order: 1,
  },
  {
    title: "דייט עם מישהי שקטה",
    description:
      "היא לא ממש מדברת הרבה. נראית ביישנית וקצת מסוגרת. האתגר שלך הוא לפתוח אותה ולגרום לה להרגיש בנוח.",
    personaName: "רותם",
    personaAge: 25,
    personaGender: "female" as const,
    personaBackground:
      "סטודנטית לפסיכולוגיה, מירושלים. אינטרוברטית, אוהבת ספרים ומוזיקה קלאסית. מעט ניסיון בדייטינג.",
    personaPersonality:
      "שקטה ומסוגרת בהתחלה. זקוקה לזמן כדי להירגע. מגיבה טוב לשאלות עמוקות ולמי שסבלני. כשמתפתחת - מעניינת ועמוקה.",
    difficulty: "medium" as const,
    category: "דייט מאתגר",
    scenarioContext:
      "אתה יושב מול רותם במסעדה שקטה. היא לא אמרה הרבה מאז שהגעתם. מסתכלת על התפריט. ברור שהיא קצת עצבנית.",
    published: true,
    order: 2,
  },
  {
    title: "שיחה אחרי ויכוח",
    description:
      "אתם מכירים כבר כמה שבועות ואתמול הייתה ביניכם מחלוקת. עכשיו הוא מחפש לנקות את האוויר. זה מבחן למיומנות תקשורת שלך.",
    personaName: "יותם",
    personaAge: 31,
    personaGender: "male" as const,
    personaBackground:
      "עורך דין בתל אביב. ישיר ואסרטיבי, לפעמים קצת שתלטן. גדל עם אח בכיר ולמד לדפוק על השולחן. בסופו של דבר אוהב שלום.",
    personaPersonality:
      "ישיר ולפעמים נוטה לשים אצבע. אבל רוצה לפתור את זה. מגיב טוב למי שמודה ולוקח אחריות. מוכן להתרכך כשמרגיש שלוקחים אותו ברצינות.",
    difficulty: "hard" as const,
    category: "תקשורת",
    scenarioContext:
      "אתמול ויכחתם על תכניות לסוף השבוע. הוא עזב בלי להגיד שלום. עכשיו שלח לך 'אפשר לדבר?' ואתה נפגשים בבית קפה. הוא נראה מתוח.",
    published: true,
    order: 3,
  },
  {
    title: "דייט עם אדם עסוק מאוד",
    description:
      "היא מנהלת בחברת הייטק וחייה מלאים עד הגג. בדיוק הגיעה מישיבה ויש לה רק שעה. האתגר - להיות זכיר ומרשים בזמן קצר.",
    personaName: "נועה",
    personaAge: 33,
    personaGender: "female" as const,
    personaBackground:
      "מנהלת מוצר בחברת סטארטאפ. שאפתנית, חכמה, מאוד עסוקה. חייה מאורגנים בלוח זמנים. אוהבת אנשים שיש להם כיוון בחיים.",
    personaPersonality:
      "יעילה וחדה. מכבדת זמן שלה ושל אחרים. לא מתפתה על ידי חנופה. מגיבה טוב לאנשים שיודעים מה הם רוצים ומה הם שווים.",
    difficulty: "medium" as const,
    category: "דייט עם עסוק",
    scenarioContext:
      "נועה הגיעה חמש דקות לפני. היא כבר מסתכלת בטלפון כשאתה מגיע. מחייכת קצרות - 'יש לי שעה, אז בוא נתחיל'. האתגר להשאיר רושם.",
    published: true,
    order: 4,
  },
  {
    title: "השיחה על 'לאן זה הולך'",
    description:
      "אחרי חודש של פגישות, הוא מעלה את השאלה הכי קשה - מה יש בינינו? שיחה זו בוחנת את יכולתך לתקשר בכנות ובבשלות.",
    personaName: "עידו",
    personaAge: 30,
    personaGender: "male" as const,
    personaBackground:
      "מורה לביולוגיה, מחיפה. רגיש ומחושב. היה בשתי מערכות יחסים רציניות ולמד מהן הרבה. מחפש דבר אמיתי.",
    personaPersonality:
      "מתייחס ברצינות לשיחות חשובות. לא מסתפק בתשובות מטושטשות. יעריך כנות ובגרות. אם תתחמק - יחוש כישלון ויסתגר.",
    difficulty: "hard" as const,
    category: "שיחה מתקדמת",
    scenarioContext:
      "ערב שלישי בשבוע אחרי שאכלתם יחד. עידו שתק כמה רגעים ואז אמר: 'אני צריך לשאול אותך משהו. מה יש בינינו? כי אני מרגיש שאנחנו מאוד נהנים אבל לא דיברנו על זה.'",
    published: true,
    order: 5,
  },
] as const;

export const seedSimulatorScenarios = mutation({
  args: {},
  handler: async (ctx) => {
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
