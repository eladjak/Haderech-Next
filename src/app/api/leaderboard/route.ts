import type { Database } from "types/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export {};

/**
 * @file leaderboard/route.ts
 * @description API route for retrieving user rankings based on points and achievements.
 * Provides a leaderboard of top users with their profiles and scores.
 */

// Constants for pagination and time periods
const PAGE_SIZE = 10;
const TIME_PERIODS = {
  week: "7 days",
  month: "30 days",
  year: "365 days",
  all: "all",
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

/**
 * GET /api/leaderboard
 *
 * Retrieves the top users ranked by their total points and achievements.
 * Includes user profile information and achievement statistics.
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of ranked users or error message
 *
 * @example Response
 * ```json
 * [
 *   {
 *     "rank": 1,
 *     "user": {
 *       "name": "John Doe",
 *       "avatar_url": "https://...",
 *       "points": 1000,
 *       "achievements_count": 15,
 *       "completed_courses": 5
 *     }
 *   }
 * ]
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as TimePeriod) || "all";
    const page = parseInt(searchParams.get("page") || "1");

    if (!TIME_PERIODS[period]) {
      return NextResponse.json(
        { error: "Invalid time period" },
        { status: 400 }
      );
    }

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    // Calculate the date range for the query
    const startDate =
      period === "all"
        ? null
        : new Date(
            Date.now() - parseInt(TIME_PERIODS[period]) * 24 * 60 * 60 * 1000
          ).toISOString();

    // Base query to get users with their points
    let query = supabase
      .from("users")
      .select(
        `
        id,
        name,
        avatar_url,
        points,
        level,
        badges,
        completed_courses,
        forum_posts,
        login_streak
      `
      )
      .order("points", { ascending: false });

    // Apply time period filter if not 'all'
    if (startDate) {
      query = query.gte("updated_at", startDate);
    }

    // Apply pagination
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const totalQuery = supabase.from("users").select("id");
    if (startDate) {
      totalQuery.gte("updated_at", startDate);
    }

    const { count: total } = await totalQuery;

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update user score
export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // בדיקת אימות
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    // קבלת הנתונים מהבקשה
    const data = await req.json();
    const { points, actionType } = data;
    const userId = session.user.id;

    if (typeof points !== "number") {
      return NextResponse.json(
        { error: "נדרש מספר נקודות תקף" },
        { status: 400 }
      );
    }

    // עדכון טבלת המשתמשים
    const { error: updateError } = await supabase
      .from("users")
      .update({ points })
      .eq("id", userId);

    if (updateError) {
      console.error("שגיאה בעדכון נקודות:", updateError);
      return NextResponse.json(
        { error: "נכשל בעדכון נקודות" },
        { status: 500 }
      );
    }

    // הוספה להיסטוריית נקודות
    await supabase.from("points_history").insert({
      user_id: userId,
      points: points,
      reason: actionType || "score_update",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("שגיאה בעדכון נקודות:", error);
    return NextResponse.json({ error: "שגיאה בלתי צפויה" }, { status: 500 });
  }
}
