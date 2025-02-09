/**
 * @file leaderboard/route.ts
 * @description API route for retrieving user rankings based on points and achievements.
 * Provides a leaderboard of top users with their profiles and scores.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";

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
export async function GET() {
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
      },
    );

    const { data: leaderboard, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        avatar_url,
        points,
        achievements:user_achievements(count),
        courses:course_enrollments(count)
      `,
      )
      .order("points", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json(
        { error: "שגיאה בטעינת טבלת המובילים" },
        { status: 500 },
      );
    }

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      user,
    }));

    return NextResponse.json(rankedLeaderboard);
  } catch (error) {
    console.error("Error in GET /api/leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
      },
    );

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get score data
    const { score } = await req.json();
    if (typeof score !== "number") {
      return NextResponse.json(
        { error: "Score must be a number" },
        { status: 400 },
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
        { status: 500 },
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
      { status: 500 },
    );
  }
}
