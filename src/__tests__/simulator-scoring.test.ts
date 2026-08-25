import { describe, it, expect } from "vitest";
import { scoreConversationHeuristic } from "../../convex/lib/simulatorScoring";

const msg = (content: string) => ({ content });

describe("scoreConversationHeuristic (free-degradation scorer)", () => {
  it("scores an empty conversation at the floor and still gives feedback", () => {
    const r = scoreConversationHeuristic([]);
    expect(r.score).toBeGreaterThanOrEqual(30);
    expect(r.score).toBeLessThanOrEqual(92);
    expect(r.strengths.length).toBeGreaterThan(0);
    expect(r.improvements.length).toBeGreaterThan(0);
    expect(r.feedback).toContain("0 הודעות");
  });

  it("rewards contextual, respectful language over pressure", () => {
    const respectful = scoreConversationHeuristic([
      msg("נשמע שזה היה יום עמוס. מתאים לך לספר מה היה חשוב לך בו?"),
      msg("אני שומע. אפשר גם להחליף נושא אם נוח לך יותר."),
      msg("מעניין, ולדעתי אפשר להתקדם בקצב שנוח לשנינו."),
    ]);
    const pressuring = scoreConversationHeuristic([
      msg("את חייבת לענות ואין לך ברירה"),
    ]);
    expect(respectful.score).toBeGreaterThan(pressuring.score);
    expect(respectful.score).toBeLessThanOrEqual(85);
  });

  it("credits a context-appropriate question as a possible strength", () => {
    const r = scoreConversationHeuristic([
      msg("מה את אוהבת לעשות בזמן הפנוי?"),
      msg("איך היה השבוע שלך?"),
      msg("ספרי לי עוד על הטיול שלך"),
    ]);
    expect(r.strengths.some((s) => s.includes("שאלה"))).toBe(true);
  });

  it("offers one optional question when the user asked none", () => {
    const r = scoreConversationHeuristic([
      msg("אוקיי."),
      msg("נחמד."),
      msg("בסדר גמור."),
    ]);
    expect(
      r.improvements.some((i) => i.includes("שאלה אחת"))
    ).toBe(true);
  });

  it("does not penalize a short answer or a clear stop", () => {
    const short = scoreConversationHeuristic([msg("לא")]);
    const stopped = scoreConversationHeuristic([msg("אני רוצה לעצור")]);
    expect(short.score).toBeGreaterThanOrEqual(50);
    expect(stopped.score).toBeGreaterThanOrEqual(short.score);
    expect(stopped.feedback).toContain("עצירה אינן מורידות נקודות");
  });

  it("never returns more than 3 strengths / improvements", () => {
    const r = scoreConversationHeuristic([
      msg("היי, נעים מאוד! ספרי לי קצת על עצמך, מה את אוהבת לעשות?"),
      msg("איך את מרגישה עם זה? ולמה בעצם?"),
      msg("מעניין! ומה עוד חשוב לך בחיים ובקשר?"),
      msg("אני מתחבר לזה מאוד, ספרי לי עוד בבקשה"),
    ]);
    expect(r.strengths.length).toBeLessThanOrEqual(3);
    expect(r.improvements.length).toBeLessThanOrEqual(3);
  });
});
