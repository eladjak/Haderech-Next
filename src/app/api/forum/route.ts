import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createPostSchema } from "@/lib/validations/api-schemas";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";
import {
import { logger } from "@/lib/utils/logger";
  getPaginationParams,
  createPaginationResponse,
} from "@/lib/utils/pagination";

export {};

/**
 * @file forum/route.ts
 * @description API routes for managing forum posts. Provides endpoints for listing all forum posts
 * and creating new posts. Includes authentication checks, input validation, and rate limiting.
 */

// Cache configuration: Frequent update - 1 minute
// Forum posts update frequently, balance between freshness and performance
export const revalidate = 60; // 1 minute in seconds

// Rate limiters
const getForumLimiter = rateLimit(apiRateLimits.standard);
const createForumPostLimiter = rateLimit(apiRateLimits.strict);

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
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await getForumLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");

    // Get pagination parameters
    const { page, limit, offset } = getPaginationParams(request);

    // Build base query with filters
    let baseQuery = supabase
      .from("forum_posts")
      .select("id", { count: "exact", head: true });

    if (category) {
      baseQuery = baseQuery.eq("category", category);
    }

    if (tag) {
      baseQuery = baseQuery.contains("tags", [tag]);
    }

    // Get total count
    const { count } = await baseQuery;

    // Build data query with pagination
    let query = supabase
      .from("forum_posts")
      .select(
        `
        id,
        title,
        content,
        created_at,
        updated_at,
        category,
        tags,
        author_id,
        views,
        likes,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data: posts, error } = await query;

    if (error) {
      logger.error("Database error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      createPaginationResponse(posts || [], count || 0, { page, limit, offset }),
      { status: 200 }
    );
  } catch (error) {
    logger.error("Server error:", error);
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
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await createForumPostLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    // Parse and validate input
    const json = await request.json();
    const validationResult = createPostSchema.safeParse(json);

    if (!validationResult.success) {
      logger.warn("Forum post validation failed:", validationResult.error.flatten(););
      return NextResponse.json(
        {
          error: "קלט לא תקין",
          message: "Invalid post data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, category, tags } = validationResult.data;

    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert({
        title: title,
        content: content,
        author_id: session.user.id,
        category: category || "general",
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        title,
        content,
        created_at,
        updated_at,
        category,
        tags,
        author_id,
        views,
        likes,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      )
      .single();

    if (error) {
      logger.error("Database error:", error);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    logger.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
