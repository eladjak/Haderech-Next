import { describe, it, expect } from "vitest";
import {
  updateConnection,
  moodFor,
  buildDirectorNote,
} from "../../convex/lib/director";
import {
  buildDeepDebrief,
  buildSkillRadar,
  pickKeyMoments,
  pickDrill,
} from "../../convex/lib/simulatorScoring";

describe("director — updateConnection", () => {
  it("rewards a question + empathy + sharing", () => {
    const r = updateConnection(
      50,
      "וואו, נשמע שהיה לך יום מטורף. אני מרגיש שאני רוצה לשמוע עוד — מה הכי קשה היה?"
    );
    expect(r.connection).toBeGreaterThan(50);
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it("does not punish a one-word answer", () => {
    const r = updateConnection(50, "סבבה");
    expect(r.connection).toBe(50);
  });

  it("does not punish a negative feeling", () => {
    const r = updateConnection(50, "היה נורא, המסעדה גרועה והמלצר מעצבן");
    expect(r.connection).toBe(50);
  });

  it("does not turn persona triggers into targets or penalties", () => {
    const base = updateConnection(50, "ספרי לי על העבודה שלך?");
    const withTrigger = updateConnection(50, "ספרי לי על העבודה שלך?", [
      "העבודה",
    ]);
    expect(withTrigger.connection).toBe(base.connection);
  });

  it("credits a clear boundary and penalizes coercion", () => {
    expect(updateConnection(50, "אני מעדיף לא להיכנס לזה").connection).toBeGreaterThan(50);
    expect(updateConnection(50, "את חייבת לענות לי").connection).toBeLessThan(50);
  });

  it("stays within 5..95 bounds", () => {
    expect(updateConnection(95, "מה? איך? למה? אני מרגיש שוואו מדהים").connection).toBeLessThanOrEqual(95);
    expect(updateConnection(6, "רע").connection).toBeGreaterThanOrEqual(5);
  });
});

describe("director — moodFor / buildDirectorNote", () => {
  it("maps meter to distinct moods", () => {
    expect(moodFor(90)).not.toBe(moodFor(20));
  });

  it("includes connection + mood + beat in the note", () => {
    const note = buildDirectorNote(62, 2, [
      { atTurn: 2, direction: "בדקי את הגבול שלו" },
    ]);
    expect(note).toContain("62/100");
    expect(note).toContain("בדקי את הגבול שלו");
    expect(note).toContain("הנחיית תרחיש");
    expect(note).toContain("אינו מדד למשיכה");
  });

  it("omits beat when none matches the turn", () => {
    const note = buildDirectorNote(50, 3, [
      { atTurn: 2, direction: "לא רלוונטי" },
    ]);
    expect(note).not.toContain("לא רלוונטי");
  });
});

describe("coach — deep debrief heuristics", () => {
  const msgs = [
    { content: "היי, נעים מאוד! ספרי לי על עצמך?" },
    { content: "סבבה" },
    { content: "אני מרגיש שזה מרגש אותי, האמת שקצת מפחיד. ואת - מה הכי חשוב לך?" },
    { content: "וואו מעניין. איך הגעת לתחום הזה?" },
  ];

  it("radar has all 5 axes in 10..95", () => {
    const radar = buildSkillRadar(msgs);
    for (const val of Object.values(radar)) {
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(95);
    }
    expect(Object.keys(radar).sort()).toEqual(
      ["courage", "depth", "emotion", "initiative", "leading"].sort()
    );
  });

  it("picks the short answer as a teachable moment", () => {
    const moments = pickKeyMoments(msgs);
    expect(moments.length).toBeGreaterThan(0);
    expect(moments.some((m) => m.quote === "סבבה")).toBe(true);
  });

  it("drill targets the weakest axis", () => {
    const drill = pickDrill({
      initiative: 90,
      emotion: 20,
      courage: 80,
      depth: 70,
      leading: 60,
    });
    expect(drill).toContain("אם נוח לך");
  });

  it("buildDeepDebrief returns score + moments + radar + drill", () => {
    const d = buildDeepDebrief(msgs);
    expect(d.score).toBeGreaterThan(0);
    expect(d.keyMoments.length).toBeGreaterThan(0);
    expect(d.drill.length).toBeGreaterThan(10);
    expect(d.skillRadar.initiative).toBeGreaterThan(0);
  });
});
