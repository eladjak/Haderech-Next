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

// Hebrew range U+0590..U+05FF — if any Hebrew in subject or html, ensure dir=rtl wrapper.
const HEBREW_RE = /[֐-׿]/;

function ensureRtl(html: string, subject: string): string {
  const hasHebrew = HEBREW_RE.test(html) || HEBREW_RE.test(subject);
  if (!hasHebrew) return html;
  // If template already declares dir=rtl on html/body/wrapper, leave it.
  if (/dir\s*=\s*["']?rtl/i.test(html) || /direction\s*:\s*rtl/i.test(html)) return html;
  // Otherwise wrap. Preserves any tags inside.
  return `<div dir="rtl" lang="he" style="text-align:right;font-family:Heebo,Arial,sans-serif;line-height:1.7">${html}</div>`;
}

/**
 * Send an email via Resend API.
 *
 * When `RESEND_API_KEY` is not set the email is logged to the console instead,
 * allowing local development without an API key.
 *
 * Hebrew detection: any Hebrew chars in subject/html → auto-wrap in dir=rtl + right-align.
 * This guarantees Hebrew emails render correctly without each caller having to remember.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = options.from ?? DEFAULT_FROM;
  const html = ensureRtl(options.html, options.subject);

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
        html,
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
