import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

// Achievement definitions
const ACHIEVEMENTS_DATA = {
  FIRST_LOGIN: {
    id: "first_login",
    title: "התחברות ראשונה",
    description: "התחברת לאפליקציה בפעם הראשונה",
    points: 10,
  },
  COMPLETE_PROFILE: {
    id: "complete_profile",
    title: "פרופיל מושלם",
    description: "השלמת את כל פרטי הפרופיל שלך",
    points: 20,
  },
  FIRST_COURSE: {
    id: "first_course",
    title: "סטודנט מתחיל",
    description: "השלמת את הקורס הראשון שלך",
    points: 30,
  },
  SOCIAL_BUTTERFLY: {
    id: "social_butterfly",
    title: "פרפר חברתי",
    description: "הצטרפת ל-5 קבוצות לימוד",
    points: 25,
  },
  CHAT_MASTER: {
    id: "chat_master",
    title: "מאסטר הצ'אט",
    description: "קיימת 50 אינטראקציות בצ'אט",
    points: 35,
  },
  SIMULATOR_MASTER: {
    id: "simulator_master",
    title: "מאסטר הסימולטור",
    description: "השלמת 50 אינטראקציות בסימולטור",
    points: 40,
  },
  FEEDBACK_CHAMPION: {
    id: "feedback_champion",
    title: "אלוף המשוב",
    description: "קיבלת ציון ממוצע של 4.5 ב-10 סימולציות",
    points: 50,
  },
} as const;

// Get user achievements
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
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

    const { data: achievements, error } = await supabase
      .from("user_achievements")
      .select(
        `
        id,
        achievement_id,
        progress,
        completed,
        completed_at
      `
      )
      .eq("user_id", session.user.id);

    if (error) {
      logger.error("Error fetching achievements:", error);
      return NextResponse.json(
        { error: "שגיאה בקבלת ההישגים" },
        { status: 500 }
      );
    }

    // Map achievements with their definitions
    const achievementsWithDetails = achievements.map((achievement) => ({
      ...achievement,
      ...ACHIEVEMENTS_DATA[
        achievement.achievement_id as keyof typeof ACHIEVEMENTS_DATA
      ],
    }));

    return NextResponse.json(achievementsWithDetails);
  } catch (error) {
    logger.error("Error in GET /api/achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Check achievements and award new ones
export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
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

    // Get user stats
    const {
      simulatorInteractions,
      completedSimulations,
      averageFeedback,
      isFirstLogin,
      profileCompletion,
      completedCourses,
      joinedGroups,
      chatInteractions,
    } = await req.json();

    // Get current achievements
    const { data: currentAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", session.user.id);

    const existingAchievements =
      currentAchievements?.map((a) => a.achievement_id) || [];
    const newAchievements = [];

    // Check each achievement condition
    if (
      isFirstLogin &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.FIRST_LOGIN.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.FIRST_LOGIN.id);
    }

    if (
      profileCompletion === 100 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.COMPLETE_PROFILE.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.COMPLETE_PROFILE.id);
    }

    if (
      completedCourses > 0 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.FIRST_COURSE.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.FIRST_COURSE.id);
    }

    if (
      joinedGroups >= 5 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.SOCIAL_BUTTERFLY.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.SOCIAL_BUTTERFLY.id);
    }

    if (
      chatInteractions >= 50 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.CHAT_MASTER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.CHAT_MASTER.id);
    }

    if (
      simulatorInteractions >= 50 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.SIMULATOR_MASTER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.SIMULATOR_MASTER.id);
    }

    if (
      completedSimulations >= 10 &&
      averageFeedback >= 4.5 &&
      !existingAchievements.includes(ACHIEVEMENTS_DATA.FEEDBACK_CHAMPION.id)
    ) {
      newAchievements.push(ACHIEVEMENTS_DATA.FEEDBACK_CHAMPION.id);
    }

    // Add new achievements
    if (newAchievements.length > 0) {
      const achievementsToInsert = newAchievements.map((achievementId) => ({
        user_id: session.user.id,
        achievement_id: achievementId,
        completed: true,
        completed_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("user_achievements")
        .insert(achievementsToInsert);

      if (error) {
        logger.error("Error adding achievements:", error);
        return NextResponse.json(
          { error: "שגיאה בהוספת הישגים" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      newAchievements: newAchievements.map(
        (id) => ACHIEVEMENTS_DATA[id as keyof typeof ACHIEVEMENTS_DATA]
      ),
    });
  } catch (error) {
    logger.error("Error in POST /api/achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
