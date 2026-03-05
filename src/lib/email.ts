// ─── Email Sending Utility ───────────────────────────────────────────────────
// Abstraction over Resend API with console fallback for development.
// Does NOT require the `resend` npm package – uses raw fetch against the REST API.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_FROM = "הדרך <noreply@ohlove.co.il>";

/**
 * Send an email via Resend API.
 *
 * When `RESEND_API_KEY` is not set the email is logged to the console instead,
 * allowing local development without an API key.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = options.from ?? DEFAULT_FROM;

  // ── Development fallback ────────────────────────────────────────────────
  if (!apiKey) {
    console.log("[Email Dev] Would send:", {
      to: options.to,
      subject: options.subject,
      from,
    });
    return { success: true, id: `dev-${Date.now()}` };
  }

  // ── Production – Resend REST API ────────────────────────────────────────
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = (await response.json()) as { id: string };
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
