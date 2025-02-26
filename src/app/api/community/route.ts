import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/types/supabase";

/**
 * @file community/route.ts
 * @description API routes for managing community posts. Provides endpoints for listing all posts
 * and creating new posts. Includes authentication checks and post validation.
 */

/**
 * GET /api/community
 *
 * Fetches community data including forum posts and user information.
 *
 * @returns Community data or error response
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
      }
    );

    // Fetch forum posts with author information
    const { data: posts, error: postsError } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(id, name, avatar_url),
        comments (
          *,
          author:users(id, name, avatar_url)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching forum posts:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch forum posts" },
        { status: 500 }
      );
    }

    // Fetch top contributors
    const { data: topContributors, error: contributorsError } = await supabase
      .from("users")
      .select("id, name, avatar_url, forum_posts")
      .order("forum_posts", { ascending: false })
      .limit(5);

    if (contributorsError) {
      console.error("Error fetching top contributors:", contributorsError);
      return NextResponse.json(
        { error: "Failed to fetch top contributors" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts,
      topContributors,
    });
  } catch (error) {
    console.error("Error in GET /api/community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      }
    );

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get post data from request body
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
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
      { status: 500 }
    );
  }
}
