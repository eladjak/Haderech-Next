import { describe, it, expect, afterEach } from "vitest";
import {
  selectLlmProvider,
  hasLlmKey,
  buildGeminiPrompt,
  readLlmKeys,
  type LlmMessage,
} from "../../convex/lib/llm";

describe("selectLlmProvider (provider ladder)", () => {
  it("prefers Gemini (free-tier) when both tokens are set", () => {
    expect(
      selectLlmProvider({ geminiKey: "g", anthropicKey: "a" })
    ).toBe("gemini");
  });

  it("uses Gemini when only Gemini is set", () => {
    expect(selectLlmProvider({ geminiKey: "g" })).toBe("gemini");
  });

  it("falls back to Anthropic when only Anthropic is set", () => {
    expect(selectLlmProvider({ anthropicKey: "a" })).toBe("anthropic");
  });

  it("returns null when no token is set (template path)", () => {
    expect(selectLlmProvider({})).toBeNull();
    expect(hasLlmKey({})).toBe(false);
  });

  it("hasLlmKey is true when any token exists", () => {
    expect(hasLlmKey({ geminiKey: "g" })).toBe(true);
    expect(hasLlmKey({ anthropicKey: "a" })).toBe(true);
  });
});

describe("buildGeminiPrompt", () => {
  it("includes the system prompt and the assistant cue", () => {
    const p = buildGeminiPrompt("SYSTEM", []);
    expect(p).toContain("SYSTEM");
    expect(p).toContain("אסיסטנט:");
  });

  it("renders each turn with a Hebrew role label", () => {
    const messages: LlmMessage[] = [
      { role: "user", content: "היי" },
      { role: "assistant", content: "שלום" },
    ];
    const p = buildGeminiPrompt("SYS", messages);
    expect(p).toContain("משתמש: היי");
    expect(p).toContain("אסיסטנט: שלום");
  });

  it("omits the empty-history block when there are no turns", () => {
    const p = buildGeminiPrompt("SYS", []);
    expect(p).not.toContain("שיחה עד כה:");
  });
});

describe("readLlmKeys", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("reads GEMINI_API_KEY and ANTHROPIC_API_KEY from env", () => {
    process.env.GEMINI_API_KEY = "gkey";
    process.env.ANTHROPIC_API_KEY = "akey";
    const keys = readLlmKeys();
    expect(keys.geminiKey).toBe("gkey");
    expect(keys.anthropicKey).toBe("akey");
  });

  it("falls back to GOOGLE_API_KEY for Gemini", () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GOOGLE_API_KEY = "googlekey";
    expect(readLlmKeys().geminiKey).toBe("googlekey");
  });

  it("returns undefined tokens when env is empty (no provider)", () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const keys = readLlmKeys();
    expect(keys.geminiKey).toBeUndefined();
    expect(keys.anthropicKey).toBeUndefined();
    expect(hasLlmKey(keys)).toBe(false);
  });
});
