import OpenAI from "openai";
import { env } from "@/env.mjs";
import type { _Message } from "@/types/simulator";

/**
 * מיפוי של כישורים שהבוט יכול ללמד
 */
interface Skill {
  description: string;
  exercises: string[];
  challenges?: string[];
}

/**
 * ממשק בסיסי של הבוט
 */
interface Bot {
  skills: Map<string, Skill>;
  addSkill: (name: string, skill: Skill) => void;
  getSkill: (name: string) => Skill | undefined;
}

/**
 * מחלקת הבוט הראשית
 */
class ChatBot implements Bot {
  skills: Map<string, Skill>;

  constructor() {
    this.skills = new Map();
  }

  addSkill(name: string, skill: Skill) {
    this.skills.set(name, skill);
  }

  getSkill(name: string) {
    return this.skills.get(name);
  }
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * מוסיף יכולות מתקדמות לבוט
 */
export const enhanceBotCapabilities = (bot: Bot) => {
  // הוספת כישורים בסיסיים
  bot.addSkill("תקשורת", {
    description: "יכולת לנהל שיחה ברורה ואמפתית",
    exercises: ["תרגול שיחה", "משחקי תפקידים"],
  });

  bot.addSkill("פתרון בעיות", {
    description: "יכולת לזהות ולפתור בעיות",
    exercises: ["תרגילי חשיבה", "פתרון תרחישים"],
  });

  bot.addSkill("למידה", {
    description: "יכולת ללמוד ולהתפתח",
    exercises: ["תרגילי למידה", "משימות אתגר"],
  });

  return bot;
};

/**
 * יוצר מופע חדש של הבוט
 */
export const createBot = (): Bot => {
  const bot = new ChatBot();
  return enhanceBotCapabilities(bot);
};

/**
 * מייצר תגובה מותאמת אישית לקלט המשתמש
 */
export const generateResponse = (input: string, bot: Bot): string => {
  const topic = identifyTopic(input);
  const skill = bot.getSkill(topic);

  if (skill) {
    return generateSkillBasedResponse(skill);
  }

  return getFallbackResponse();
};

/**
 * מייצר תגובת בוט באמצעות OpenAI
 */
export async function generateBotResponse(
  input: string
): Promise<{ message: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "אתה עוזר אישי אמפתי ומקצועי. תפקידך לסייע למשתמשים בצורה ברורה ומועילה.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    const message = content
      ? content
      : "מצטער, לא הצלחתי לייצר תשובה. אנא נסה שוב.";

    return { message };
  } catch (error) {
    console.error("Error generating bot response:", error);
    throw new Error("שגיאה בייצור תשובת הבוט");
  }
}

/**
 * מחזיר תגובת ברירת מחדל במקרה של שגיאה
 */
function getFallbackResponse(): string {
  const fallbackResponses = [
    "אני לא בטוח שהבנתי. אפשר להסביר שוב?",
    "סליחה, אני צריך עוד מידע כדי לעזור.",
    "בוא ננסה לנסח את זה אחרת.",
  ];

  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
}

// פונקציות עזר פנימיות
function identifyTopic(input: string): string {
  const topics = {
    תקשורת: ["לדבר", "להסביר", "לשוחח", "לתקשר", "להקשיב", "להבין", "לשתף"],
    "פתרון בעיות": [
      "בעיה",
      "פתרון",
      "לפתור",
      "לתקן",
      "לשפר",
      "להתמודד",
      "אתגר",
    ],
    למידה: ["ללמוד", "להבין", "לתרגל", "להתפתח", "להשתפר", "ידע", "מידע"],
  };

  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some((keyword) => input.includes(keyword))) {
      return topic;
    }
  }

  return "תקשורת"; // ברירת מחדל
}

function generateSkillBasedResponse(skill: Skill): string {
  const responses = [
    `אני יכול לעזור לך עם ${skill.description}.`,
    `בוא נעבוד יחד על ${skill.description}.`,
    `אני מומחה ב${skill.description}.`,
  ];

  const randomIndex = Math.floor(Math.random() * skill.exercises.length);
  const exercise = skill.exercises[randomIndex];
  responses.push(`אני ממליץ לנסות את התרגיל הבא: ${exercise}`);

  return responses[Math.floor(Math.random() * responses.length)];
}
