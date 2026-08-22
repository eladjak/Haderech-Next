import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const home = read("src/app/page.tsx");
const about = read("src/app/about/page.tsx");
const chat = read("src/app/chat/page.tsx");
const feedback = read("src/components/simulator/session-feedback.tsx");
const history = read("src/app/simulator/history/page.tsx");

describe("public LMS product truth", () => {
  it("uses canonical course counts and contains unavailable purchases", () => {
    expect(home).toContain("12 שבועות • 75 שיעורים • 8 מסמכי תרגול");
    expect(home).toContain("הרכישה המקוונת עדיין לא פתוחה");
    expect(home).toContain("VERIFIED_PUBLIC_STORIES_AVAILABLE: boolean = false");
    expect(home).not.toMatch(/461\s+זוג|1000\+|95%|90\+ שיעורים|שינוי אמיתי/);
  });

  it("does not impersonate a human coach or invent experience proof", () => {
    expect(chat).toContain("כלי AI, לא אדם, מטפל או שירות חירום");
    expect(chat).toContain("Gemini או Anthropic");
    expect(chat).not.toMatch(/15\+ שנות|461 זוגות|המאמן שלך כאן/);
    expect(about).not.toMatch(/15 שנות|מאות זוגות/);
  });

  it("does not present free-chat feedback as a personal score", () => {
    expect(feedback).not.toContain("ScoreRing");
    expect(feedback).not.toContain("מתוך 100");
    expect(feedback).toContain("אינו אבחון");
    expect(history).not.toContain("ציון ממוצע");
    expect(history).toContain("אין כאן ציון אישי");
  });
});
