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

  it("rewards a rich, curious, lengthy conversation with a higher score", () => {
    const rich = scoreConversationHeuristic([
      msg("היי, נעים מאוד! מה שלומך היום? ספרי לי קצת על עצמך בבקשה"),
      msg("איך את מרגישה עם כל הבלגן של הדייטים האונליין האלה?"),
      msg("מעניין מאוד. ולמה דווקא בחרת ללמוד את התחום הזה?"),
      msg("אני ממש מתחבר לזה. איך נראה יום מושלם בשבילך?"),
    ]);
    const sparse = scoreConversationHeuristic([msg("היי"), msg("אוקיי")]);
    expect(rich.score).toBeGreaterThan(sparse.score);
    expect(rich.score).toBeGreaterThanOrEqual(75);
  });

  it("credits asking questions as a strength", () => {
    const r = scoreConversationHeuristic([
      msg("מה את אוהבת לעשות בזמן הפנוי?"),
      msg("איך היה השבוע שלך?"),
      msg("ספרי לי עוד על הטיול שלך"),
    ]);
    expect(r.strengths.some((s) => s.includes("שאלות"))).toBe(true);
  });

  it("suggests asking more questions when the user asked none", () => {
    const r = scoreConversationHeuristic([
      msg("אוקיי."),
      msg("נחמד."),
      msg("בסדר גמור."),
    ]);
    expect(
      r.improvements.some((i) => i.includes("שאלות"))
    ).toBe(true);
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
