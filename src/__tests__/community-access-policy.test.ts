import { describe, expect, it } from "vitest";
import {
  COMMUNITY_ACCESS_ERROR,
  communityDecisionError,
  decideCommunityAccess,
  type CommunityAccessBasis,
  type CommunityAccessDecision,
} from "../../convex/lib/communityAccessPolicy";

const NOW = 1_900_000_000_000;

describe("community access policy", () => {
  const rows: Array<{
    name: string;
    authenticated: boolean;
    callerUserId: string | null;
    callerRole: "student" | "admin" | null;
    entitlement: Parameters<typeof decideCommunityAccess>[0]["entitlement"];
    expected: CommunityAccessDecision;
  }> = [
    {
      name: "anonymous",
      authenticated: false,
      callerUserId: null,
      callerRole: null,
      entitlement: null,
      expected: "deny-unauthenticated",
    },
    {
      name: "identity without user record",
      authenticated: true,
      callerUserId: null,
      callerRole: null,
      entitlement: null,
      expected: "deny-user-record-missing",
    },
    {
      name: "regular user without a dedicated grant",
      authenticated: true,
      callerUserId: "user-a",
      callerRole: "student",
      entitlement: null,
      expected: "deny-entitlement-missing",
    },
    {
      name: "user A cannot consume user B grant",
      authenticated: true,
      callerUserId: "user-a",
      callerRole: "student",
      entitlement: {
        granteeUserId: "user-b",
        status: "active",
        accessBasis: "book",
      },
      expected: "deny-entitlement-cross-user",
    },
    {
      name: "revoked grant",
      authenticated: true,
      callerUserId: "user-a",
      callerRole: "student",
      entitlement: {
        granteeUserId: "user-a",
        status: "revoked",
        accessBasis: "course",
      },
      expected: "deny-entitlement-inactive",
    },
    {
      name: "expired grant",
      authenticated: true,
      callerUserId: "user-a",
      callerRole: "student",
      entitlement: {
        granteeUserId: "user-a",
        status: "active",
        accessBasis: "guidance",
        validUntil: NOW,
      },
      expected: "deny-entitlement-expired",
    },
    {
      name: "active dedicated grant",
      authenticated: true,
      callerUserId: "user-a",
      callerRole: "student",
      entitlement: {
        granteeUserId: "user-a",
        status: "active",
        accessBasis: "ecosystem",
        validUntil: NOW + 1,
      },
      expected: "allow-dedicated-entitlement",
    },
    {
      name: "admin without grant",
      authenticated: true,
      callerUserId: "admin-a",
      callerRole: "admin",
      entitlement: null,
      expected: "allow-admin",
    },
  ];

  for (const row of rows) {
    it(`${row.name} -> ${row.expected}`, () => {
      const decision = decideCommunityAccess({ ...row, now: NOW });
      expect(decision).toBe(row.expected);
      expect(communityDecisionError(decision)).toBe(
        decision.startsWith("allow-") ? null : COMMUNITY_ACCESS_ERROR
      );
    });
  }

  it.each<CommunityAccessBasis>(["book", "course", "guidance", "ecosystem"])(
    "represents a verified %s access basis without changing the decision rule",
    (accessBasis) => {
      expect(
        decideCommunityAccess({
          authenticated: true,
          callerUserId: "user-a",
          callerRole: "student",
          entitlement: {
            granteeUserId: "user-a",
            status: "active",
            accessBasis,
          },
          now: NOW,
        })
      ).toBe("allow-dedicated-entitlement");
    }
  );
});
