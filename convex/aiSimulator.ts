import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { generateChat } from "./lib/llm";

// AI Simulator - Phase 17 (Phase 19: multi-provider).
// A live-AI dating persona + coach analysis. Runs on whichever provider
// is configured (Gemini free-tier preferred, then Claude); returns null
// when no provider is available so the simulator degrades to its
// persona-flavored template / heuristic scorer.

interface SimulatorPersona {
  personaName: string;
  personaAge: number;
  personaGender: "male" | "female";
  personaBackground: string;
  personaPersonality: string;
  scenarioContext: string;
  difficulty: "easy" | "medium" | "hard";
}

function buildPersonaSystemPrompt(persona: SimulatorPersona): string {
  const genderHe = persona.personaGender === "female" ? "אישה" : "גבר";
  const difficultyNote =
    persona.difficulty === "easy"
      ? "אתה/את פתוח/ה, ידידותי/ת ומגיב/ה בחיוב לרוב הניסיונות לשיחה."
      : persona.difficulty === "medium"
        ? "יש לך אישיות מורכבת יותר. לפעמים אתה/את קצת שקט/ה או מסויג/ת, אבל מגיב/ה בחיוב לגישה נכונה."
        : "אתה/את קשה יותר לפיצוח. יש לך ציפיות גבוהות, אתה/את עלול/ה להיות ישיר/ה וביקורתי/ת אם המשתמש לא מתאמץ מספיק.";

  return `אתה משחק תפקיד של ${genderHe} ישראלי/ת בשם ${persona.personaName}, בן/בת ${persona.personaAge}.

רקע: ${persona.personaBackground}

אישיות: ${persona.personaPersonality}

הקשר הסיטואציה: ${persona.scenarioContext}

הנחיות לתפקיד:
1. דבר/י בעברית טבעית, יומיומית - לא רשמית ולא ספרותית
2. היה/י עקבי/ת עם האישיות והרקע שתואר
3. הגב/י באופן ריאלי לדברי המשתמש - הרגש עניין, היסוס, חיוך, לפעמים גם אי-נחת
4. תשובות בינוניות באורכן (2-4 משפטים לרוב) - לא קצרות מדי ולא ארוכות מדי
5. לפעמים שאל/י שאלות חוזרות כדי להראות עניין
6. אל/י תשבור/י את התפקיד - אתה/את הפרסונה, לא AI
7. ${difficultyNote}
8. אם המשתמש אומר דברים לא נכונים חברתית, הגב/י בהתאם (קצת נסיגה, שינוי נושא, וכו')

אסור לך:
- לחשוף שאתה AI
- לדבר על נושאים פוגעניים, אלימות, או תוכן לא ראוי
- לצאת מהתפקיד

התחל/י את השיחה בצורה טבעית בהתאם לסיטואציה.`;
}

function buildAnalysisSystemPrompt(): string {
  return `אתה מומחה לאימון בתחום הדייטינג והתקשורת הבינאישית.

תפקידך לנתח שיחת דייט מסוד המשתמש (הצד ששולח הודעות role: "user") ולתת ציון ומשוב בנייה.

נתח את:
1. יוזמה ופתיחות (האם המשתמש יזם שיחה, שאל שאלות?)
2. עניין ואמפתיה (האם הראה עניין אמיתי בפרסונה?)
3. הומור ושפה חיובית
4. ניהול השיחה (ניווט חלק, מעברים טבעיים)
5. התאמה לרמת הקושי של הסיטואציה

החזר JSON בלבד בפורמט הבא (ללא מדינה קודמת, רק JSON):
{
  "score": <מספר 1-100>,
  "feedback": "<פסקת משוב כללית בעברית, 2-3 משפטים>",
  "strengths": ["<חוזקה 1 בעברית>", "<חוזקה 2>", "<חוזקה 3>"],
  "improvements": ["<שיפור 1 בעברית>", "<שיפור 2>", "<שיפור 3>"]
}`;
}

// Internal action: get a live persona response (Gemini free-tier or Claude).
// Returns null when no provider token is set OR the call failed, so the
// caller (simulator.sendMessage) uses its persona-flavored template.
export const getPersonaResponse = internalAction({
  args: {
    geminiKey: v.optional(v.string()),
    anthropicKey: v.optional(v.string()),
    persona: v.object({
      personaName: v.string(),
      personaAge: v.number(),
      personaGender: v.union(v.literal("male"), v.literal("female")),
      personaBackground: v.string(),
      personaPersonality: v.string(),
      scenarioContext: v.string(),
      difficulty: v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      ),
    }),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, args): Promise<string | null> => {
    const ai = await generateChat({
      system: buildPersonaSystemPrompt(args.persona),
      messages: args.conversationHistory,
      maxTokens: 400,
      keys: { geminiKey: args.geminiKey, anthropicKey: args.anthropicKey },
    });
    return ai?.text ?? null;
  },
});

// Internal action: analyze the conversation -> score + feedback. Returns
// null when no provider is available OR the model output can't be parsed,
// so the caller (simulator.endSession) uses its heuristic scorer.
export const analyzeConversation = internalAction({
  args: {
    geminiKey: v.optional(v.string()),
    anthropicKey: v.optional(v.string()),
    scenarioTitle: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (
    _ctx,
    args
  ): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null> => {
    const userPrompt = `נתח את השיחה הבאה מתרחיש: "${args.scenarioTitle}" (רמת קושי: ${args.difficulty})

השיחה:
${args.conversationHistory
  .map((m) => `${m.role === "user" ? "המשתמש" : "הפרסונה"}: ${m.content}`)
  .join("\n\n")}

החזר ניתוח JSON בלבד.`;

    const ai = await generateChat({
      system: buildAnalysisSystemPrompt(),
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 600,
      temperature: 0.3,
      keys: { geminiKey: args.geminiKey, anthropicKey: args.anthropicKey },
    });
    if (!ai) return null;

    const jsonMatch = ai.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null; // unparseable -> caller uses heuristic

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        score?: number;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
      };
      return {
        score: Math.min(100, Math.max(0, parsed.score ?? 60)),
        feedback:
          parsed.feedback ??
          "הצלחת לנהל שיחה. המשך להתאמן כדי לשפר את הכישורים שלך.",
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.slice(0, 5)
          : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements.slice(0, 5)
          : [],
      };
    } catch {
      return null;
    }
  },
});
