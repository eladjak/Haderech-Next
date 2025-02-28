import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export {};

/**
 * @file courses/[id]/lessons/[lessonId]/progress/route.ts
 * @description API routes for managing lesson progress. Provides endpoints for retrieving and updating progress.
 */

interface RouteParams {
  params: {
    id: string;
    lessonId: string;
  };
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]/progress
 *
 * Retrieves the user's progress for a specific lesson.
 *
 * @requires Authentication
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the progress details or error message
 *
 * @example Response
 * ```json
 * {
 *   "id": "progress1",
 *   "completed": true,
 *   "last_position": 120,
 *   "updated_at": "2024-01-01T12:00:00Z"
 * }
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: progress, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("lesson_id", params.lessonId)
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching progress:", error);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      progress || { completed: false, last_position: 0 }
    );
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]/lessons/[lessonId]/progress
 *
 * Updates the user's progress for a lesson.
 *
 * @requires Authentication
 * @requires Course enrollment
 *
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the updated progress or error message
 *
 * @example Request Body
 * ```json
 * {
 *   "completed": true,
 *   "last_position": 180
 * }
 * ```
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify course enrollment
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Must be enrolled to track progress" },
        { status: 403 }
      );
    }

    // Verify lesson exists and belongs to course
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("id", params.lessonId)
      .eq("course_id", params.id)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const { completed, last_position } = await request.json();

    // Update or create progress
    const { data: progress, error } = await supabase
      .from("lesson_progress")
      .upsert({
        lesson_id: params.lessonId,
        user_id: session.user.id,
        completed,
        last_position,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating progress:", error);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Progress PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
