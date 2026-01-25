import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";
import { logger } from "@/lib/utils/logger";

/**
 * @file bookmarks/route.ts
 * @description API endpoints for managing user bookmarks with rate limiting
 */

// Rate limiters
const getBookmarksLimiter = rateLimit(apiRateLimits.standard);
const createBookmarkLimiter = rateLimit(apiRateLimits.strict);
const deleteBookmarkLimiter = rateLimit(apiRateLimits.strict);

/**
 * GET handler for retrieving user bookmarks
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = await getBookmarksLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      logger.error("Error fetching bookmarks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error in bookmarks GET:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new bookmark
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await createBookmarkLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const body = await request.json();

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) {
      logger.error("Error creating bookmark:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error("Error in bookmarks POST:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a bookmark
 */
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await deleteBookmarkLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("id");

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", userId);

    if (error) {
      logger.error("Error deleting bookmark:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error in bookmarks DELETE:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
