import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * @file forum/route.ts
 * @description API routes for managing forum posts. Provides endpoints for listing all forum posts
 * and creating new posts. Includes authentication checks and post validation.
 */

/**
 * GET /api/forum
 *
 * Retrieves all forum posts with their author information and comment counts.
 * Posts are ordered by creation date, with newest posts first.
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of posts or error message
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "post1",
 *     "title": "Discussion Topic",
 *     "content": "Let's discuss this topic...",
 *     "created_at": "2024-01-20T12:00:00Z",
 *     "author": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "comments": {
 *       "count": 5
 *     }
 *   }
 * ]
 * ```
 */
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");

    let query = supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      )
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(posts || [], { status: 200 });
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

/**
 * POST /api/forum
 *
 * Creates a new forum post. Only authenticated users can create posts.
 *
 * @requires Authentication
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created post or error message
 *
 * @example Request Body
 * ```json
 * {
 *   "title": "New Discussion Topic",
 *   "content": "Let's discuss this..."
 * }
 * ```
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    const json = await request.json();

    if (!json.title?.trim()) {
      return NextResponse.json({ error: "חסרה כותרת" }, { status: 400 });
    }

    if (!json.content?.trim()) {
      return NextResponse.json({ error: "חסר תוכן" }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert({
        title: json.title.trim(),
        content: json.content.trim(),
        author_id: session.user.id,
        category: json.category || "general",
        tags: json.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(post, { status: 201 });
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
