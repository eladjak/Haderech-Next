import { describe, it, expect } from "vitest";
import {
  buildGroundingBlock,
  uniqueRefs,
  TOP_K,
  MIN_SCORE,
  EMBED_DIMS,
} from "../../convex/lib/retrieval";
import { buildTemplateReply } from "../../convex/lib/advisorTemplates";

describe("retrieval — buildGroundingBlock", () => {
  it("returns empty string for no passages (free-degradation contract)", () => {
    expect(buildGroundingBlock([])).toBe("");
  });

  it("formats passages with their citation refs", () => {
    const block = buildGroundingBlock([
      { ref: "שיעור 30: שלוש רמות המשיכה", text: "משיכה שכלית, רגשית ופיזית." },
      { ref: 'הספר "אומנות הקשר" — פרק 3', text: "פגיעות היא המפתח." },
    ]);
    expect(block).toContain("[שיעור 30: שלוש רמות המשיכה]");
    expect(block).toContain("משיכה שכלית, רגשית ופיזית.");
    expect(block).toContain('[הספר "אומנות הקשר" — פרק 3]');
    expect(block).toContain("---");
    // citation instruction present
    expect(block).toContain("ציין את מקורו");
  });

  it("keeps sane retrieval constants", () => {
    expect(TOP_K).toBeGreaterThanOrEqual(3);
    expect(MIN_SCORE).toBeGreaterThan(0);
    expect(MIN_SCORE).toBeLessThan(1);
    expect(EMBED_DIMS).toBe(768);
  });
});

describe("retrieval — uniqueRefs", () => {
  it("dedupes refs preserving order", () => {
    const refs = uniqueRefs([
      { ref: "שיעור 1: פתיחה", text: "a" },
      { ref: "שיעור 2: המשך", text: "b" },
      { ref: "שיעור 1: פתיחה", text: "c" },
    ]);
    expect(refs).toEqual(["שיעור 1: פתיחה", "שיעור 2: המשך"]);
  });

  it("returns empty array for empty input", () => {
    expect(uniqueRefs([])).toEqual([]);
  });
});

describe("advisorTemplates — grammar-safe lesson reference (בהשיעור bug)", () => {
  it("never produces 'בהשיעור' when there is no lesson context", () => {
    const intents = ["היי", "אני תקוע ולא יודע", "איך מתקדמים?", "סתם שאלה"];
    for (const msg of intents) {
      const reply = buildTemplateReply(msg, null);
      expect(reply.text).not.toContain("בהשיעור");
    }
  });

  it("uses the quoted lesson title inside a ב prefix when context exists", () => {
    const reply = buildTemplateReply("אני תקוע", {
      lessonTitle: "פתיחת המסע",
      completedLessons: 0,
      totalLessons: 75,
      isLessonComplete: false,
      phaseNumber: 1,
    });
    expect(reply.text).toContain('ב"פתיחת המסע"');
    expect(reply.text).not.toContain("בהשיעור");
  });
});
