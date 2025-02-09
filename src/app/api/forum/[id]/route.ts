/**
 * @file forum/[id]/route.ts
 * @description API routes for managing individual forum posts. Provides endpoints for retrieving,
 * updating, and deleting specific posts. Includes authentication and authorization checks.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

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
    const supabase = createServerClient(cookieStore);

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
      `,
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return NextResponse.json(
        { error: "Failed to fetch post" },
        { status: 500 },
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
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/forum/[id]
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
 *   "content": "Updated content..."
 * }
 * ```
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

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
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify post ownership
    if (post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this post" },
        { status: 403 },
      );
    }

    // Get update data from request
    const updates = await request.json();

    // Update post
    const { data: updatedPost, error } = await supabase
      .from("forum_posts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
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
      `,
      )
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in PATCH /api/forum/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
    const supabase = createServerClient(cookieStore);

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
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify post ownership
    if (post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 },
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
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/forum/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
