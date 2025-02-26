import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

/**
 * @file route.ts
 * @description Auth sign-out handler for processing user logout
 */

/**
 * POST /auth/sign-out
 *
 * Signs out the current user.
 *
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} Redirects to the home page after sign out
 */
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  // Sign out user
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
