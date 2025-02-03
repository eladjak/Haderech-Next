/**
 * @file route.ts
 * @description API route handlers for courses collection operations
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * GET handler for retrieving courses list
 */
export async function GET(request: Request) {
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
      },
    );

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const instructorId = searchParams.get("instructor");

    let query = supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!instructor_id (
          id,
          name,
          avatar_url
        ),
        lessons (id)
      `,
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (level) {
      query = query.eq("level", level);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (instructorId) {
      query = query.eq("instructor_id", instructorId);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 },
      );
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for creating a new course
 */
export async function POST(request: Request) {
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
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseData = await request.json();

    const { data: course, error } = await supabase
      .from("courses")
      .insert([
        {
          ...courseData,
          instructor_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 },
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
