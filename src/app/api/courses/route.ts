import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/types/supabase";

/**
 * @file route.ts
 * @description API routes for courses. Provides endpoints for retrieving all courses,
 * creating new courses. Includes authentication and authorization checks where needed.
 */

interface _CreateCourseBody {
  title: string;
  description: string;
  image_url?: string;
  status?: "draft" | "published" | "archived";
  level?: "beginner" | "intermediate" | "advanced";
  duration?: number;
  tags?: string[];
}

/**
 * GET /api/courses
 *
 * Returns all courses with their details.
 *
 * @returns {Promise<NextResponse>} JSON response containing the courses or error message
 */
export async function GET(_request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 *
 * Creates a new course. Only authenticated users can create courses.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created course or error message
 */
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { title, description, image_url, price, duration } = json;

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          image_url,
          price,
          duration,
          instructor_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 }
      );
    }

    return NextResponse.json({ course: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
