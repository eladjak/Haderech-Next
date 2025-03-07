import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { ForumPost } from "@/types/forum";

/**
 * @file forum/search/route.ts
 * @description API route for searching forum posts. Provides endpoints for searching
 * posts by title, content, tags, and other criteria. Includes pagination and sorting.
 */

// Import the dynamic directive
export const dynamic = "force-dynamic";

/**
 * GET /api/forum/search
 *
 * Searches forum posts based on query parameters.
 *
 * @param {Request} request - The incoming request object with search parameters
 * @returns {Promise<NextResponse>} JSON response containing the search results or error message
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "latest";
    const timeframe = searchParams.get("timeframe") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let dbQuery = supabase.from("forum_posts").select(
      `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
    );

    // חיפוש לפי טקסט
    if (query) {
      dbQuery = dbQuery.match("title", query);
    }

    // סינון לפי קטגוריה
    if (category) {
      dbQuery = dbQuery.eq("category_id", category);
    }

    // סינון לפי תגית
    if (tag) {
      dbQuery = dbQuery.contains("tags", [tag]);
    }

    // סינון לפי סטטוס
    if (status === "solved") {
      dbQuery = dbQuery.eq("solved", true);
    } else if (status === "unsolved") {
      dbQuery = dbQuery.eq("solved", false);
    }

    // סינון לפי זמן
    if (timeframe !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (timeframe) {
        case "today":
          startDate.setDate(now.getDate() - 1);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dbQuery = dbQuery.gte("created_at", startDate.toISOString());
    }

    // מיון תוצאות
    switch (sort) {
      case "latest":
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
      case "popular":
        dbQuery = dbQuery.order("likes", { ascending: false });
        break;
      case "unanswered":
        dbQuery = dbQuery
          .eq("comments_count", 0)
          .order("created_at", { ascending: false });
        break;
    }

    // אם צריך דפדוף, הפעלת הפונקציה range
    if (page && limit) {
      const offset = (page - 1) * limit;
      dbQuery = dbQuery.range(offset, offset + limit - 1);
    }

    const { data: posts, error, count } = await dbQuery;

    if (error) {
      console.error("Error in GET /api/forum/search:", error);
      return NextResponse.json(
        { error: "שגיאה בחיפוש פוסטים" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (_error) {
    console.error("Error in GET /api/forum/search:", _error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
