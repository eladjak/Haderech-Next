/**
 * @file middleware.ts
 * @description Middleware for handling authentication and protected routes
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/supabase";
import type { CookieOptions } from "@supabase/ssr";

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
 * Middleware to handle authentication and authorization.
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
    },
  );

  // Refresh session if expired
  await supabase.auth.getSession();

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith("/api/"),
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
