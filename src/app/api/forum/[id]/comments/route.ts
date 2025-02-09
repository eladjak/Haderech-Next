/**
 * @file forum/[id]/comments/route.ts
 * @description API routes for managing forum post comments. Provides endpoints for retrieving
 * comments for a post and adding new comments. Includes authentication checks and comment validation.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

import type { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];
type ForumComment = Tables["forum_comments"]["Row"];
type User = Tables["users"]["Row"];

interface RouteParams {
  params: {
    id: string;
  };
}

interface CommentWithRelations extends ForumComment {
  author: User;
  replies: (ForumComment & { author: User })[];
}

/**
 * GET /api/forum/[id]/comments
 *
 * Retrieves all comments for a specific forum post.
 *
 * @requires Authentication
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the comments or error message
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "comment1",
 *     "content": "Great post!",
 *     "created_at": "2024-01-01T12:00:00Z",
 *     "author": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "replies": [
 *       {
 *         "id": "reply1",
 *         "content": "Thanks!",
 *         "author": {
 *           "name": "Jane Doe",
 *           "avatar_url": "https://..."
 *         }
 *       }
 *     ]
 *   }
 * ]
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

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
      `,
      )
      .eq("post_id", params.id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 },
      );
    }

    return NextResponse.json(comments as CommentWithRelations[]);
  } catch (error) {
    console.error("Error in GET /api/forum/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/forum/[id]/comments
 *
 * Creates a new comment on a forum post.
 *
 * @requires Authentication
 *
 * @param {Request} request - The request object containing the comment data
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the created comment or error message
 *
 * @example Request
 * ```json
 * {
 *   "content": "Great post!",
 *   "parent_id": "comment1" // Optional, for replies
 * }
 * ```
 */
interface CreateCommentBody {
  content: string;
  parent_id?: string | null;
}

export async function POST(request: Request, { params }: RouteParams) {
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

    // Get comment data from request
    const { content, parent_id }: CreateCommentBody = await request.json();

    // Validate content
    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 },
      );
    }

    // If this is a reply, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from("forum_comments")
        .select("id")
        .eq("id", parent_id)
        .eq("post_id", params.id)
        .single();

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        );
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from("forum_comments")
      .insert({
        post_id: params.id,
        author_id: session.user.id,
        content,
        parent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
      })
      .select(
        `
        *,
        author:users(*),
        replies:forum_comments(
          *,
          author:users(*)
        )
      `,
      )
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 },
      );
    }

    return NextResponse.json(comment as CommentWithRelations);
  } catch (error) {
    console.error("Error in POST /api/forum/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
