import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * @file forum/[id]/route.ts
 * @description API routes for managing individual forum posts. Provides endpoints for retrieving,
 * updating, and deleting specific posts. Includes authentication and authorization checks.
 */

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/forum/[id]
 *
 * Retrieves a specific forum post with all its details.
 *
 * @requires Authentication
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the post or error message
 *
 * @example Response
 * ```json
 * {
 *   "id": "post1",
 *   "title": "Post Title",
 *   "content": "Post content...",
 *   "created_at": "2024-01-01T12:00:00Z",
 *   "author": {
 *     "name": "John Doe",
 *     "avatar_url": "https://..."
 *   },
 *   "comments": [
 *     {
 *       "id": "comment1",
 *       "content": "Great post!",
 *       "author": {
 *         "name": "Jane Doe",
 *         "avatar_url": "https://..."
 *       }
 *     }
 *   ]
 * }
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: post, error } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(*),
        comments:forum_comments(
          *,
          author:users(*),
          replies:forum_comments(
            *,
            author:users(*)
          )
        )
      `
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return NextResponse.json(
        { error: "Failed to fetch post" },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error in GET /api/forum/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forum/[id]
 *
 * Updates a forum post.
 *
 * @requires Authentication & Authorization (Post Author)
 *
 * @param {Request} request - The request object containing the updated post data
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the updated post or error message
 *
 * @example Request
 * ```json
 * {
 *   "title": "Updated Title",
 *   "content": "Updated content...",
 *   "tags": ["tag1", "tag2"],
 *   "category": "General"
 * }
 * ```
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, tags, category } = await request.json();

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check post ownership
    const { data: postData } = await supabase
      .from("forum_posts")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!postData || postData.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }

    // צ׳יין מספר שיטות יחד
    const queryChain = supabase
      .from("forum_posts")
      .update({
        title,
        content,
        tags,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    const { data: post, error } = await queryChain
      .select(
        `
        *,
        author:user_id (
          id,
          name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("Error in forum post PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forum/[id]
 *
 * Deletes a forum post.
 *
 * @requires Authentication & Authorization (Post Author)
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get post to verify ownership
    const { data: post } = await supabase
      .from("forum_posts")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify post ownership
    if (post.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 }
      );
    }

    // Delete post (cascade will handle related records)
    const { error } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/forum/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
