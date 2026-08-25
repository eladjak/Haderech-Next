import { NextRequest, NextResponse } from "next/server";
import { aiGuard } from "@/lib/ai-guard";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  buildFaqGeminiRequest,
  FAQ_MAX_BODY_BYTES,
  validateFaqRequest,
} from "@/lib/chat-faq-contract";
import { detectHighRisk, HIGH_RISK_RESPONSE } from "@/../convex/lib/aiSafety";

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
- פרטיות: השאלה נשלחת ל-Google Gemini לצורך המענה. האתר אינו מוסיף אותה להיסטוריית החשבון, אך אין להבטיח סודיות מוחלטת או מחיקה מיידית אצל ספקי התשתית
- מחירים, אמצעי תשלום, תקופת גישה וביטול נקבעים רק לפי הסיכום שמוצג לפני תשלום
- עובד על דסקטופ ונייד

חוקים:
- אל תמציא פיצ'רים, מחירים או מספרים שלא הוזכרו כאן
- אל תיתן ייעוץ דייטינג עמוק. אפשר להפנות ל-/chat רק ככלי AI מוגבל לרפלקציה, לא כאדם או כאיש מקצוע
- בשאלה ספציפית על תשלום/חשבון — הפנה ל-/contact
- במקרה של סכנה, אלימות, איום או מצוקה חריפה — אל תיתן ייעוץ זוגי; הפנה לעמוד הבטיחות /course-safety ולשירותי החירום המתאימים
- אם אינך יודע — אמור זאת בהגינות`;

export async function POST(req: NextRequest) {
  // Rate limit (10/min/IP)
  if (!rateLimit(getClientIp(req), { windowMs: 60_000, max: 10 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > FAQ_MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        error: "REQUEST_TOO_LARGE",
        message: "השאלה ארוכה מדי. אפשר לקצר ולנסות שוב.",
      },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > FAQ_MAX_BODY_BYTES) {
      return NextResponse.json(
        {
          error: "REQUEST_TOO_LARGE",
          message: "השאלה ארוכה מדי. אפשר לקצר ולנסות שוב.",
        },
        { status: 413 }
      );
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "לא הצלחתי לקרוא את השאלה." },
      { status: 400 }
    );
  }

  const validation = validateFaqRequest(body, declaredLength);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.code, message: validation.message },
      { status: validation.status }
    );
  }

  if (detectHighRisk(validation.message)) {
    return NextResponse.json({ content: HIGH_RISK_RESPONSE, source: "safety" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI_UNAVAILABLE",
        message: "הצ'אט לא זמין כרגע. אפשר ליצור קשר דרך /contact.",
      },
      { status: 503 }
    );
  }

  try {
    // Spend guard: public unauthenticated endpoint on Elad's own Gemini key.
    // Per-IP window plus a SHARED per-site daily ceiling, so the cap holds
    // across serverless instances rather than resetting on every cold start.
    const _guard = await aiGuard(req, "haderech-next");
    if (!_guard.ok) {
      const status = _guard.reason === "unavailable" ? 503 : 429;
      return NextResponse.json(
        {
          error:
            _guard.reason === "daily"
              ? "DAILY_LIMIT"
              : _guard.reason === "rate"
                ? "RATE_LIMIT"
                : "AI_GUARD_UNAVAILABLE",
          message:
            status === 429
              ? "העוזר הגיע למגבלת השימוש שלו להיום. אפשר לנסות שוב מחר או לפנות דרך /contact."
              : "הצ'אט לא זמין כרגע. אפשר לנסות שוב מאוחר יותר.",
          retryable: status === 503,
        },
        { status }
      );
    }
    const r = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        ...buildFaqGeminiRequest(SYSTEM_PROMPT, validation.message),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!r.ok) {
      console.error("[chat-faq] Gemini request failed with status", r.status);
      return NextResponse.json(
        {
          error: "PROVIDER_UNAVAILABLE",
          message: "יש כרגע בעיה זמנית בצ'אט. אפשר לנסות שוב או לפנות דרך /contact.",
          retryable: true,
        },
        { status: 503 }
      );
    }

    const data = (await r.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) {
      return NextResponse.json(
        {
          error: "EMPTY_PROVIDER_RESPONSE",
          message: "לא התקבלה תשובה מהצ'אט. אפשר לנסות שוב בעוד רגע.",
          retryable: true,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ content, source: "live", provider: "gemini" });
  } catch (err) {
    console.error("[chat-faq] request failed", err instanceof Error ? err.name : "unknown");
    return NextResponse.json(
      {
        error: "CHAT_UNAVAILABLE",
        message: "יש כרגע בעיה זמנית בצ'אט. אפשר לנסות שוב בעוד רגע.",
        retryable: true,
      },
      { status: 503 }
    );
  }
}
