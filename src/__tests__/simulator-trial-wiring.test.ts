import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  readFileSync(resolve(process.cwd(), relative), "utf8");

describe("simulator trial server and UI wiring", () => {
  const simulator = read("convex/simulator.ts");
  const schema = read("convex/schema.ts");
  const accessPanel = read(
    "src/components/simulator/simulator-access-panel.tsx",
  );
  const chat = read("src/components/simulator/simulator-chat.tsx");
  const scenario = read("src/app/simulator/[scenarioId]/page.tsx");

  it("keeps trial state server-side and settles it with the delivered reply", () => {
    expect(schema).toContain("simulatorTrialUsage: defineTable");
    expect(schema).toContain('.index("by_user", ["userId"])');
    expect(simulator).toContain("claimSimulatorTrialUnit");
    expect(simulator).toContain("settleSimulatorTrialUnit");
    expect(simulator).toContain("accessGrant: claim.grant");
    expect(simulator).toContain("crypto.randomUUID()");
  });

  it("checks bounded usage before the free safety write and before trial claim", () => {
    const rateGuard = simulator.indexOf(
      "recentUserMessages >= SIMULATOR_HOURLY_USER_MESSAGE_LIMIT",
    );
    const safetyRoute = simulator.indexOf("if (detectHighRisk(trimmed))");
    const trialClaim = simulator.indexOf("internal.simulator.claimTrialUnit");
    expect(rateGuard).toBeGreaterThan(-1);
    expect(safetyRoute).toBeGreaterThan(rateGuard);
    expect(trialClaim).toBeGreaterThan(safetyRoute);
    expect(simulator).toContain("message.content === HIGH_RISK_RESPONSE");
  });

  it("keeps provider debrief and RAG behind full trusted access", () => {
    expect(simulator).toMatch(
      /const aiAnalysis\s*=\s*access\.hasFullAccess && hasLlmKey\(keys\)/u,
    );
    expect(simulator).toContain("if (access.hasFullAccess && keys.geminiKey)");
    expect(simulator).toContain("משוב אוטומטי בסיסי:");
  });

  it("unlocks full access only for the canonical Haderech course entitlement", () => {
    expect(simulator).toContain("activeEntitlements");
    expect(simulator).toContain("entitlementCourseTitle");
    expect(simulator).toContain("ctx.db.get(entitlement.courseId)");
    expect(simulator).not.toContain(
      'entitlementScope === "any_active_course"',
    );
  });

  it("shows a warm locked state without inventing live commerce", () => {
    expect(accessPanel).toContain("הניסיון החינמי הסתיים");
    expect(accessPanel).toContain("הרכישה אינה");
    expect(accessPanel).toContain("פתיחת גישה בתשלום — בקרוב");
    expect(accessPanel).toContain("disabled");
    expect(accessPanel).not.toMatch(/₪|ש״ח|SKU|checkout/u);
    expect(chat).toContain('access?.mode !== "locked"');
    expect(scenario).toContain('access.mode !== "locked"');
  });
});
