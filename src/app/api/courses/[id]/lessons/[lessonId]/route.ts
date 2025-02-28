import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export {};

/**
 * @file courses/[id]/lessons/[lessonId]/route.ts
 * @description API routes for managing individual lessons. Provides endpoints for retrieving,
 * updating, and deleting specific lessons.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // בדיקה שהקורס קיים
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.id)
      .single();

    if (courseError) {
      console.error("Course error:", courseError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: courseError.message },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: "הקורס לא נמצא" }, { status: 404 });
    }

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", params.lessonId)
      .eq("course_id", params.id)
      .single();

    if (error) {
      console.error("Lesson error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    if (!lesson) {
      return NextResponse.json({ error: "השיעור לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

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
      console.error("Course error:", courseError);
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
        { error: "אין לך הרשאה לעדכן שיעור בקורס זה" },
        { status: 403 }
      );
    }

    // בדיקה שהשיעור קיים
    const { data: existingLesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id")
      .eq("id", params.lessonId)
      .eq("course_id", params.id)
      .single();

    if (lessonError) {
      console.error("Lesson error:", lessonError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: lessonError.message },
        { status: 500 }
      );
    }

    if (!existingLesson) {
      return NextResponse.json({ error: "השיעור לא נמצא" }, { status: 404 });
    }

    const json = await request.json();
    const { title, content, order, duration, status } = json;

    // בדיקת שדות חובה
    if (!title?.trim()) {
      return NextResponse.json({ error: "חסרה כותרת" }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "חסר תוכן" }, { status: 400 });
    }

    const { data: lesson, error } = await supabase
      .from("lessons")
      .update({
        title: title.trim(),
        content: content.trim(),
        order,
        duration,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.lessonId)
      .eq("course_id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

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
      console.error("Course error:", courseError);
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
        { error: "אין לך הרשאה למחוק שיעור בקורס זה" },
        { status: 403 }
      );
    }

    // בדיקה שהשיעור קיים
    const { data: existingLesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id")
      .eq("id", params.lessonId)
      .eq("course_id", params.id)
      .single();

    if (lessonError) {
      console.error("Lesson error:", lessonError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: lessonError.message },
        { status: 500 }
      );
    }

    if (!existingLesson) {
      return NextResponse.json({ error: "השיעור לא נמצא" }, { status: 404 });
    }

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", params.lessonId)
      .eq("course_id", params.id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "השיעור נמחק בהצלחה" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
