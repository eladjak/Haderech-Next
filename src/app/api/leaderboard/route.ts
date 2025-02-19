/**
 * @file leaderboard/route.ts
 * @description API route for retrieving user rankings based on points and achievements.
 * Provides a leaderboard of top users with their profiles and scores.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { supabase } from "@/lib/services/supabase";
import { Database } from "@/types/supabase";

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
    const totalQuery = supabase.from("users").select("id", { count: "exact" });
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
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
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

    // Get score data
    const { score } = await req.json();
    if (typeof score !== "number") {
      return NextResponse.json(
        { error: "Score must be a number" },
        { status: 400 }
      );
    }

    // Get current score
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("score")
      .eq("id", session.user.id)
      .single();

    if (!currentProfile) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Update score
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        score: currentProfile.score + score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating score:", error);
      return NextResponse.json(
        { error: "שגיאה בעדכון הניקוד" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "הניקוד עודכן בהצלחה",
      newScore: updatedProfile.score,
    });
  } catch (error) {
    console.error("Error in PATCH /api/leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
