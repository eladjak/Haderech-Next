/**
 * @file route.ts
 * @description Auth callback handler for processing OAuth redirects
 */

import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * GET /auth/callback
 *
 * Handles the OAuth callback from Supabase Auth.
 *
 * @param {Request} request - The request object containing the auth code
 * @returns {Promise<NextResponse>} Redirects to the appropriate page after auth
 */
export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const cookieStore = cookies();
      const supabase = createServerClient(cookieStore);

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(new URL("/auth/error", request.url), {
          status: 302,
        });
      }

      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    // Return the user to an error page with some instructions
    return NextResponse.redirect(new URL("/auth/error", request.url), {
      status: 302,
    });
  } catch (error) {
    console.error("Error in GET /auth/callback:", error);
    return NextResponse.redirect(new URL("/auth/error", request.url), {
      status: 302,
    });
  }
}
