import { describe, expect, it } from "vitest";
import {
  assertProductionServiceConfiguration,
  getAppUrl,
  getClerkHealthProbeBaseUrl,
  getClerkIssuerFromPublishableKey,
  getConvexDeploymentUrl,
} from "@/lib/service-config";

const clerkKey = (mode: "test" | "live", hostname: string) =>
  `pk_${mode}_${Buffer.from(`${hostname}$`).toString("base64")}`;

describe("service configuration", () => {
  it("normalizes a valid Convex deployment URL", () => {
    expect(getConvexDeploymentUrl("https://steady-otter-123.convex.cloud")).toBe(
      "https://steady-otter-123.convex.cloud"
    );
  });

  it.each([
    "https://steady-otter-123.convex.cloud\n",
    "http://steady-otter-123.convex.cloud",
    "https://example.com",
    "https://steady-otter-123.convex.cloud/path",
  ])("rejects an unsafe Convex URL: %s", (value) => {
    expect(() => getConvexDeploymentUrl(value)).toThrow();
  });

  it("extracts the Clerk issuer without exposing the key", () => {
    expect(
      getClerkIssuerFromPublishableKey(
        clerkKey("test", "example.clerk.accounts.dev")
      )
    ).toBe("https://example.clerk.accounts.dev");
  });

  it("routes the Clerk health probe through the canonical Frontend API proxy", () => {
    expect(
      getClerkHealthProbeBaseUrl(
        clerkKey("live", "clerk.example.com"),
        "https://example.com/__clerk",
      ),
    ).toBe("https://example.com/__clerk");

    expect(() =>
      getClerkHealthProbeBaseUrl(
        clerkKey("live", "clerk.example.com"),
        "https://example.com/not-clerk",
      ),
    ).toThrow();
  });

  it("rejects non-HTTPS or local production app URLs", () => {
    expect(() => getAppUrl("http://example.com", true)).toThrow();
    expect(() => getAppUrl("https://localhost", true)).toThrow();
  });

  it("accepts a fully independent production configuration", () => {
    const convex = "https://steady-otter-123.convex.cloud";
    expect(() =>
      assertProductionServiceConfiguration({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://example.com",
        NEXT_PUBLIC_CONVEX_URL: convex,
        PRODUCTION_CONVEX_URL: convex,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKey("live", "clerk.example.com"),
        NEXT_PUBLIC_CLERK_PROXY_URL: "https://example.com/__clerk",
        CLERK_SECRET_KEY: "sk_live_fixture",
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/dashboard",
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/dashboard",
      })
    ).not.toThrow();
  });

  it.each([
    { name: "development Clerk publishable key", patch: { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKey("test", "example.clerk.accounts.dev") } },
    { name: "development Clerk secret key", patch: { CLERK_SECRET_KEY: "sk_test_fixture" } },
    { name: "missing Clerk proxy", patch: { NEXT_PUBLIC_CLERK_PROXY_URL: undefined } },
    { name: "foreign Clerk proxy origin", patch: { NEXT_PUBLIC_CLERK_PROXY_URL: "https://other.example.com/__clerk" } },
    { name: "unconfirmed Convex deployment", patch: { PRODUCTION_CONVEX_URL: "https://other-otter-456.convex.cloud" } },
    { name: "whitespace-tainted Convex URL", patch: { NEXT_PUBLIC_CONVEX_URL: "https://steady-otter-123.convex.cloud\n" } },
  ])("fails closed for $name", ({ patch }) => {
    const convex = "https://steady-otter-123.convex.cloud";
    expect(() =>
      assertProductionServiceConfiguration({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://example.com",
        NEXT_PUBLIC_CONVEX_URL: convex,
        PRODUCTION_CONVEX_URL: convex,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKey("live", "clerk.example.com"),
        NEXT_PUBLIC_CLERK_PROXY_URL: "https://example.com/__clerk",
        CLERK_SECRET_KEY: "sk_live_fixture",
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/dashboard",
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/dashboard",
        ...patch,
      })
    ).toThrow();
  });

  it("does not require production-only values outside Vercel Production", () => {
    expect(() =>
      assertProductionServiceConfiguration({ VERCEL_ENV: "preview" })
    ).not.toThrow();
  });
});
