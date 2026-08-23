export const SIMULATOR_TRIAL_POLICY = Object.freeze({
  // Owner-overridable product constants. Keep these conservative until real
  // provider cost and conversion data justify a deliberate change.
  freeCompletedTurns: 5,
  reservationTtlMs: 10 * 60 * 1000,
  commerceAvailable: false,
  entitlementScope: "haderech_course_only" as const,
  entitlementCourseTitle: "הדרך - אומנות הקשר",
});

export const SIMULATOR_TRIAL_LOCKED_ERROR = "SIMULATOR_TRIAL_LOCKED";

export type SimulatorTrialReservation = {
  token: string;
  expiresAt: number;
};

export type SimulatorTrialState = {
  consumedUnits: number;
  reservations: SimulatorTrialReservation[];
};

export type SimulatorAccessMode = "admin" | "entitled" | "trial" | "locked";

export type SimulatorAccessDecision = {
  mode: SimulatorAccessMode;
  hasFullAccess: boolean;
  trialLimit: number;
  trialUsed: number;
  trialReserved: number;
  trialRemaining: number;
  commerceAvailable: false;
};

export function activeSimulatorTrialReservations(
  reservations: SimulatorTrialReservation[],
  now: number,
): SimulatorTrialReservation[] {
  return reservations.filter((reservation) => reservation.expiresAt > now);
}

export function decideSimulatorAccess(input: {
  isAdmin: boolean;
  hasTrustedEntitlement: boolean;
  state: SimulatorTrialState;
  now: number;
  trialLimit?: number;
}): SimulatorAccessDecision {
  const trialLimit = Math.max(
    0,
    Math.floor(input.trialLimit ?? SIMULATOR_TRIAL_POLICY.freeCompletedTurns),
  );
  const reservations = activeSimulatorTrialReservations(
    input.state.reservations,
    input.now,
  );
  const trialUsed = Math.max(0, Math.floor(input.state.consumedUnits));
  const trialRemaining = Math.max(
    0,
    trialLimit - trialUsed - reservations.length,
  );
  const mode: SimulatorAccessMode = input.isAdmin
    ? "admin"
    : input.hasTrustedEntitlement
      ? "entitled"
      : trialRemaining > 0
        ? "trial"
        : "locked";

  return {
    mode,
    hasFullAccess: mode === "admin" || mode === "entitled",
    trialLimit,
    trialUsed,
    trialReserved: reservations.length,
    trialRemaining,
    commerceAvailable: false,
  };
}

export function claimSimulatorTrialUnit(input: {
  state: SimulatorTrialState;
  now: number;
  token: string;
  isAdmin?: boolean;
  hasTrustedEntitlement?: boolean;
  trialLimit?: number;
  reservationTtlMs?: number;
}):
  | {
      allowed: true;
      grant: { kind: "full" } | { kind: "trial"; token: string };
      state: SimulatorTrialState;
      access: SimulatorAccessDecision;
    }
  | {
      allowed: false;
      state: SimulatorTrialState;
      access: SimulatorAccessDecision;
    } {
  const reservations = activeSimulatorTrialReservations(
    input.state.reservations,
    input.now,
  );
  const state = { ...input.state, reservations };
  const access = decideSimulatorAccess({
    isAdmin: input.isAdmin ?? false,
    hasTrustedEntitlement: input.hasTrustedEntitlement ?? false,
    state,
    now: input.now,
    trialLimit: input.trialLimit,
  });

  if (access.hasFullAccess) {
    return { allowed: true, grant: { kind: "full" }, state, access };
  }
  if (access.mode === "locked") {
    return { allowed: false, state, access };
  }

  const nextState = {
    ...state,
    reservations: [
      ...reservations,
      {
        token: input.token,
        expiresAt:
          input.now +
          (input.reservationTtlMs ?? SIMULATOR_TRIAL_POLICY.reservationTtlMs),
      },
    ],
  };
  return {
    allowed: true,
    grant: { kind: "trial", token: input.token },
    state: nextState,
    access: decideSimulatorAccess({
      isAdmin: false,
      hasTrustedEntitlement: false,
      state: nextState,
      now: input.now,
      trialLimit: input.trialLimit,
    }),
  };
}

export function settleSimulatorTrialUnit(input: {
  state: SimulatorTrialState;
  token: string;
  delivered: boolean;
  now: number;
  trialLimit?: number;
}): { state: SimulatorTrialState; access: SimulatorAccessDecision } {
  const active = activeSimulatorTrialReservations(
    input.state.reservations,
    input.now,
  );
  const claimed = active.some(
    (reservation) => reservation.token === input.token,
  );
  if (!claimed) throw new Error("SIMULATOR_TRIAL_RESERVATION_REQUIRED");

  const state = {
    consumedUnits: input.state.consumedUnits + (input.delivered ? 1 : 0),
    reservations: active.filter(
      (reservation) => reservation.token !== input.token,
    ),
  };
  return {
    state,
    access: decideSimulatorAccess({
      isAdmin: false,
      hasTrustedEntitlement: false,
      state,
      now: input.now,
      trialLimit: input.trialLimit,
    }),
  };
}
