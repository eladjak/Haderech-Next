/**
 * @file community/route.ts
 * @description API routes for managing community posts. Provides endpoints for listing all posts
 * and creating new posts. Includes authentication checks and post validation.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * GET /api/community
 *
 * Retrieves all community posts with their author information and comment counts.
 * Posts are ordered by creation date, with newest posts first.
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of posts or error message
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "post1",
 *     "title": "Learning Tips",
 *     "content": "Here are some effective learning strategies...",
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

    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles(id, name, avatar_url),
        comments:post_comments(count)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "שגיאה בקבלת הפוסטים" },
        { status: 500 },
      );
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error in GET /api/community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/community
 *
 * Creates a new community post. Only authenticated users can create posts.
 *
 * @requires Authentication
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created post or error message
 *
 * @example Request Body
 * ```json
 * {
 *   "title": "New Post Title",
 *   "content": "Post content goes here..."
 * }
 * ```
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

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get post data from request body
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    // Create post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        author_id: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json({ error: "שגיאה ביצירת פוסט" }, { status: 500 });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
