import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";
import { createCommunityPostSchema } from "@/lib/validations/api-schemas";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";
import {
import { logger } from "@/lib/utils/logger";
  getPaginationParams,
  createPaginationResponse,
} from "@/lib/utils/pagination";

/**
 * @file community/route.ts
 * @description API routes for managing community posts. Provides endpoints for listing all posts
 * and creating new posts. Includes authentication checks, input validation, and rate limiting.
 */

// Cache configuration: Frequent update - 1 minute
// Community posts update frequently, balance between freshness and performance
export const revalidate = 60; // 1 minute in seconds

// Rate limiters
const getCommunityLimiter = rateLimit(apiRateLimits.standard);
const createCommunityPostLimiter = rateLimit(apiRateLimits.strict);

/**
 * GET /api/community
 *
 * Fetches community data including forum posts and user information.
 *
 * @returns Community data or error response
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await getCommunityLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

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

    // Get pagination parameters
    const { page, limit, offset } = getPaginationParams(request);

    // Get total count
    const { count } = await supabase
      .from("forum_posts")
      .select("id", { count: "exact", head: true });

    // Fetch paginated forum posts with author information (fixed over-fetching)
    const { data: posts, error: postsError } = await supabase
      .from("forum_posts")
      .select(
        `
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id,
        category,
        tags,
        views,
        likes,
        author:users(id, name, avatar_url)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      logger.error("Error fetching forum posts:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch forum posts" },
        { status: 500 }
      );
    }

    // Fetch top contributors (keep as is, already limited)
    const { data: topContributors, error: contributorsError } = await supabase
      .from("users")
      .select("id, name, avatar_url, forum_posts")
      .order("forum_posts", { ascending: false })
      .limit(5);

    if (contributorsError) {
      logger.error("Error fetching top contributors:", contributorsError);
      return NextResponse.json(
        { error: "Failed to fetch top contributors" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...createPaginationResponse(posts || [], count || 0, { page, limit, offset }),
      topContributors,
    });
  } catch (error) {
    logger.error("Error in GET /api/community:", error);
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
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await createCommunityPostLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

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

    // Parse and validate input
    const json = await request.json();
    const validationResult = createCommunityPostSchema.safeParse(json);

    if (!validationResult.success) {
      logger.warn("Community post validation failed:", validationResult.error.flatten(););
      return NextResponse.json(
        {
          error: "קלט לא תקין",
          message: "Invalid post data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content } = validationResult.data;

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
      logger.error("Error creating post:", error);
      return NextResponse.json({ error: "שגיאה ביצירת פוסט" }, { status: 500 });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    logger.error("Error in POST /api/community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
