import { NextResponse } from "next/server";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    convex: boolean;
    clerk: boolean;
    app_url: boolean;
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET() {
  const checks = {
    convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    app_url: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const allOk = Object.values(checks).every(Boolean);

  const health: HealthStatus = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    environment: process.env.NODE_ENV ?? "development",
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
