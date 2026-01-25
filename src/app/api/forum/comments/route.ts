import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import type { _ForumComment } from "@/types/forum";
import { createCommentSchema, updateCommentSchema } from "@/lib/validations/api-schemas";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";
import {
import { logger } from "@/lib/utils/logger";
  getPaginationParams,
  createPaginationResponse,
} from "@/lib/utils/pagination";

/**
 * @file forum/comments/route.ts
 * @description API routes for managing forum comments. Provides endpoints for retrieving,
 * creating, updating, and deleting comments. Includes authentication checks, input validation, and rate limiting.
 */

// Cache configuration: Frequent update - 1 minute
// Comments update frequently, balance between freshness and performance
export const revalidate = 60; // 1 minute in seconds

// Rate limiters
const getCommentsLimiter = rateLimit(apiRateLimits.standard);
const createCommentLimiter = rateLimit(apiRateLimits.strict);
const updateCommentLimiter = rateLimit(apiRateLimits.strict);
const deleteCommentLimiter = rateLimit(apiRateLimits.strict);

/**
 * GET /api/forum/comments
 *
 * Retrieves comments for a specific post.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the comments or error message
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await getCommentsLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const postId = request.url.split("/").pop();

  try {
    // Get pagination parameters
    const { page, limit, offset } = getPaginationParams(request);

    // Get total count for this post
    const { count } = await supabase
      .from("forum_comments")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    // Get paginated comments
    const { data: comments, error } = await supabase
      .from("forum_comments")
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        likes,
        post_id,
        parent_id,
        author_id,
        author:users(id, name, username, avatar_url),
        replies:forum_comments(
          id,
          content,
          created_at,
          updated_at,
          likes,
          post_id,
          parent_id,
          author_id,
          author:users(id, name, username, avatar_url)
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת התגובות" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      createPaginationResponse(comments || [], count || 0, { page, limit, offset })
    );
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
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await createCommentLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // Parse and validate input
    const json = await request.json();
    const validationResult = createCommentSchema.safeParse(json);

    if (!validationResult.success) {
      logger.warn("Comment validation failed:", validationResult.error.flatten(););
      return NextResponse.json(
        {
          error: "קלט לא תקין",
          message: "Invalid comment data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content, post_id, parent_id } = validationResult.data;

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .insert({
        content,
        post_id,
        parent_id,
        author_id: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        likes,
        post_id,
        parent_id,
        author_id,
        author:users(id, name, username, avatar_url),
        replies:forum_comments(
          id,
          content,
          created_at,
          updated_at,
          likes,
          post_id,
          parent_id,
          author_id,
          author:users(id, name, username, avatar_url)
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
export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await updateCommentLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // Parse and validate input
    const json = await request.json();
    const validationResult = updateCommentSchema.safeParse(json);

    if (!validationResult.success) {
      logger.warn("Comment update validation failed:", validationResult.error.flatten(););
      return NextResponse.json(
        {
          error: "קלט לא תקין",
          message: "Invalid comment data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("author_id", session.user.id) // SECURITY: Only author can update
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        likes,
        post_id,
        parent_id,
        author_id,
        author:users(id, name, username, avatar_url),
        replies:forum_comments(
          id,
          content,
          created_at,
          updated_at,
          likes,
          post_id,
          parent_id,
          author_id,
          author:users(id, name, username, avatar_url)
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
export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await deleteCommentLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    const { error } = await supabase
      .from("forum_comments")
      .delete()
      .eq("id", id)
      .eq("author_id", session.user.id); // SECURITY: Only author can delete

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
