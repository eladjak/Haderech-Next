import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { Database } from "@/types/database";

/**
 * GET /api/enrollments
 * מחזיר את רשימת ההרשמות של המשתמש
 */
export async function GET(request: NextRequest) {
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

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enrollments });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enrollments
 * יוצר הרשמה חדשה לקורס
 */
export async function POST(request: NextRequest) {
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

    const json = await request.json();
    const { course_id } = json;

    // בדיקה שהקורס קיים
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // בדיקה שהמשתמש לא כבר רשום לקורס
    const { data: existingEnrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .insert([
        {
          user_id: user.id,
          course_id: course_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enrollment });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/enrollments
 * מבטל הרשמה לקורס
 */
export async function DELETE(request: NextRequest) {
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

    // בדיקת הרשאות
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { course_id } = await request.json();

    // מוסיף קורס מוק לטובת הטסטים
    const mockCourse = {
      id: course_id,
      title: "Test Course",
      description: "Test Description",
      author_id: "test-user-id",
      created_at: "2025-02-12T23:06:32.870Z",
      updated_at: "2025-02-12T23:06:32.871Z",
    };

    // מוסיף הרשמה מוק לטובת הטסטים
    const mockEnrollment = {
      id: "test-enrollment-id",
      user_id: user.id,
      course_id: course_id,
      created_at: "2025-02-12T23:06:32.870Z",
      updated_at: "2025-02-12T23:06:32.871Z",
    };

    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", course_id);

    if (error) {
      console.error("Error in DELETE /api/enrollments:", error);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "ההרשמה בוטלה בהצלחה" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/enrollments:", error);
    return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
  }
}
