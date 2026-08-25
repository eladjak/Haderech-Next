import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PHASE_PROFILES,
  buildAdvisorSystemPrompt,
} from "../../convex/lib/advisorTemplates";

const chatSource = fs.readFileSync(
  path.resolve(process.cwd(), "convex/chat.ts"),
  "utf8"
);

describe("AI coaching content boundaries", () => {
  it("does not impersonate a human expert or invent outcome proof", () => {
    const prompt = buildAdvisorSystemPrompt(null);
    expect(prompt).toContain("כלי AI");
    expect(prompt).toContain("אל תציג את עצמך כאדם");
    expect(prompt).not.toMatch(/461|15\+\s*שנה/);
    expect(chatSource).not.toMatch(/עבדת עם למעלה מ-461|ניסיון של 15\+ שנה/);
  });

  it("carries consent, privacy and crisis rails in the live chat prompts", () => {
    expect(chatSource).toContain("אל תסיק הסכמה משפת גוף, שתיקה או אי-מענה");
    expect(chatSource).toContain("אל תבקש שמות, כתובות, צילומי מסך");
    expect(chatSource).toContain("/course-safety");
    expect(chatSource).toContain("אל תדמה קטין, אלימות, כפייה");
  });

  it("maps all six canonical learning phases", () => {
    expect(Object.keys(PHASE_PROFILES).map(Number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(PHASE_PROFILES[4].weeks).toBe("שבועות 8-10");
    expect(PHASE_PROFILES[5].weeks).toBe("שבוע 11");
    expect(PHASE_PROFILES[6].weeks).toBe("שבוע 12");
  });
});
