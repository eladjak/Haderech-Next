import { NextResponse } from "next/server";
import {
  assertProductionServiceConfiguration,
  getAppUrl,
  getClerkIssuerFromPublishableKey,
  getConvexDeploymentUrl,
} from "@/lib/service-config";
import type { ServiceConfigEnv } from "@/lib/service-config";

type CheckStatus = "ok" | "error";

interface HealthCheck {
  status: CheckStatus;
  latency_ms: number;
}

interface HealthStatus {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    production_config: HealthCheck;
    convex: HealthCheck;
    clerk: HealthCheck;
    app_url: HealthCheck;
  };
  uptime: number;
}

const startTime = Date.now();

async function check(task: () => void | Promise<void>): Promise<HealthCheck> {
  const started = performance.now();
  try {
    await task();
    return { status: "ok", latency_ms: Math.round(performance.now() - started) };
  } catch {
    return { status: "error", latency_ms: Math.round(performance.now() - started) };
  }
}

async function fetchOk(url: string): Promise<void> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
    headers: { Accept: "application/json, text/plain" },
  });
  if (!response.ok) throw new Error("Dependency health probe failed.");
}

export async function GET() {
  const production = process.env.VERCEL_ENV === "production";
  const checks = {
    production_config: await check(() =>
      assertProductionServiceConfiguration(process.env as ServiceConfigEnv)
    ),
    convex: await check(async () => {
      const url = getConvexDeploymentUrl(process.env.NEXT_PUBLIC_CONVEX_URL);
      await fetchOk(`${url}/version`);
    }),
    clerk: await check(async () => {
      const issuer = getClerkIssuerFromPublishableKey(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      );
      await fetchOk(`${issuer}/.well-known/openid-configuration`);
    }),
    app_url: await check(() => {
      getAppUrl(process.env.NEXT_PUBLIC_APP_URL, production);
    }),
  };

  const allOk = Object.values(checks).every(({ status }) => status === "ok");

  const health: HealthStatus = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.npm_package_version ?? "unknown",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return NextResponse.json(health, {
    status: allOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
