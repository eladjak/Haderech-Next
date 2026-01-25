import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { _Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";

/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for retrieving and creating lessons.
 */

// Cache configuration: Semi-static content - 5 minutes
// Lessons update occasionally, balance between freshness and performance
export const revalidate = 300; // 5 minutes in seconds

interface CreateLessonBody {
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  status?: "draft" | "published";
}

interface LessonOrderUpdate {
  id: string;
  order: number;
}

/**
 * GET /api/courses/[id]/lessons
 *
 * Retrieves all lessons for a specific course.
 *
 * @requires Authentication
 *
 * @param {Request} request - The request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the lessons or error message
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

    // בדיקה שהקורס קיים
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.id)
      .single();

    if (courseError) {
      logger.error("Course error:", courseError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: courseError.message },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select(
        `
        id,
        title,
        description,
        content,
        order,
        duration,
        status,
        created_at,
        updated_at,
        course_id
      `
      )
      .eq("course_id", params.id)
      .order("order", { ascending: true });

    if (error) {
      logger.error("Lessons error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(lessons || [], { status: 200 });
  } catch (error) {
    logger.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/lessons
 *
 * Creates a new lesson for a course.
 *
 * @requires Authentication & Authorization (Course Author)
 *
 * @param {Request} request - The request object containing the lesson data
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the created lesson or error message
 */
export async function POST(
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
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // בדיקה שהמשתמש הוא המדריך של הקורס
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", params.id)
      .single();

    if (courseError) {
      logger.error("Course error:", courseError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: courseError.message },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    if (course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: "אין לך הרשאה ליצור שיעור בקורס זה" },
        { status: 403 }
      );
    }

    const body: CreateLessonBody = await request.json();

    // בדיקת שדות חובה
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "חסרה כותרת" }, { status: 400 });
    }

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "חסר תוכן" }, { status: 400 });
    }

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          ...body,
          title: body.title.trim(),
          content: body.content.trim(),
          description: body.description?.trim(),
          course_id: params.id,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (lessonError) {
      logger.error("Lesson error:", lessonError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: lessonError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    logger.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/courses/[id]/lessons
 *
 * Updates lesson order for a course.
 *
 * @requires Authentication & Authorization (Course Author)
 *
 * @param {Request} request - The request object containing the lesson order updates
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing success message or error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // בדיקה שהמשתמש הוא המדריך של הקורס
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", params.id)
      .single();

    if (courseError) {
      logger.error("Course error:", courseError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: courseError.message },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    if (course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: "אין לך הרשאה לעדכן שיעורים בקורס זה" },
        { status: 403 }
      );
    }

    const updates: LessonOrderUpdate[] = await request.json();

    // בדיקת תקינות הנתונים
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "נדרש מערך של עדכוני סדר שיעורים" },
        { status: 400 }
      );
    }

    for (const update of updates) {
      if (!update.id || typeof update.order !== "number") {
        return NextResponse.json(
          { error: "כל עדכון חייב לכלול מזהה וסדר" },
          { status: 400 }
        );
      }
    }

    // עדכון סדר השיעורים - Using batch upsert to fix N+1 query problem
    // Instead of N queries (one per lesson), we use a single upsert operation
    const { error: batchError } = await supabase
      .from("lessons")
      .upsert(
        updates.map((update) => ({
          id: update.id,
          order: update.order,
          course_id: params.id,
        })),
        { onConflict: "id" }
      );

    if (batchError) {
      logger.error("Batch update error:", batchError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: batchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "סדר השיעורים עודכן בהצלחה" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
