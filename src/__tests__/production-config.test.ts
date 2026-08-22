import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  assertDemoModeConfiguration,
  isDemoModeExplicitlyEnabled,
} from "@/lib/production-config";

describe("explicit demo-mode configuration", () => {
  it("allows only a double-opted-in local development demo", () => {
    expect(() =>
      assertDemoModeConfiguration({
        NODE_ENV: "development",
        VERCEL_ENV: undefined,
        NEXT_PUBLIC_DEMO_MODE: "true",
        ALLOW_DEMO_MODE: "true",
      })
    ).not.toThrow();
    expect(
      isDemoModeExplicitlyEnabled({
        NODE_ENV: "development",
        NEXT_PUBLIC_DEMO_MODE: " TRUE ",
        ALLOW_DEMO_MODE: " TRUE ",
      })
    ).toBe(true);
  });

  it("allows every environment when demo mode is not requested", () => {
    expect(() =>
      assertDemoModeConfiguration({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "false",
        ALLOW_DEMO_MODE: "true",
      })
    ).not.toThrow();
  });

  it.each([
    {
      name: "missing explicit opt-in",
      env: {
        NODE_ENV: "development",
        NEXT_PUBLIC_DEMO_MODE: "true",
      },
    },
    {
      name: "undefined runtime classification",
      env: {
        NODE_ENV: undefined,
        NEXT_PUBLIC_DEMO_MODE: "true",
        ALLOW_DEMO_MODE: "true",
      },
    },
    {
      name: "Node production",
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "true",
        ALLOW_DEMO_MODE: "true",
      },
    },
    {
      name: "Vercel preview",
      env: {
        NODE_ENV: "development",
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_DEMO_MODE: "true",
        ALLOW_DEMO_MODE: "true",
      },
    },
    {
      name: "Vercel production",
      env: {
        NODE_ENV: "development",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: " TRUE ",
        ALLOW_DEMO_MODE: " TRUE ",
      },
    },
  ])("fails closed for $name", ({ env }) => {
    expect(() =>
      assertDemoModeConfiguration(env)
    ).toThrow(/Refusing demo mode/);
    expect(isDemoModeExplicitlyEnabled(env)).toBe(false);
  });

  it("wires the same fail-closed policy into build, runtime and client state", () => {
    const read = (relativePath: string) =>
      fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
    const nextConfig = read("next.config.ts");
    const proxy = read("src/proxy.ts");
    const provider = read("src/components/providers/demo-provider.tsx");

    expect(nextConfig).toContain("assertDemoModeConfiguration()");
    expect(nextConfig).toContain("NEXT_PUBLIC_DEMO_MODE_AUTHORIZED");
    expect(proxy).toContain("assertDemoModeConfiguration()");
    expect(proxy).toContain("isDemoModeExplicitlyEnabled()");
    expect(provider).toContain("NEXT_PUBLIC_DEMO_MODE_AUTHORIZED");
    expect(provider).not.toContain(
      'process.env.NEXT_PUBLIC_DEMO_MODE === "true"'
    );
    expect(provider).not.toContain("eladjak@gmail.com");
  });
});
