import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { _Database } from "@/types/supabase";
import {
  getPaginationParams,
  createPaginationResponse,
} from "@/lib/utils/pagination";

/**
 * @file route.ts
 * @description API route handlers for courses collection operations
 */

// Cache configuration: Static content - 1 hour
// Courses don't change frequently, so we can cache them for longer
export const revalidate = 3600; // 1 hour in seconds

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
 * Returns paginated courses with their details.
 *
 * @param {NextRequest} request - The request object with optional pagination params
 * @returns {Promise<NextResponse>} JSON response containing paginated courses or error message
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

    // Get pagination parameters
    const { page, limit, offset } = getPaginationParams(request);

    // Get total count
    const { count } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true });

    // Get paginated courses
    const { data: courses, error } = await supabase
      .from("courses")
      .select(
        `
        id,
        title,
        description,
        image_url,
        status,
        level,
        duration,
        price,
        tags,
        created_at,
        updated_at,
        instructor_id
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      createPaginationResponse(courses || [], count || 0, { page, limit, offset })
    );
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
