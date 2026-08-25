import { describe, expect, it } from "vitest";
import {
  detectHighRisk,
  HIGH_RISK_RESPONSE,
} from "../../convex/lib/aiSafety";

describe("detectHighRisk", () => {
  it.each([
    ["אני חושב להתאבד", "self-harm"],
    ["אני לא רוצה לחיות", "self-harm"],
    ["מישהו מאיים עלי ויש סכנה מיידית", "violence"],
    ["קטינה בת 15 ותמונה מינית", "minor-safety"],
  ])("routes %s to %s", (text, category) => {
    expect(detectHighRisk(text)).toBe(category);
  });

  it.each([
    "אני מיואש מהדייט האחרון",
    "קשה לי להתחיל שיחה",
    "אנחנו מדברים על גבולות ואלימות בסרט",
    "אני רוצה לעצור את התרגול",
  ])("does not turn ordinary distress or course language into a crisis", (text) => {
    expect(detectHighRisk(text)).toBeNull();
  });

  it("provides direct human Hebrew without pretending to be emergency care", () => {
    expect(HIGH_RISK_RESPONSE).toContain("100");
    expect(HIGH_RISK_RESPONSE).toContain("101");
    expect(HIGH_RISK_RESPONSE).toContain("/course-safety");
    expect(HIGH_RISK_RESPONSE).toContain("לא שירות חירום");
  });
});
