import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { _Database, NextRequest } from "@/lib/utils";

("use client");

export {};

/**
 * @file courses/[id]/route.ts
 * @description API routes for managing individual courses. Provides endpoints for retrieving,
 * updating, and deleting specific courses. Includes authentication and authorization checks.
 */

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
 * @param {Request} request - The request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response with course data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      }
    );

    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
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
  request: NextRequest,
  { params }: { params: { id: string } }
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
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: UpdateCourseBody = await request.json();

    // בדיקה אם הקורס קיים
    const { data: existingCourse, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .eq("instructor_id", user.id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    const { data: course, error } = await supabase
      .from("courses")
      .update({
        ...existingCourse,
        ...updates,
      })
      .eq("id", params.id)
      .eq("instructor_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error in PATCH /api/courses/[id]:", error);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    if (!course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(course || {}, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/courses/[id]:", error);
    return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/[id]
 *
 * Deletes a course.
 *
 * @requires Authentication & Authorization (Course Author)
 *
 * @param {Request} request - The request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", params.id)
      .eq("instructor_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
