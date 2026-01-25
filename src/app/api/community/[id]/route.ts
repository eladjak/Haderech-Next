import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import { logger } from "@/lib/utils/logger";

/**
 * @file community/[id]/route.ts
 * @description API routes for managing individual community posts. Provides endpoints for retrieving,
 * updating, and deleting specific posts. Includes authentication and authorization checks.
 */

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/community/[id]
 *
 * Returns a specific community post with its comments and reactions.
 *
 * @param id - The post ID
 * @returns The post data with related information
 *
 * Example response:
 * ```json
 * {
 *   id: "123",
 *   title: "Post title",
 *   content: "Post content",
 *   author: {
 *     id: "456",
 *     name: "John Doe",
 *     avatar_url: "https://..."
 *   },
 *   comments: [...],
 *   reactions: [...]
 * }
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
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

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:users(id, name, avatar_url),
        comments:post_comments(
          id,
          content,
          created_at,
          author:users(id, name, avatar_url)
        ),
        reactions:post_reactions(
          id,
          type,
          user:users(id, name)
        )
      `
      )
      .eq("id", params.id)
      .single();

    if (error) {
      logger.error("Error fetching post:", error);
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
    logger.error("Error in GET /api/community/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/community/[id]
 *
 * Updates a specific post. Only the post author can update the post.
 *
 * @param request - The request containing the updated data
 * @param id - The post ID to update
 * @returns The updated post or error message
 *
 * Example request body:
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check if user is post author
    const { data: post } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this post" },
        { status: 403 }
      );
    }

    // Update post
    const { data: updatedPost, error } = await supabase
      .from("posts")
      .update({ title, content })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating post:", error);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    logger.error("Error in PATCH /api/community/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/community/[id]
 *
 * Deletes a specific community post and all its related data (comments, reactions).
 * Only the post author or an admin can delete a post.
 *
 * @param id - The post ID to delete
 * @returns Success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is post author or admin
    const { data: post } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author_id !== session.user.id) {
      const { data: user } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Not authorized to delete this post" },
          { status: 403 }
        );
      }
    }

    // Delete post and all related data
    const { error } = await supabase.from("posts").delete().eq("id", params.id);

    if (error) {
      logger.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error in DELETE /api/community/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
