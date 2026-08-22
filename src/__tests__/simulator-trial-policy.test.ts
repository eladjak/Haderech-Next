import { describe, expect, it } from "vitest";
import {
  claimSimulatorTrialUnit,
  decideSimulatorAccess,
  settleSimulatorTrialUnit,
  SIMULATOR_TRIAL_POLICY,
  type SimulatorTrialState,
} from "../../convex/lib/simulatorTrialPolicy";

const EMPTY: SimulatorTrialState = { consumedUnits: 0, reservations: [] };
const NOW = 1_900_000_000_000;

describe("simulator trial policy", () => {
  it("keeps the current trusted-entitlement scope and closed commerce explicit", () => {
    expect(SIMULATOR_TRIAL_POLICY).toMatchObject({
      freeCompletedTurns: 5,
      commerceAvailable: false,
      entitlementScope: "any_active_course",
    });
  });
  it("isolates user A usage from user B", () => {
    const userA = { consumedUnits: 5, reservations: [] };
    const userB = EMPTY;
    expect(
      decideSimulatorAccess({
        isAdmin: false,
        hasTrustedEntitlement: false,
        state: userA,
        now: NOW,
        trialLimit: 5,
      }).mode,
    ).toBe("locked");
    expect(
      decideSimulatorAccess({
        isAdmin: false,
        hasTrustedEntitlement: false,
        state: userB,
        now: NOW,
        trialLimit: 5,
      }).trialRemaining,
    ).toBe(5);
  });

  it("allows N completed turns and rejects N+1", () => {
    let state = EMPTY;
    for (let index = 0; index < 5; index += 1) {
      const claim = claimSimulatorTrialUnit({
        state,
        now: NOW + index,
        token: `turn-${index}`,
        trialLimit: 5,
      });
      expect(claim.allowed).toBe(true);
      if (!claim.allowed || claim.grant.kind !== "trial")
        throw new Error("expected trial");
      state = settleSimulatorTrialUnit({
        state: claim.state,
        token: claim.grant.token,
        delivered: true,
        now: NOW + index,
        trialLimit: 5,
      }).state;
    }
    const rejected = claimSimulatorTrialUnit({
      state,
      now: NOW + 10,
      token: "turn-6",
      trialLimit: 5,
    });
    expect(rejected.allowed).toBe(false);
    expect(rejected.access).toMatchObject({
      mode: "locked",
      trialUsed: 5,
      trialRemaining: 0,
    });
  });

  it("serializes concurrent reservations against the same limit", () => {
    let state = EMPTY;
    for (let index = 0; index < 5; index += 1) {
      const claim = claimSimulatorTrialUnit({
        state,
        now: NOW,
        token: `parallel-${index}`,
        trialLimit: 5,
      });
      expect(claim.allowed).toBe(true);
      state = claim.state;
    }
    const sixth = claimSimulatorTrialUnit({
      state,
      now: NOW,
      token: "parallel-5",
      trialLimit: 5,
    });
    expect(sixth.allowed).toBe(false);
    expect(sixth.access.trialReserved).toBe(5);
  });

  it("releases a reservation when the request fails before any response", () => {
    const claim = claimSimulatorTrialUnit({
      state: EMPTY,
      now: NOW,
      token: "provider-failed",
      trialLimit: 5,
    });
    if (!claim.allowed || claim.grant.kind !== "trial")
      throw new Error("expected trial");
    const released = settleSimulatorTrialUnit({
      state: claim.state,
      token: claim.grant.token,
      delivered: false,
      now: NOW + 1,
      trialLimit: 5,
    });
    expect(released.state.consumedUnits).toBe(0);
    expect(released.access.trialRemaining).toBe(5);
  });

  it("counts a delivered fallback as a completed practice turn", () => {
    const claim = claimSimulatorTrialUnit({
      state: EMPTY,
      now: NOW,
      token: "fallback-delivered",
      trialLimit: 5,
    });
    if (!claim.allowed || claim.grant.kind !== "trial")
      throw new Error("expected trial");
    const settled = settleSimulatorTrialUnit({
      state: claim.state,
      token: claim.grant.token,
      delivered: true,
      now: NOW + 1,
      trialLimit: 5,
    });
    expect(settled.state.consumedUnits).toBe(1);
    expect(settled.access.trialRemaining).toBe(4);
  });

  it.each([
    { isAdmin: true, hasTrustedEntitlement: false, mode: "admin" },
    { isAdmin: false, hasTrustedEntitlement: true, mode: "entitled" },
  ])("unlocks exhausted usage for $mode", (facts) => {
    const claim = claimSimulatorTrialUnit({
      state: { consumedUnits: 5, reservations: [] },
      now: NOW,
      token: facts.mode,
      trialLimit: 5,
      ...facts,
    });
    expect(claim.allowed).toBe(true);
    if (!claim.allowed) throw new Error("expected full access");
    expect(claim.grant.kind).toBe("full");
    expect(claim.access.mode).toBe(facts.mode);
  });

  it("expires abandoned reservations without consuming the trial", () => {
    const access = decideSimulatorAccess({
      isAdmin: false,
      hasTrustedEntitlement: false,
      state: {
        consumedUnits: 4,
        reservations: [{ token: "stale", expiresAt: NOW - 1 }],
      },
      now: NOW,
      trialLimit: 5,
    });
    expect(access).toMatchObject({ mode: "trial", trialRemaining: 1 });
  });
});
