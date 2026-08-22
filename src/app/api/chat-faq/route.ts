import { NextRequest, NextResponse } from "next/server";
import { aiGuard } from "@/lib/ai-guard";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Latest GA Hebrew-strong model. WHY thinkingBudget:0 — without it, Gemini's hidden
// "thinking" tokens consume the entire maxOutputTokens budget and the visible answer
// comes back empty/truncated (same root-cause as bayit coaching-tip + sipurai chat).
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

const SYSTEM_PROMPT = `אתה צ'אטבוט ידידותי באתר "הדרך" — פלטפורמת למידה בעברית למיומנויות תקשורת, היכרות ודייטינג לרווקים ורווקות ישראלים.

ענה בעברית, חמה ואישית, תשובות קצרות (2-4 משפטים). אם משהו לא ברור — הפנה לדף הקשר או לכלי הרפלקציה ב-AI בכתובת /chat.

מה הדרך מציעה:
- קורס מרכזי בן 12 שבועות ו-75 שיעורים בעברית, עם 8 מסמכי תרגול
- כלי AI לתרגול ולמשוב, בכפוף לזמינות השירות ולמגבלות החשבון
- סימולטור שיחות וקהילת לומדים, בכפוף להרשאה ולזמינות

עקרונות:
- כל התכנים בעברית ומותאמים לתרבות הישראלית
- אפשר לעצור או לדלג על תרגיל; אין להציג את השירות כטיפול, אבחון או הבטחה לזוגיות
- ה-AI הוא כלי תמיכה — לא מחליף ייעוץ מקצועי בנושאים אישיים מורכבים
- פרטיות: הודעות עשויות להישמר בחשבון ונשלחות ל-Google Gemini לצורך מענה בצ'אט הזה; אין להבטיח סודיות מוחלטת או מחיקה מיידית
- מחירים, אמצעי תשלום, תקופת גישה וביטול נקבעים רק לפי הסיכום שמוצג לפני תשלום
- עובד על דסקטופ ונייד

חוקים:
- אל תמציא פיצ'רים, מחירים או מספרים שלא הוזכרו כאן
- אל תיתן ייעוץ דייטינג עמוק. אפשר להפנות ל-/chat רק ככלי AI מוגבל לרפלקציה, לא כאדם או כאיש מקצוע
- בשאלה ספציפית על תשלום/חשבון — הפנה ל-/contact
- במקרה של סכנה, אלימות, איום או מצוקה חריפה — אל תיתן ייעוץ זוגי; הפנה לעמוד הבטיחות /course-safety ולשירותי החירום המתאימים
- אם אינך יודע — אמור זאת בהגינות`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  // Rate limit (10/min/IP)
  if (!rateLimit(getClientIp(req), { windowMs: 60_000, max: 10 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      content: "הצ'אט עדיין בהרצה — בינתיים אפשר ליצור קשר דרך /contact או לדבר עם המאמן ב-/chat",
    });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await req.json()) as { messages?: ChatMessage[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  // Use only the last ~10 turns to keep prompt small.
  const recent = messages.slice(-10);
  const conversationText = recent
    .map((m) => `${m.role === "user" ? "משתמש" : "אסיסטנט"}: ${m.content}`)
    .join("\n");
  const fullPrompt = `${SYSTEM_PROMPT}\n\nשיחה עד כה:\n${conversationText}\n\nאסיסטנט:`;

  try {
    // Spend guard: public unauthenticated endpoint on Elad's own Gemini key.
    // Per-IP window plus a SHARED per-site daily ceiling, so the cap holds
    // across serverless instances rather than resetting on every cold start.
    const _guard = await aiGuard(req, "haderech-next");
    if (!_guard.ok) {
      return NextResponse.json({ content: "העוזר עמוס כרגע — אפשר לנסות שוב מאוחר יותר, או להשאיר פרטים בטופס ונחזור אליכם." });
    }
    const r = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "unknown");
      console.error("[chat-faq] Gemini failed:", r.status, errText.slice(0, 200));
      return NextResponse.json({
        content: "סליחה, יש בעיה זמנית. נסה שוב או צור קשר דרך /contact",
      });
    }

    const data = (await r.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) {
      return NextResponse.json({
        content: "סליחה, לא הצלחתי להבין את השאלה. תוכל לנסח אותה אחרת?",
      });
    }
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[chat-faq] error:", err);
    return NextResponse.json({
      content: "סליחה, נסה שוב בעוד רגע.",
    });
  }
}
