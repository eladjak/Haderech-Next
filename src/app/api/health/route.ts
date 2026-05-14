import { NextRequest, NextResponse } from "next/server";

const startTime = Date.now();

/**
 * Public minimal health endpoint — exposes only `{status, uptime}`.
 *
 * For detailed env/version diagnostics, send `Authorization: Bearer <token>`
 * matching `HEALTH_TOKEN` env var. Without the token, no internal config
 * details are leaked.
 */
export async function GET(req: NextRequest) {
  const checks = {
    convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    app_url: !!process.env.NEXT_PUBLIC_APP_URL,
  };
  const allOk = Object.values(checks).every(Boolean);

  const auth = req.headers.get("authorization");
  const expected = process.env.HEALTH_TOKEN;
  const isAuthorized =
    !!expected && auth === `Bearer ${expected}`;

  const baseHeaders = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
  } as const;

  // Public response: minimal info only.
  if (!isAuthorized) {
    return NextResponse.json(
      {
        status: allOk ? "ok" : "degraded",
        uptime: Math.floor((Date.now() - startTime) / 1000),
      },
      { status: allOk ? 200 : 503, headers: baseHeaders }
    );
  }

  // Authorized response: full diagnostics.
  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      environment: process.env.NODE_ENV ?? "development",
      checks,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    },
    { status: allOk ? 200 : 503, headers: baseHeaders }
  );
}
