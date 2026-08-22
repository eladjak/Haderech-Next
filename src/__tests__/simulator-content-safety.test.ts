import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const aiSimulator = read("convex/aiSimulator.ts");
const simulator = read("convex/simulator.ts");
const director = read("convex/lib/director.ts");
const scoring = read("convex/lib/simulatorScoring.ts");
const feedback = read("src/components/simulator/session-feedback.tsx");
const scenarioPage = read("src/app/simulator/[scenarioId]/page.tsx");
const simulatorLanding = read("src/app/simulator/page.tsx");
const scenarioSeeds = read("convex/seedSimulatorData.ts");
const scenarioEnrichment = read("convex/seedScenariosV2.ts");
const simulatorChat = read("src/components/simulator/simulator-chat.tsx");

describe("simulator content and consent boundaries", () => {
  it("is transparent about AI and refuses minor personas", () => {
    expect(aiSimulator).toContain("שזה תרגול עם דמות AI בדיונית");
    expect(aiSimulator).toContain("Simulator personas must be adults");
    expect(simulator).toContain("Simulator personas must be adults");
    expect(aiSimulator).not.toContain("אל/י תשבור/י את התפקיד - אתה/את הפרסונה, לא AI");
    expect(aiSimulator).not.toContain("לחשוף שאתה AI");
  });

  it("does not frame boundaries as resistance to overcome", () => {
    for (const source of [aiSimulator, director, scoring, feedback]) {
      expect(source).not.toMatch(/קשה יותר לפיצוח|להרוויח או להפסיד את הקרבה|פגיעות מקרבת/);
    }
    expect(aiSimulator).toContain("אין שום מטרה 'לפצח' את הדמות");
    expect(director).toContain("גבול, סירוב, פרטיות או רצון לעצור אינם כישלון");
    expect(scoring).toContain("פרטיות, תשובה קצרה או עצירה אינן מורידות נקודות");
  });

  it("labels the feedback as limited and discloses external processors", () => {
    expect(feedback).toContain("אינו אבחון");
    expect(feedback).toContain("אינו מודד משיכה, התאמה, הסכמה");
    expect(scenarioPage).toContain("Gemini או Anthropic");
    expect(scenarioPage).toContain("אל תכתוב/י פרטים מזהים או מידע רגיש");
    expect(scenarioPage).toContain("מותר לענות בקצרה, לדלג, להציב גבול");
  });

  it("keeps the unreviewed structured dialogue path fail-closed", () => {
    expect(simulator).toContain("STRUCTURED_DIALOGUE_AVAILABLE: boolean = false");
    expect(simulator).toContain("requireStructuredDialogueAvailable()");
    expect(simulatorLanding).toContain("STRUCTURED_DIALOGUE_AVAILABLE: boolean = false");
    expect(simulatorLanding).toContain("STRUCTURED_DIALOGUE_AVAILABLE &&");
  });

  it("keeps seeded free-chat scenes consent-led and updates legacy rows", () => {
    const combinedSeeds = `${scenarioSeeds}\n${scenarioEnrichment}`;
    expect(combinedSeeds).toContain("לא מדד משיכה");
    expect(combinedSeeds).toContain("סירוב מסיים את התרגיל");
    expect(combinedSeeds).toContain("LEGACY_TITLE_ALIASES");
    expect(scenarioEnrichment).toContain("await ctx.db.patch(existing._id, scenario)");
    expect(combinedSeeds).not.toMatch(
      /לפתוח אותה|לגרום לה להרגיש|להיות זכיר ומרשים|תאבד עניין|הפכי מעט אדישה|לשרוד את הצינון|לא מוותר בקלות|גרסת? לראיונות/u
    );
  });

  it("does not expose a live attraction-like score in the chat", () => {
    expect(simulatorChat).toContain("דמות AI בדיונית");
    expect(simulatorChat).toContain("אין כאן מדד למשיכה, התאמה או הסכמה");
    expect(simulatorChat).not.toContain("connection-meter-label");
    expect(simulatorChat).not.toContain("💗 חיבור");
  });
});
