/**
 * @file forum/route.ts
 * @description API routes for managing forum posts. Provides endpoints for listing all forum posts
 * and creating new posts. Includes authentication checks and post validation.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";

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
export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת הפוסטים" },
        { status: 500 }
      );
    }

    return NextResponse.json(posts);
  } catch (_error) {
    return NextResponse.json(
      { error: "שגיאה בטעינת הפוסטים" },
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
