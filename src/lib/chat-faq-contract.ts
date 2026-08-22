export const FAQ_MAX_BODY_BYTES = 6_000;
export const FAQ_MAX_MESSAGE_CHARS = 1_500;

export type FaqRequestValidation =
  | { ok: true; message: string }
  | { ok: false; status: 400 | 413; code: string; message: string };

export function validateFaqRequest(
  body: unknown,
  contentLength?: number | null
): FaqRequestValidation {
  if (
    typeof contentLength === "number" &&
    Number.isFinite(contentLength) &&
    contentLength > FAQ_MAX_BODY_BYTES
  ) {
    return {
      ok: false,
      status: 413,
      code: "REQUEST_TOO_LARGE",
      message: "השאלה ארוכה מדי. אפשר לקצר ולנסות שוב.",
    };
  }

  try {
    if (new TextEncoder().encode(JSON.stringify(body)).byteLength > FAQ_MAX_BODY_BYTES) {
      return {
        ok: false,
        status: 413,
        code: "REQUEST_TOO_LARGE",
        message: "השאלה ארוכה מדי. אפשר לקצר ולנסות שוב.",
      };
    }
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_REQUEST",
      message: "לא הצלחתי לקרוא את השאלה.",
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_REQUEST",
      message: "לא הצלחתי לקרוא את השאלה.",
    };
  }

  const record = body as Record<string, unknown>;
  // Conversation history is not accepted from this public client: accepting
  // assistant turns would let a visitor forge replies that never came from us.
  if ("messages" in record) {
    return {
      ok: false,
      status: 400,
      code: "CLIENT_HISTORY_NOT_ACCEPTED",
      message: "שלחו שאלה אחת בכל פעם, בלי היסטוריית תשובות מצורפת.",
    };
  }

  if (typeof record.message !== "string") {
    return {
      ok: false,
      status: 400,
      code: "MESSAGE_REQUIRED",
      message: "צריך לכתוב שאלה לפני השליחה.",
    };
  }

  const message = record.message.trim();
  if (!message) {
    return {
      ok: false,
      status: 400,
      code: "MESSAGE_REQUIRED",
      message: "צריך לכתוב שאלה לפני השליחה.",
    };
  }
  if (message.length > FAQ_MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      status: 413,
      code: "MESSAGE_TOO_LONG",
      message: `השאלה ארוכה מדי. אפשר לכתוב עד ${FAQ_MAX_MESSAGE_CHARS} תווים.`,
    };
  }

  return { ok: true, message };
}

export function buildFaqGeminiRequest(system: string, message: string) {
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user" as const, parts: [{ text: message }] }],
  };
}
