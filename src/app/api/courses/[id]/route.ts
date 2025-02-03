/**
 * @file courses/[id]/route.ts
 * @description API routes for managing individual courses. Provides endpoints for retrieving,
 * updating, and deleting specific courses. Includes authentication and authorization checks.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface UpdateCourseBody {
  title?: string;
  description?: string;
  image_url?: string | null;
  status?: "draft" | "published" | "archived";
  level?: "beginner" | "intermediate" | "advanced";
  duration?: number;
  tags?: string[];
}

/**
 * GET /api/courses/[id]
 *
 * Retrieves a specific course by ID.
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response with course data or error message
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const { data: course, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:users!instructor_id(*),
        lessons(
          *,
          progress:lesson_progress(*)
        ),
        ratings(
          *,
          user:users(*)
        )
      `,
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching course:", error);
      return NextResponse.json(
        { error: "Failed to fetch course" },
        { status: 500 },
      );
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error in GET /api/courses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/courses/[id]
 *
 * Updates a course's details.
 *
 * @requires Authentication & Authorization (Course Author)
 *
 * @param {Request} request - The request object containing the updated course data
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the updated course or error message
 *
 * @example Request
 * ```json
 * {
 *   "title": "Updated Title",
 *   "description": "Updated description",
 *   "status": "published"
 * }
 * ```
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const updates: UpdateCourseBody = await request.json();

    const { data: course, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating course:", error);
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 },
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error in PATCH /api/courses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/courses/[id]
 *
 * Deletes a course.
 *
 * @requires Authentication & Authorization (Course Author)
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting course:", error);
      return NextResponse.json(
        { error: "Failed to delete course" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETE /api/courses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
