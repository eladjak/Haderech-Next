import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export {};

/**
 * @file courses/[id]/lessons/[lessonId]/comments/route.ts
 * @description API routes for managing lesson comments. Provides endpoints for retrieving and creating comments.
 */

interface _RouteParams {
  params: {
    id: string;
    lessonId: string;
  };
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]/comments
 *
 * Retrieves all comments for a specific lesson.
 *
 * @param request - The request object
 * @param params - URL parameters containing courseId and lessonId
 * @returns Comments data or error response
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "comment1",
 *     "content": "Great explanation!",
 *     "created_at": "2024-01-01T12:00:00Z",
 *     "user": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "replies": [
 *       {
 *         "id": "reply1",
 *         "content": "Thanks!",
 *         "user": {
 *           "name": "Jane Doe",
 *           "avatar_url": "https://..."
 *         }
 *       }
 *     ]
 *   }
 * ]
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const { data: comments, error } = await supabase
      .from("lesson_comments")
      .select("*, author:users(*)")
      .eq("lesson_id", params.lessonId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching lesson comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error(
      "Error in GET /api/courses/[id]/lessons/[lessonId]/comments:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/lessons/[lessonId]/comments
 *
 * Creates a new comment or reply for a lesson.
 *
 * @requires Authentication
 *
 * @param request - The request object containing the comment data
 * @param params - URL parameters containing courseId and lessonId
 * @returns Created comment data or error response
 *
 * @example Request Body
 * ```json
 * {
 *   "content": "Great lesson!",
 *   "parent_id": "comment1" // Optional, for replies
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from("lesson_comments")
      .insert({
        content,
        lesson_id: params.lessonId,
        course_id: params.id,
        author_id: user.id,
      })
      .select("*, author:users(*)")
      .single();

    if (error) {
      console.error("Error creating lesson comment:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error(
      "Error in POST /api/courses/[id]/lessons/[lessonId]/comments:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
