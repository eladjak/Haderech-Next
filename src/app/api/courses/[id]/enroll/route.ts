import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import { logger } from "@/lib/utils/logger";

/**
 * @file courses/[id]/enroll/route.ts
 * @description API routes for managing course enrollments. Provides endpoints for enrolling in and unenrolling from courses.
 */

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/courses/[id]/enroll
 *
 * Enrolls the current user in a course.
 *
 * @param id - The course ID
 * @returns Success message or error
 *
 * Example response:
 * ```json
 * {
 *   "message": "Successfully enrolled in course"
 * }
 * ```
 */
export async function POST(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", params.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    // Check if already enrolled
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("course_id", params.id)
      .single();

    if (enrollment) {
      return NextResponse.json(
        { error: "אתה כבר רשום לקורס זה" },
        { status: 400 }
      );
    }

    // Create enrollment
    const { error: createError } = await supabase
      .from("course_enrollments")
      .insert({
        user_id: session.user.id,
        course_id: params.id,
        enrolled_at: new Date().toISOString(),
        status: "active",
      });

    if (createError) {
      logger.error("Error creating enrollment:", createError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "נרשמת לקורס בהצלחה" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in POST /api/courses/[id]/enroll:", error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/[id]/enroll
 *
 * Unenrolls the current user from a course.
 *
 * @requires Authentication
 *
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
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

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // Delete enrollment
    const { error } = await supabase
      .from("course_enrollments")
      .delete()
      .eq("course_id", params.id)
      .eq("user_id", session.user.id);

    if (error) {
      logger.error("Error deleting enrollment:", error);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "ההרשמה לקורס בוטלה בהצלחה" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Enrollment DELETE error:", error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
