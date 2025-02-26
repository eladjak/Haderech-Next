import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { _NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import type { _ForumPost } from "@/types/forum";

/**
 * @file forum/posts/route.ts
 * @description API routes for managing individual forum posts. Provides endpoints for retrieving,
 * updating, and deleting specific posts. Includes authentication checks and post validation.
 */

/**
 * GET /api/forum/posts/[id]
 *
 * Retrieves a specific forum post by ID, including author information and comments.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the post or error message
 */
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const { data: post, error } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת הפוסט" },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה בטעינת הפוסט" }, { status: 500 });
  }
}

/**
 * POST /api/forum/posts
 *
 * Creates a new forum post.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created post or error message
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const json = await request.json();

    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert(json)
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת הפוסט" },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה ביצירת הפוסט" }, { status: 500 });
  }
}

/**
 * PUT /api/forum/posts/[id]
 *
 * Updates a specific forum post. Only the post author can update it.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the updated post or error message
 */
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const json = await request.json();

    const { data: post, error } = await supabase
      .from("forum_posts")
      .update(json)
      .eq("id", id)
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון הפוסט" },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה בעדכון הפוסט" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/posts/[id]
 *
 * Deletes a specific forum post. Only the post author can delete it.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const { error } = await supabase.from("forum_posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת הפוסט" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה במחיקת הפוסט" }, { status: 500 });
  }
}
