import { action } from "./_generated/server";
import { v } from "convex/values";

// =======================================
// Dating Tools - Phase 19
// כלי דייטינג אינטראקטיביים
// =======================================

// -----------------------------------------------
// Action: Conversation Starters Generator
// -----------------------------------------------

export const generateConversationStarters = action({
  args: {
    context: v.union(
      v.literal("first_date"),
      v.literal("dating_app"),
      v.literal("social"),
      v.literal("after_date")
    ),
    tone: v.union(
      v.literal("serious"),
      v.literal("casual"),
      v.literal("funny"),
      v.literal("romantic")
    ),
  },
  handler: async (_ctx, args): Promise<string[]> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const contextLabels: Record<string, string> = {
      first_date: "דייט ראשון פנים אל פנים",
      dating_app: "שיחה באפליקציית דייטינג (התחלת שיחה)",
      social: "מפגש חברתי / פגישה אקראית",
      after_date: "שיחה אחרי הדייט הראשון",
    };

    const toneLabels: Record<string, string> = {
      serious: "רציני ועמוק",
      casual: "קליל וטבעי",
      funny: "מצחיק ומשעשע",
      romantic: "רומנטי ומרגש",
    };

    const systemPrompt = `אתה מומחה לזוגיות ותקשורת בין אישית מטעם "אומנות הקשר".
תפקידך ליצור פותחי שיחה אותנטיים, מעניינים ויעילים בעברית.
הפותחים צריכים להיות טבעיים, לא מתאמצים, ומותאמים בדיוק לקונטקסט.`;

    const userPrompt = `צור 7 פותחי שיחה ייחודיים ומעניינים עבור הסיטואציה הבאה:

**קונטקסט:** ${contextLabels[args.context]}
**טון:** ${toneLabels[args.tone]}

הנחיות:
- כל פותח שיחה בשורה נפרדת
- הפותחים צריכים להיות בעברית טבעית
- אל תשתמש במספרים או בולטים
- כל פותח בטווח 1-3 משפטים
- הם צריכים לעורר סקרנות ולגרום לרצון להמשיך את השיחה
- אחד לפחות מהם צריך לכלול שאלה

החזר רק את הפותחים עצמם, שורה אחת לכל פותח שיחה.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content[0]?.text ?? "";
    const starters = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 10);

    return starters;
  },
});

// -----------------------------------------------
// Action: Profile Bio Generator
// -----------------------------------------------

export const generateProfileBio = action({
  args: {
    platform: v.union(
      v.literal("tinder"),
      v.literal("bumble"),
      v.literal("hinge"),
      v.literal("okcupid"),
      v.literal("general")
    ),
    age: v.number(),
    profession: v.string(),
    hobbies: v.string(),
    thingsYouLove: v.string(),
    lookingFor: v.string(),
    partnerQualities: v.string(),
  },
  handler: async (_ctx, args): Promise<string[]> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const platformLabels: Record<string, string> = {
      tinder: "Tinder (ביו קצר, מושך, עד 500 תווים)",
      bumble: "Bumble (ביו עם אישיות, עד 300 תווים)",
      hinge: "Hinge (תשובות לשאלות, עד 150 תווים כל אחת)",
      okcupid: "OkCupid (ביו ארוך יותר, פרופיל מפורט)",
      general: "כללי (מתאים לכל פלטפורמה, 200-400 תווים)",
    };

    const systemPrompt = `אתה כותב ביוגרפיות לפרופילי דייטינג בעברית - מקצועי, אותנטי ומושך.
אתה יודע בדיוק מה עובד בכל פלטפורמה ואיך להציג אנשים בצורה הטובה ביותר.`;

    const userPrompt = `כתוב 3 גרסאות שונות של ביו לפרופיל דייטינג עבור:

**פלטפורמה:** ${platformLabels[args.platform]}
**גיל:** ${args.age}
**מקצוע:** ${args.profession}
**תחביבים:** ${args.hobbies}
**דברים שאוהב/ת:** ${args.thingsYouLove}
**מחפש/ת:** ${args.lookingFor}
**תכונות שחשוב לי בפרטנר:** ${args.partnerQualities}

כתוב 3 גרסאות שונות בסגנונות שונים:
1. **ביו רציני ואמיתי** - מציג את האישיות בצורה כנה
2. **ביו קליל ומצחיק** - עם הומור עדין ותחושה טובה
3. **ביו רומנטי ושירי** - עם ניסוח יפה ומרגש

עבור כל ביו:
- כתוב בעברית טבעית ואותנטית
- שמור על הגבלת הפלטפורמה
- אל תשתמש בקלישאות כמו "אוהב לצחוק" סתם כך
- הכנס פרטים ספציפיים מהמידע שניתן

פרד בין הגרסאות עם: ---SEPARATOR---`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content[0]?.text ?? "";
    const bios = text
      .split("---SEPARATOR---")
      .map((bio) => bio.trim())
      .filter((bio) => bio.length > 20);

    return bios.slice(0, 3);
  },
});
