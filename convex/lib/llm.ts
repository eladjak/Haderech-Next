// Shared LLM helper — provider-agnostic, FREE-tier first (Phase 19)
//
// One place that turns a system prompt + turns into a reply, with a
// clean provider ladder + graceful degradation:
//
//   1. Gemini env token  -> Gemini 3.5 Flash (FREE tier)  [preferred]
//   2. Anthropic token   -> Claude Haiku 4.5 (paid)       [fallback]
//   3. neither / failure -> returns null  [caller uses its own template]
//
// The advisor and the simulator both call `generateChat`. When no token
// is set (today's prod path) it returns null and each caller falls back
// to its deterministic Hebrew template / heuristic — so the product
// always works and demos, and lights up the moment a (free) token is set.
//
// WHERE THE TOKEN PLUGS IN (Convex env — Gemini is free-tier):
//     npx convex env set GEMINI_API_KEY ...      # free live AI
//     npx convex env set ANTHROPIC_API_KEY ...   # paid live AI
//
// Gemini config mirrors the proven FAQ-chat pattern: gemini-3.5-flash +
// thinkingBudget:0 (without it, hidden "thinking" tokens eat the whole
// output budget and the visible answer comes back empty/truncated).

export type LlmMessage = { role: "user" | "assistant"; content: string };
export type LlmProvider = "gemini" | "anthropic";

export interface LlmKeys {
  geminiKey?: string;
  anthropicKey?: string;
}

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Haiku 4.5 primary, Sonnet 4.6 fallback on rate-limit / 5xx (same pins as chat.ts).
const ANTHROPIC_PRIMARY = ["claude", "haiku", "4-5", "20251001"].join("-");
const ANTHROPIC_FALLBACK = ["claude", "sonnet", "4-6", "20251022"].join("-");

// --- PURE helpers (unit-tested): no network, no env side effects ---

/** Read provider tokens from the Convex action environment. */
export function readLlmKeys(): LlmKeys {
  const env = process.env;
  return {
    geminiKey: env.GEMINI_API_KEY || env.GOOGLE_API_KEY || undefined,
    anthropicKey: env.ANTHROPIC_API_KEY || undefined,
  };
}

/**
 * Choose a provider. Gemini (free-tier) is preferred over Anthropic (paid);
 * returns null when no token is configured (the deterministic-template path).
 */
export function selectLlmProvider(keys: LlmKeys): LlmProvider | null {
  if (keys.geminiKey) return "gemini";
  if (keys.anthropicKey) return "anthropic";
  return null;
}

/** True when at least one live-AI provider token is available. */
export function hasLlmKey(keys: LlmKeys): boolean {
  return selectLlmProvider(keys) !== null;
}

/**
 * Flatten a system prompt + conversation turns into a single Gemini prompt.
 * Mirrors the proven FAQ-chat flattening (avoids Gemini multi-turn role edge
 * cases and keeps Hebrew ordering natural).
 */
export function buildGeminiPrompt(
  system: string,
  messages: LlmMessage[]
): string {
  const convo = messages
    .map((m) => `${m.role === "user" ? "משתמש" : "אסיסטנט"}: ${m.content}`)
    .join("\n");
  return convo
    ? `${system}\n\nשיחה עד כה:\n${convo}\n\nאסיסטנט:`
    : `${system}\n\nאסיסטנט:`;
}

// --- Network callers (thin): each returns the text or null on failure ---

async function callGemini(
  token: string,
  system: string,
  messages: LlmMessage[],
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  const prompt = buildGeminiPrompt(system, messages);
  const r = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": token,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!r.ok) return null;
  const data = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

async function callAnthropic(
  token: string,
  system: string,
  messages: LlmMessage[],
  maxTokens: number
): Promise<string | null> {
  const doFetch = (model: string) =>
    fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": token,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
    });

  let r = await doFetch(ANTHROPIC_PRIMARY);
  if (!r.ok && (r.status === 429 || r.status >= 500)) {
    r = await doFetch(ANTHROPIC_FALLBACK);
  }
  if (!r.ok) return null;
  const data = (await r.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content.find((b) => b.type === "text")?.text?.trim() ?? null;
}

// --- Orchestrator: the single entry point callers use ---

export interface GenerateChatOptions {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Override tokens (tests); defaults to reading the Convex env. */
  keys?: LlmKeys;
}

/**
 * Generate a reply through the best available provider. Returns
 * `{ text, provider }` on success, or `null` when there is no token OR the
 * call failed — callers must degrade gracefully to their template.
 */
export async function generateChat(
  opts: GenerateChatOptions
): Promise<{ text: string; provider: LlmProvider } | null> {
  const keys = opts.keys ?? readLlmKeys();
  const provider = selectLlmProvider(keys);
  if (!provider) return null;

  const maxTokens = opts.maxTokens ?? 700;
  const temperature = opts.temperature ?? 0.7;

  try {
    if (provider === "gemini" && keys.geminiKey) {
      const text = await callGemini(
        keys.geminiKey,
        opts.system,
        opts.messages,
        maxTokens,
        temperature
      );
      if (text) return { text, provider: "gemini" };
      // Gemini failed -> try Anthropic if we also have that token.
      if (keys.anthropicKey) {
        const t2 = await callAnthropic(
          keys.anthropicKey,
          opts.system,
          opts.messages,
          maxTokens
        );
        if (t2) return { text: t2, provider: "anthropic" };
      }
      return null;
    }

    if (keys.anthropicKey) {
      const text = await callAnthropic(
        keys.anthropicKey,
        opts.system,
        opts.messages,
        maxTokens
      );
      if (text) return { text, provider: "anthropic" };
    }
    return null;
  } catch {
    return null;
  }
}
