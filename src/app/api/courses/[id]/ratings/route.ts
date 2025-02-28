import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

("use client");

export {};

/**
 * @file courses/[id]/ratings/route.ts
 * @description API routes for managing course ratings. Provides endpoints for retrieving and submitting ratings.
 */

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/courses/[id]/ratings
 *
 * Retrieves all ratings for a specific course.
 *
 * @requires Authentication
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the ratings or error message
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "rating1",
 *     "rating": 5,
 *     "review": "Great course!",
 *     "created_at": "2024-01-01T12:00:00Z",
 *     "user": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     }
 *   }
 * ]
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data: ratings, error } = await supabase
      .from("course_ratings")
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq("course_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ratings:", error);
      return NextResponse.json(
        { error: "Failed to fetch ratings" },
        { status: 500 }
      );
    }

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error in GET /api/courses/[id]/ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/ratings
 *
 * Creates a new rating for a course.
 *
 * @requires Authentication & Course Enrollment
 *
 * @param {Request} request - The request object containing the rating data
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the created rating or error message
 *
 * @example Request
 * ```json
 * {
 *   "rating": 5,
 *   "review": "Great course!"
 * }
 * ```
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is enrolled in the course
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Must be enrolled in the course to rate it" },
        { status: 403 }
      );
    }

    // Check if user has already rated the course
    const { data: existingRating } = await supabase
      .from("course_ratings")
      .select("id")
      .eq("course_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: "You have already rated this course" },
        { status: 400 }
      );
    }

    // Get rating data from request
    const { rating, review } = await request.json();

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Create rating
    const { data: newRating, error } = await supabase
      .from("course_ratings")
      .insert({
        course_id: params.id,
        user_id: session.user.id,
        rating,
        review,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        user:users(*)
      `
      )
      .single();

    if (error) {
      console.error("Error creating rating:", error);
      return NextResponse.json(
        { error: "Failed to create rating" },
        { status: 500 }
      );
    }

    return NextResponse.json(newRating);
  } catch (error) {
    console.error("Error in POST /api/courses/[id]/ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]/ratings
 *
 * Deletes a user's rating for a course.
 *
 * @requires Authentication
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete rating
    const { error } = await supabase
      .from("course_ratings")
      .delete()
      .eq("course_id", params.id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting rating:", error);
      return NextResponse.json(
        { error: "Failed to delete rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/courses/[id]/ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
