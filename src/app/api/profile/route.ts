import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { updateProfileSchema } from "@/lib/validations/api-schemas";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";

export {};

/**
 * @file route.ts
 * @description API route handlers for user profile operations
 * Includes input validation and rate limiting for security
 */

// Cache configuration: Dynamic content - no cache
// User profiles are personalized and must always be fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiters for different operations
const getProfileLimiter = rateLimit(apiRateLimits.standard);
const updateProfileLimiter = rateLimit(apiRateLimits.strict);

/**
 * GET /api/profile
 *
 * Fetches the current user's profile data.
 * Requires authentication.
 *
 * @returns User profile data or error response
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await getProfileLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in GET /api/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 *
 * Updates the current user's profile data.
 * Requires authentication.
 *
 * @param request Request containing profile updates
 * @returns Updated profile data or error response
 */
export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await updateProfileLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse and validate input
    const json = await request.json();
    const validationResult = updateProfileSchema.safeParse(json);

    if (!validationResult.success) {
      console.warn("Profile update validation failed:", validationResult.error.flatten());
      return NextResponse.json(
        {
          error: "קלט לא תקין",
          message: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // SECURITY: Explicitly prevent updating sensitive fields
    // Even if validation passed, ensure no sensitive fields are in the update
    const { data: profile, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
