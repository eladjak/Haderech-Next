/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for retrieving and creating lessons.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { Database, DatabaseCourse, DatabaseLesson } from "@/types/database";

type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];

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
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "lesson1",
 *     "title": "Introduction",
 *     "description": "Course overview",
 *     "content": "Lesson content...",
 *     "order": 1,
 *     "status": "published"
 *   }
 * ]
 * ```
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

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", params.id)
      .order("order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({ error: "לא נמצאו שיעורים" }, { status: 404 });
    }

    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
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
 *
 * @example Request
 * ```json
 * {
 *   "title": "New Lesson",
 *   "description": "Lesson description",
 *   "content": "Lesson content...",
 *   "order": 1,
 *   "status": "draft"
 * }
 * ```
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

    if (courseError || !course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    if (course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: "אין לך הרשאה ליצור שיעור בקורס זה" },
        { status: 403 }
      );
    }

    const body: CreateLessonBody = await request.json();

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          ...body,
          course_id: params.id,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (lessonError) {
      return NextResponse.json(
        { error: "שגיאה ביצירת השיעור" },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
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

    if (courseError || !course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    if (course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: "אין לך הרשאה לעדכן שיעורים בקורס זה" },
        { status: 403 }
      );
    }

    const updates: LessonOrderUpdate[] = await request.json();

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("lessons")
        .update({ order: update.order })
        .eq("id", update.id)
        .eq("course_id", params.id);

      if (updateError) {
        return NextResponse.json(
          { error: "שגיאה בעדכון סדר השיעורים" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "סדר השיעורים עודכן בהצלחה" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
  }
}
