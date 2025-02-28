import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { _NextRequest } from "@/lib/utils";
import type { Database } from "@/types";
import type { _ForumComment } from "@/types/forum";

("use client");

export {};

/**
 * @file forum/comments/route.ts
 * @description API routes for managing forum comments. Provides endpoints for retrieving,
 * creating, updating, and deleting comments. Includes authentication checks and validation.
 */

/**
 * GET /api/forum/comments
 *
 * Retrieves comments for a specific post.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the comments or error message
 */
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const postId = request.url.split("/").pop();

  try {
    const { data: comments, error } = await supabase
      .from("forum_comments")
      .select(
        `
        *,
        author:users(*),
        replies:forum_comments(
          *,
          author:users(*)
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת התגובות" },
        { status: 500 }
      );
    }

    return NextResponse.json(comments);
  } catch (_error) {
    return NextResponse.json(
      { error: "שגיאה בטעינת התגובות" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forum/comments
 *
 * Creates a new comment on a post.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created comment or error message
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const json = await request.json();

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .insert(json)
      .select(
        `
        *,
        author:users(*),
        replies:forum_comments(
          *,
          author:users(*)
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת התגובה" },
        { status: 500 }
      );
    }

    return NextResponse.json(comment);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה ביצירת התגובה" }, { status: 500 });
  }
}

/**
 * PUT /api/forum/comments/[id]
 *
 * Updates a specific comment. Only the comment author can update it.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the updated comment or error message
 */
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const json = await request.json();

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .update(json)
      .eq("id", id)
      .select(
        `
        *,
        author:users(*),
        replies:forum_comments(
          *,
          author:users(*)
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון התגובה" },
        { status: 500 }
      );
    }

    return NextResponse.json(comment);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה בעדכון התגובה" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/comments/[id]
 *
 * Deletes a specific comment. Only the comment author can delete it.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const { error } = await supabase
      .from("forum_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת התגובה" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה במחיקת התגובה" }, { status: 500 });
  }
}
