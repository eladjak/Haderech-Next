import { afterEach, describe, expect, it, vi } from "vitest";

describe("aiGuard shared spend ceiling", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("fails closed when the shared counter is not configured", async () => {
    vi.stubEnv("AI_GUARD_SUPABASE_URL", "");
    vi.stubEnv("AI_GUARD_SUPABASE_KEY", "");
    vi.resetModules();
    const { aiGuard } = await import("@/lib/ai-guard");
    const verdict = await aiGuard(
      new Request("https://example.test", {
        headers: { "x-forwarded-for": "203.0.113.77" },
      }),
      "test-site"
    );
    expect(verdict).toMatchObject({
      ok: false,
      reason: "unavailable",
      degraded: true,
    });
  });
});
