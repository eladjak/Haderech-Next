import OpenAI from "openai";

// וודא שיש לך את המשתנה הזה ב-.env
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// הגדרות ברירת מחדל עבור הסימולטור
export const SIMULATOR_MODEL = "gpt-4-turbo-preview";
export const SIMULATOR_TEMPERATURE = 0.7;
export const SIMULATOR_MAX_TOKENS = 500;

// תבנית בסיסית להנחיות המערכת
export const SYSTEM_PROMPT_TEMPLATE = `אתה מנחה וירטואלי המתמחה בתרגול תקשורת בינאישית.
אתה מדמה תרחיש: {scenario}
רמת קושי: {difficulty}

הנחיות:
1. שמור על אופי עקבי לאורך כל השיחה
2. הגב באופן טבעי ואמפתי
3. תן משוב בונה כשמתאים
4. התאם את התגובות לרמת הקושי של התרחיש
5. שמור על שיחה בעברית ברורה ונעימה

מטרת השיחה: {goal}`;

// פונקציה ליצירת הנחיות מערכת מותאמות אישית
export function createSystemPrompt(
  scenario: string,
  difficulty: string,
  goal: string,
): string {
  return SYSTEM_PROMPT_TEMPLATE.replace("{scenario}", scenario)
    .replace("{difficulty}", difficulty)
    .replace("{goal}", goal);
}
