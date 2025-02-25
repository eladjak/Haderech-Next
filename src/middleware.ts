/**
 * @file middleware.ts
 * @description Middleware for handling authentication, protected routes, and security headers
 */

import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Array of public routes that don't require authentication
 */
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/verify-email",
  "/auth/callback",
];

/**
 * Middleware to handle authentication, authorization, and security headers.
 *
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} The response or redirect
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // הוספת כותרות אבטחה
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app vercel.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: *.cloudinary.com;
    font-src 'self' data:;
    frame-src 'self';
    connect-src 'self' *.supabase.co *.vercel-insights.com *.vercel.app;
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", cspHeader);

  // Create Supabase client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getSession();

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith("/api/")
  );

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Allow access to public routes
  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages
    if (session && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // Protect private routes
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Continue to protected route
  return response;
}

/**
 * Define which routes use this middleware.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     * - _vercel (Vercel specific)
     * - _static (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|_vercel|_static).*)",
  ],
};
