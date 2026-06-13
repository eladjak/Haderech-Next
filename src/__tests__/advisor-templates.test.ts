import { describe, it, expect } from "vitest";
import {
  getPhaseProfile,
  buildAdvisorSystemPrompt,
  buildTemplateReply,
  PHASE_PROFILES,
  DEFAULT_PROFILE,
  type LessonContext,
} from "../../convex/lib/advisorTemplates";

const ctx = (over: Partial<LessonContext> = {}): LessonContext => ({
  lessonTitle: "הסיפור שאני מספר לעצמי",
  lessonDescription: "עבודה על אמונות פנימיות",
  weekNumber: 2,
  phaseNumber: 1,
  phaseName: "גישה",
  completedLessons: 3,
  totalLessons: 75,
  isLessonComplete: false,
  ...over,
});

describe("getPhaseProfile", () => {
  it("returns the matching phase profile for a known phase", () => {
    expect(getPhaseProfile(1).name).toBe("גישה");
    expect(getPhaseProfile(3).name).toBe("משיכה ומעבר");
    expect(getPhaseProfile(5).name).toBe("מחויבות");
  });

  it("falls back to DEFAULT_PROFILE for unknown / missing phase", () => {
    expect(getPhaseProfile(undefined)).toBe(DEFAULT_PROFILE);
    expect(getPhaseProfile(99)).toBe(DEFAULT_PROFILE);
  });

  it("every phase profile has concepts, skill and a simulator category", () => {
    for (const p of Object.values(PHASE_PROFILES)) {
      expect(p.concepts.length).toBeGreaterThan(0);
      expect(p.skill.length).toBeGreaterThan(0);
      expect(p.simulatorCategory.length).toBeGreaterThan(0);
      expect(p.applyPrompts.length).toBeGreaterThan(0);
    }
  });
});

describe("buildAdvisorSystemPrompt", () => {
  it("produces a base prompt with no lesson context", () => {
    const prompt = buildAdvisorSystemPrompt(null);
    expect(prompt).toContain("אומנות הקשר");
    expect(prompt).toContain('אמ"כ');
  });

  it("injects the lesson title, phase and progress when context is given", () => {
    const prompt = buildAdvisorSystemPrompt(ctx());
    expect(prompt).toContain("הסיפור שאני מספר לעצמי");
    expect(prompt).toContain("גישה");
    expect(prompt).toContain("3 מתוך 75");
  });
});

describe("buildTemplateReply (free-degradation brain)", () => {
  it("greets and references the current lesson + phase", () => {
    const r = buildTemplateReply("היי", ctx());
    expect(r.text).toContain("הסיפור שאני מספר לעצמי");
    expect(r.text.length).toBeGreaterThan(20);
  });

  it("handles rejection with empathy and offers the simulator", () => {
    const r = buildTemplateReply("קיבלתי דחייה וזה כואב", ctx());
    expect(r.suggestSimulator).toBe(true);
    expect(r.text).toContain("דחייה");
  });

  it("summarizes the lesson with phase concepts", () => {
    const r = buildTemplateReply("תסכם לי את השיעור", ctx());
    expect(r.suggestSimulator).toBe(true);
    // includes at least one concept bullet of phase 1
    expect(r.text).toContain("גבולות");
  });

  it("routes how-to questions to the phase skill and suggests practice", () => {
    const r = buildTemplateReply("איך אני מתחיל שיחה?", ctx({ phaseNumber: 3 }));
    expect(r.suggestSimulator).toBe(true);
    expect(r.text.length).toBeGreaterThan(30);
  });

  it("works with no lesson context (default profile)", () => {
    const r = buildTemplateReply("אני קצת תקוע", null);
    expect(r.text.length).toBeGreaterThan(10);
    expect(typeof r.suggestSimulator).toBe("boolean");
  });

  it("never returns an empty reply for any intent", () => {
    const samples = [
      "היי",
      "אני מיואש ולא יודע מה לעשות",
      "רוצה לתרגל סימולציה",
      "מה למדתי פה",
      "ספר לי משהו",
    ];
    for (const s of samples) {
      const r = buildTemplateReply(s, ctx({ phaseNumber: 2 }));
      expect(r.text.trim().length).toBeGreaterThan(0);
    }
  });
});
