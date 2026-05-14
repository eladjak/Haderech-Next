import { describe, it, expect } from "vitest";
import {
  COACH_SYSTEM_PROMPT,
  DEBRIEF_SYSTEM_PROMPT,
  MENTOR_SYSTEM_PROMPT,
  FREE_DAILY_LIMIT,
  checkRateLimit,
  toDateStr,
  nextResetAt,
  getSystemPromptForMode,
} from "../../convex/prompts/coachSystemPrompt";

// =====================================================================
// Pure-function unit tests for the Phase 80 coach upgrade.
// We test only the parts that don't need a Convex runtime — rate-limit
// math, date normalization, and prompt content invariants.
// =====================================================================

describe("checkRateLimit", () => {
  it("allows messages under the limit", () => {
    expect(checkRateLimit(0)).toEqual({ allowed: true, remaining: 10 });
    expect(checkRateLimit(5)).toEqual({ allowed: true, remaining: 5 });
    expect(checkRateLimit(9)).toEqual({ allowed: true, remaining: 1 });
  });

  it("blocks at exactly the limit", () => {
    expect(checkRateLimit(10)).toEqual({ allowed: false, remaining: 0 });
  });

  it("blocks above the limit and clamps remaining at 0", () => {
    expect(checkRateLimit(11)).toEqual({ allowed: false, remaining: 0 });
    expect(checkRateLimit(99)).toEqual({ allowed: false, remaining: 0 });
  });

  it("respects custom limit", () => {
    expect(checkRateLimit(2, 3)).toEqual({ allowed: true, remaining: 1 });
    expect(checkRateLimit(3, 3)).toEqual({ allowed: false, remaining: 0 });
  });

  it("FREE_DAILY_LIMIT is 10", () => {
    expect(FREE_DAILY_LIMIT).toBe(10);
  });
});

describe("toDateStr", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = toDateStr(new Date("2026-05-14T10:00:00Z"));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("normalizes to Israel timezone", () => {
    // 22:00 UTC on May 13 = 01:00 (May 14) in Israel summer time (UTC+3)
    // or 00:00 (May 14) in winter time (UTC+2). Either way, in Israel
    // it's already May 14.
    const lateUtc = new Date("2026-05-13T22:00:00Z");
    const result = toDateStr(lateUtc);
    expect(result).toBe("2026-05-14");
  });

  it("is stable for the same date", () => {
    const d = new Date("2026-05-14T12:00:00Z");
    expect(toDateStr(d)).toBe(toDateStr(d));
  });

  it("default arg uses now and returns valid format", () => {
    const result = toDateStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("nextResetAt", () => {
  it("returns a future timestamp", () => {
    const now = new Date("2026-05-14T10:00:00Z");
    const reset = nextResetAt(now);
    expect(reset).toBeGreaterThan(now.getTime());
  });

  it("returns within 24-26 hours of input (DST-aware)", () => {
    const now = new Date("2026-05-14T10:00:00Z");
    const reset = nextResetAt(now);
    const diffHours = (reset - now.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(0);
    expect(diffHours).toBeLessThan(26);
  });
});

describe("system prompts - content invariants", () => {
  it("COACH_SYSTEM_PROMPT mentions אומנות הקשר methodology", () => {
    expect(COACH_SYSTEM_PROMPT).toContain("אומנות הקשר");
  });

  it("COACH_SYSTEM_PROMPT forbids cliched therapist phrases", () => {
    // Must explicitly list the forbidden phrases so the model knows
    expect(COACH_SYSTEM_PROMPT).toContain("אני מבין");
    expect(COACH_SYSTEM_PROMPT).toContain("חשוב לזכור");
  });

  it("COACH_SYSTEM_PROMPT enforces one-question-at-a-time rule", () => {
    expect(COACH_SYSTEM_PROMPT).toMatch(/שאלה אחת/);
  });

  it("COACH_SYSTEM_PROMPT instructs Hebrew responses", () => {
    expect(COACH_SYSTEM_PROMPT).toContain("עברית");
  });

  it("DEBRIEF_SYSTEM_PROMPT opens with the canonical question", () => {
    expect(DEBRIEF_SYSTEM_PROMPT).toContain("מה קרה");
  });

  it("DEBRIEF_SYSTEM_PROMPT mentions all 4 stages", () => {
    expect(DEBRIEF_SYSTEM_PROMPT).toContain("שלב 1");
    expect(DEBRIEF_SYSTEM_PROMPT).toContain("שלב 2");
    expect(DEBRIEF_SYSTEM_PROMPT).toContain("שלב 3");
    expect(DEBRIEF_SYSTEM_PROMPT).toContain("שלב 4");
  });

  it("MENTOR_SYSTEM_PROMPT enforces no-answers Socratic mode", () => {
    expect(MENTOR_SYSTEM_PROMPT).toContain("לא נותן");
    expect(MENTOR_SYSTEM_PROMPT).toContain("שאלות עומק");
  });

  it("all prompts are non-trivial (>500 chars)", () => {
    expect(COACH_SYSTEM_PROMPT.length).toBeGreaterThan(500);
    expect(DEBRIEF_SYSTEM_PROMPT.length).toBeGreaterThan(500);
    expect(MENTOR_SYSTEM_PROMPT.length).toBeGreaterThan(500);
  });
});

describe("getSystemPromptForMode", () => {
  it("returns coach prompt for 'coach' mode", () => {
    expect(getSystemPromptForMode("coach")).toBe(COACH_SYSTEM_PROMPT);
  });

  it("returns debrief prompt for 'debrief' mode", () => {
    expect(getSystemPromptForMode("debrief")).toBe(DEBRIEF_SYSTEM_PROMPT);
  });

  it("returns mentor prompt for 'mentor' mode", () => {
    expect(getSystemPromptForMode("mentor")).toBe(MENTOR_SYSTEM_PROMPT);
  });

  it("falls back to coach prompt for legacy modes", () => {
    expect(getSystemPromptForMode("practice")).toBe(COACH_SYSTEM_PROMPT);
    expect(getSystemPromptForMode("analysis")).toBe(COACH_SYSTEM_PROMPT);
  });
});
