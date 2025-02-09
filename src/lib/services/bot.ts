import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

import { env } from "@/env.mjs";

/**
 * מיפוי של כישורים שהבוט יכול ללמד
 */
interface Skill {
  description: string;
  exercises?: string[];
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

/**
 * מוסיף יכולות מתקדמות לבוט
 */
export const enhanceBotCapabilities = (bot: Bot) => {
  // תקשורת בינאישית
  bot.addSkill("communication", {
    description: "שיפור מיומנויות תקשורת בינאישית",
    exercises: ["תרגול שיחה פתוחה", "הקשבה אקטיבית", "שפת גוף חיובית"],
  });

  // ניהול קונפליקטים
  bot.addSkill("conflict_resolution", {
    description: "פתרון קונפליקטים בצורה בונה",
    exercises: [
      "זיהוי מקור הקונפליקט",
      "מציאת פתרונות win-win",
      "תקשורת לא אלימה",
    ],
  });

  // אמפתיה
  bot.addSkill("empathy", {
    description: "פיתוח אמפתיה והבנה רגשית",
    exercises: ["זיהוי רגשות", "הבנת נקודת מבט של האחר", "תגובה אמפתית"],
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
  // זיהוי נושא השיחה
  const topic = identifyTopic(input.toLowerCase());
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
  input: string,
): Promise<{ message: string }> {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "אתה מאמן יחסים אמפתי ותומך. תפקידך לעזור למשתמשים לשפר את מערכות היחסים שלהם באמצעות עצות מעשיות ותובנות.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const message =
      response.choices[0]?.message?.content || getFallbackResponse();

    // שמירת האינטראקציה במסד הנתונים
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    await supabase.from("chat_history").insert([
      {
        user_message: input,
        bot_response: message,
        created_at: new Date().toISOString(),
      },
    ]);

    return { message };
  } catch (error) {
    console.error("Error generating bot response:", error);
    return { message: getFallbackResponse() };
  }
}

/**
 * מחזיר תגובת ברירת מחדל במקרה של שגיאה
 */
function getFallbackResponse(): string {
  const fallbackResponses = [
    "אני מבין את הנקודה שלך. בוא נחשוב יחד על דרכים להתמודד עם זה.",
    "זה נשמע מאתגר. אשמח לעזור לך למצוא פתרון.",
    "תודה ששיתפת. בוא ננסה לחשוב על זה מזווית אחרת.",
    "אני כאן כדי לעזור. בוא נפרק את זה לצעדים קטנים יותר.",
  ];
  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
}

// פונקציות עזר פנימיות
function identifyTopic(input: string): string {
  if (
    input.includes("תקשורת") ||
    input.includes("שיחה") ||
    input.includes("דיבור")
  ) {
    return "communication";
  }
  if (
    input.includes("ריב") ||
    input.includes("מריבה") ||
    input.includes("קונפליקט")
  ) {
    return "conflict_resolution";
  }
  if (
    input.includes("רגש") ||
    input.includes("הבנה") ||
    input.includes("אמפתיה")
  ) {
    return "empathy";
  }
  return "general";
}

function generateSkillBasedResponse(skill: Skill): string {
  return skill.description;
}
