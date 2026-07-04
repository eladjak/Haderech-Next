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
  // Phase 22 — persona depth from Elad's typology (optional)
  personaArchetype?: string;
  attractionProfile?: string;
  openers?: string[];
  triggers?: string[];
}

function buildPersonaSystemPrompt(persona: SimulatorPersona): string {
  const genderHe = persona.personaGender === "female" ? "אישה" : "גבר";
  const difficultyNote =
    persona.difficulty === "easy"
      ? "אתה/את פתוח/ה, ידידותי/ת ומגיב/ה בחיוב לרוב הניסיונות לשיחה."
      : persona.difficulty === "medium"
        ? "יש לך אישיות מורכבת יותר. לפעמים אתה/את קצת שקט/ה או מסויג/ת, אבל מגיב/ה בחיוב לגישה נכונה."
        : "אתה/את קשה יותר לפיצוח. יש לך ציפיות גבוהות, אתה/את עלול/ה להיות ישיר/ה וביקורתי/ת אם המשתמש לא מתאמץ מספיק.";

  const depthLines = [
    persona.personaArchetype
      ? `טיפוס האישיות שלך: ${persona.personaArchetype}`
      : "",
    persona.attractionProfile
      ? `מה מושך אותך בעיקר (רמת המשיכה הדומיננטית שלך): ${persona.attractionProfile}`
      : "",
    persona.openers?.length
      ? `מה מקרב אותך אל מישהו: ${persona.openers.join("; ")}`
      : "",
    persona.triggers?.length
      ? `מה מרחיק/מכבה אותך (כשנוגעים בזה — הגב/י בהסתייגות, קור או שינוי נושא): ${persona.triggers.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `אתה משחק תפקיד של ${genderHe} ישראלי/ת בשם ${persona.personaName}, בן/בת ${persona.personaAge}.

רקע: ${persona.personaBackground}

אישיות: ${persona.personaPersonality}
${depthLines ? `\n${depthLines}\n` : ""}
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
  return `אתה המאמן של "אומנות הקשר" — מומחה לאימון דייטינג ותקשורת בינאישית עם 15+ שנות ניסיון.

תפקידך לנתח שיחת דייט מצד המשתמש (הצד ששולח הודעות role: "user") ולתת דיבריף-מאמן מעמיק: ציון, משוב, רגעי-מפתח מצוטטים, רדאר כישורים ותרגיל אחד להמשך.

נתח את:
1. יוזמה ופתיחות (האם המשתמש יזם, שאל שאלות, פתח נושאים?)
2. עניין ואמפתיה (האם הגיב באמת למה שהפרסונה שיתפה?)
3. הבעת רגש ופגיעות (האם שיתף משהו אמיתי משלו?)
4. ניהול והובלת השיחה (מעברים, איזון דיבור/הקשבה)
5. התאמה לרמת הקושי של הסיטואציה

רגעי-מפתח: בחר 2-3 ציטוטים מדויקים מהודעות המשתמש — רגע חזק אחד לפחות ורגע אחד לשיפור — והסבר קצר מה קרה שם ומה היה עובד טוב יותר.

רדאר כישורים (0-100 לכל ציר): initiative (יוזמה), emotion (הבעת רגש וצורך), courage (אומץ וגבולות), depth (עומק ופגיעות), leading (הובלה).

תרגיל: משימה אחת קונקרטית לסימולציה/דייט הבא, מנוסחת כהוראה ישירה.

החזר JSON בלבד (ללא טקסט לפני או אחרי):
{
  "score": <מספר 1-100>,
  "feedback": "<פסקת משוב כללית בעברית, 2-3 משפטים, בגובה העיניים>",
  "strengths": ["<חוזקה 1>", "<חוזקה 2>", "<חוזקה 3>"],
  "improvements": ["<שיפור 1>", "<שיפור 2>", "<שיפור 3>"],
  "keyMoments": [
    {"quote": "<ציטוט מדויק מהודעת המשתמש>", "analysis": "<מה קרה שם>", "better": "<מה היה עובד טוב יותר / מה לשמר>"}
  ],
  "skillRadar": {"initiative": <0-100>, "emotion": <0-100>, "courage": <0-100>, "depth": <0-100>, "leading": <0-100>},
  "drill": "<תרגיל אחד לפעם הבאה>"
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
      // Phase 22 — persona depth (optional)
      personaArchetype: v.optional(v.string()),
      attractionProfile: v.optional(v.string()),
      openers: v.optional(v.array(v.string())),
      triggers: v.optional(v.array(v.string())),
    }),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    // Phase 22 — the director's scene instruction for THIS turn
    directorNote: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<string | null> => {
    const ai = await generateChat({
      system:
        buildPersonaSystemPrompt(args.persona) + (args.directorNote ?? ""),
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
    keyMoments?: Array<{ quote: string; analysis: string; better: string }>;
    skillRadar?: {
      initiative: number;
      emotion: number;
      courage: number;
      depth: number;
      leading: number;
    };
    drill?: string;
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
      maxTokens: 1100,
      temperature: 0.3,
      keys: { geminiKey: args.geminiKey, anthropicKey: args.anthropicKey },
    });
    if (!ai) return null;

    const jsonMatch = ai.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null; // unparseable -> caller uses heuristic

    const clampScore = (n: unknown, fallback: number) =>
      typeof n === "number" ? Math.min(100, Math.max(0, Math.round(n))) : fallback;

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        score?: number;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
        keyMoments?: Array<{
          quote?: string;
          analysis?: string;
          better?: string;
        }>;
        skillRadar?: Record<string, number>;
        drill?: string;
      };

      const keyMoments = Array.isArray(parsed.keyMoments)
        ? parsed.keyMoments
            .filter((m) => m && m.quote && m.analysis)
            .slice(0, 3)
            .map((m) => ({
              quote: String(m.quote).slice(0, 220),
              analysis: String(m.analysis).slice(0, 300),
              better: String(m.better ?? "").slice(0, 300),
            }))
        : undefined;

      const radar = parsed.skillRadar;
      const skillRadar =
        radar && typeof radar === "object"
          ? {
              initiative: clampScore(radar.initiative, 50),
              emotion: clampScore(radar.emotion, 50),
              courage: clampScore(radar.courage, 50),
              depth: clampScore(radar.depth, 50),
              leading: clampScore(radar.leading, 50),
            }
          : undefined;

      return {
        score: clampScore(parsed.score, 60),
        feedback:
          parsed.feedback ??
          "הצלחת לנהל שיחה. המשך להתאמן כדי לשפר את הכישורים שלך.",
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.slice(0, 5)
          : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements.slice(0, 5)
          : [],
        ...(keyMoments && keyMoments.length > 0 ? { keyMoments } : {}),
        ...(skillRadar ? { skillRadar } : {}),
        ...(parsed.drill ? { drill: String(parsed.drill).slice(0, 300) } : {}),
      };
    } catch {
      return null;
    }
  },
});
