import { query } from "./_generated/server";

// ==========================================
// Student Progress - Phase 65
// Enhanced analytics for the student dashboard
// ==========================================

// Helper: resolve user from Clerk identity
async function resolveUser(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  db: any;
}): Promise<{ user: any; identity: { subject: string } } | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return user ? { user, identity } : null;
}

// ==========================================
// getDetailedProgress
// Per-course breakdown: lesson completion, quiz scores, time spent
// ==========================================

export const getDetailedProgress = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    if (enrollments.length === 0) return [];

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const allQuizAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_course", (q: any) => q.eq("userId", user._id))
      .collect();

    const results = [];

    for (const enrollment of enrollments) {
      const course = await ctx.db.get(enrollment.courseId);
      if (!course) continue;

      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q: any) => q.eq("courseId", course._id))
        .collect();

      const publishedLessons = lessons.filter((l: any) => l.published);
      const courseProgress = allProgress.filter(
        (p: any) => p.courseId === course._id
      );

      const completedLessons = courseProgress.filter(
        (p: any) => p.completed
      ).length;
      const totalWatchSeconds = courseProgress.reduce(
        (sum: number, p: any) => sum + (p.watchTimeSeconds || 0),
        0
      );
      const lastActivity =
        courseProgress.length > 0
          ? Math.max(...courseProgress.map((p: any) => p.lastWatchedAt))
          : enrollment.enrolledAt;

      // Quiz scores for this course
      const courseQuizAttempts = allQuizAttempts.filter(
        (a: any) => a.courseId === course._id
      );
      const avgQuizScore =
        courseQuizAttempts.length > 0
          ? Math.round(
              courseQuizAttempts.reduce(
                (sum: number, a: any) => sum + a.score,
                0
              ) / courseQuizAttempts.length
            )
          : null;

      const percent =
        publishedLessons.length > 0
          ? Math.round((completedLessons / publishedLessons.length) * 100)
          : 0;

      // Next lesson to continue
      const completedIds = new Set(
        courseProgress.filter((p: any) => p.completed).map((p: any) => p.lessonId)
      );
      const nextLesson = publishedLessons
        .sort((a: any, b: any) => a.order - b.order)
        .find((l: any) => !completedIds.has(l._id));

      results.push({
        courseId: course._id as string,
        title: course.title,
        imageUrl: course.imageUrl ?? null,
        category: course.category ?? null,
        level: course.level ?? null,
        totalLessons: publishedLessons.length,
        completedLessons,
        percent,
        watchTimeSeconds: totalWatchSeconds,
        avgQuizScore,
        lastActivity,
        enrolledAt: enrollment.enrolledAt,
        nextLessonId: nextLesson ? (nextLesson._id as string) : null,
        nextLessonTitle: nextLesson ? nextLesson.title : null,
      });
    }

    return results.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// ==========================================
// getLearningStreak
// Consecutive days of activity, longest streak, current streak, last 30 days
// ==========================================

export const getLearningStreak = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    // Build a set of all active days (YYYY-MM-DD strings)
    const allActiveDays = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      allActiveDays.add(key);
    }

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    let currentStreak = 0;
    const isActiveToday = allActiveDays.has(todayKey);
    const isActiveYesterday = allActiveDays.has(yesterdayKey);

    if (isActiveToday || isActiveYesterday) {
      currentStreak = 1;
      const startDate = isActiveToday ? today : yesterday;
      for (let i = 1; i <= 365; i++) {
        const prevDate = new Date(startDate.getTime() - 86400000 * i);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
        if (allActiveDays.has(prevKey)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak ever
    const sortedDays = Array.from(allActiveDays).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dayStr of sortedDays) {
      const [year, month, day] = dayStr.split("-").map(Number);
      const date = new Date(year!, month! - 1, day!);
      if (prevDate) {
        const diffMs = date.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = date;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Last 30 days activity map (day key -> boolean)
    const last30Days: { date: string; active: boolean; isToday: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - 86400000 * i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      last30Days.push({
        date: key,
        active: allActiveDays.has(key),
        isToday: i === 0,
      });
    }

    return {
      currentStreak,
      longestStreak,
      totalActiveDays: allActiveDays.size,
      isActiveToday,
      last30Days,
    };
  },
});

// ==========================================
// getWeeklyActivity
// Activity data for the last 7 days (lessons completed, time per day)
// ==========================================

export const getWeeklyActivity = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const hebrewDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build 7-day slots: index 0 = 6 days ago, index 6 = today
    const days: {
      label: string;
      shortDate: string;
      lessonsCompleted: number;
      watchTimeSeconds: number;
      isToday: boolean;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - 86400000 * i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;

      const dayProgress = allProgress.filter(
        (p: any) => p.lastWatchedAt >= dayStart && p.lastWatchedAt < dayEnd
      );

      days.push({
        label: hebrewDays[d.getDay()] ?? "",
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
        lessonsCompleted: dayProgress.filter((p: any) => p.completed).length,
        watchTimeSeconds: dayProgress.reduce(
          (sum: number, p: any) => sum + (p.watchTimeSeconds || 0),
          0
        ),
        isToday: i === 0,
      });
    }

    const totalThisWeek = allProgress.filter(
      (p: any) => p.lastWatchedAt > weekAgo
    );
    const totalLessonsThisWeek = totalThisWeek.filter(
      (p: any) => p.completed
    ).length;
    const totalTimeThisWeek = totalThisWeek.reduce(
      (sum: number, p: any) => sum + (p.watchTimeSeconds || 0),
      0
    );

    return {
      days,
      totalLessonsThisWeek,
      totalTimeThisWeekSeconds: totalTimeThisWeek,
    };
  },
});

// ==========================================
// getAchievements
// Unlocked achievements based on milestones
// ==========================================

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user } = resolved;

    // Get user's stats
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const completedLessons = allProgress.filter((p: any) => p.completed).length;

    const allQuizAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_course", (q: any) => q.eq("userId", user._id))
      .collect();

    const passedQuizzes = allQuizAttempts.filter((a: any) => a.passed).length;
    const perfectQuizzes = allQuizAttempts.filter(
      (a: any) => a.score === 100
    ).length;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
    const totalXp = xpEvents.reduce(
      (sum: number, e: any) => sum + e.points,
      0
    );

    // Build active-days set for streak calc
    const allActiveDays = new Set<string>();
    for (const p of allProgress) {
      const d = new Date(p.lastWatchedAt);
      allActiveDays.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }

    // Check if active today or yesterday for streak
    const todayD = new Date();
    todayD.setHours(0, 0, 0, 0);
    const todayKey = `${todayD.getFullYear()}-${String(todayD.getMonth() + 1).padStart(2, "0")}-${String(todayD.getDate()).padStart(2, "0")}`;
    const yesterdayD = new Date(todayD.getTime() - 86400000);
    const yesterdayKey = `${yesterdayD.getFullYear()}-${String(yesterdayD.getMonth() + 1).padStart(2, "0")}-${String(yesterdayD.getDate()).padStart(2, "0")}`;

    let currentStreak = 0;
    if (allActiveDays.has(todayKey) || allActiveDays.has(yesterdayKey)) {
      currentStreak = 1;
      const startDate = allActiveDays.has(todayKey) ? todayD : yesterdayD;
      for (let i = 1; i <= 365; i++) {
        const prevDate = new Date(startDate.getTime() - 86400000 * i);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
        if (allActiveDays.has(prevKey)) currentStreak++;
        else break;
      }
    }

    // Define all possible achievements
    const achievementDefs = [
      {
        id: "first_lesson",
        title: "שיעור ראשון",
        description: "השלמת את השיעור הראשון שלך",
        icon: "📚",
        color: "emerald",
        unlocked: completedLessons >= 1,
        unlockedAt: completedLessons >= 1 ? Date.now() : null,
      },
      {
        id: "first_enrollment",
        title: "סטודנט חדש",
        description: "נרשמת לקורס הראשון שלך",
        icon: "🎓",
        color: "blue",
        unlocked: enrollments.length >= 1,
        unlockedAt: enrollments.length >= 1 ? enrollments[0]?.enrolledAt ?? null : null,
      },
      {
        id: "five_lessons",
        title: "תלמיד חרוץ",
        description: "השלמת 5 שיעורים",
        icon: "⭐",
        color: "amber",
        unlocked: completedLessons >= 5,
        unlockedAt: completedLessons >= 5 ? Date.now() : null,
      },
      {
        id: "ten_lessons",
        title: "אלוף השיעורים",
        description: "השלמת 10 שיעורים",
        icon: "🏆",
        color: "purple",
        unlocked: completedLessons >= 10,
        unlockedAt: completedLessons >= 10 ? Date.now() : null,
      },
      {
        id: "week_streak",
        title: "שבוע רצוף",
        description: "למדת 7 ימים רצופים",
        icon: "🔥",
        color: "orange",
        unlocked: currentStreak >= 7,
        unlockedAt: currentStreak >= 7 ? Date.now() : null,
      },
      {
        id: "quiz_first",
        title: "מבחן ראשון",
        description: "עברת בוחן בהצלחה",
        icon: "✅",
        color: "green",
        unlocked: passedQuizzes >= 1,
        unlockedAt: passedQuizzes >= 1 ? Date.now() : null,
      },
      {
        id: "quiz_master",
        title: "מאסטר הבחנים",
        description: "עברת 5 בחנים בהצלחה",
        icon: "🎯",
        color: "indigo",
        unlocked: passedQuizzes >= 5,
        unlockedAt: passedQuizzes >= 5 ? Date.now() : null,
      },
      {
        id: "perfect_score",
        title: "מצטיין",
        description: "קיבלת 100 בבוחן",
        icon: "💯",
        color: "rose",
        unlocked: perfectQuizzes >= 1,
        unlockedAt: perfectQuizzes >= 1 ? Date.now() : null,
      },
      {
        id: "course_complete",
        title: "סיים קורס",
        description: "השלמת קורס שלם וקיבלת תעודה",
        icon: "🎖️",
        color: "gold",
        unlocked: certificates.length >= 1,
        unlockedAt: certificates.length >= 1 ? certificates[0]?.issuedAt ?? null : null,
      },
      {
        id: "hundred_xp",
        title: "מאה נקודות",
        description: "צברת 100 XP",
        icon: "💎",
        color: "cyan",
        unlocked: totalXp >= 100,
        unlockedAt: totalXp >= 100 ? Date.now() : null,
      },
    ];

    return {
      achievements: achievementDefs,
      unlockedCount: achievementDefs.filter((a) => a.unlocked).length,
      totalCount: achievementDefs.length,
    };
  },
});

// ==========================================
// getSkillRadar
// Skill levels across 5 key relationship categories
// Derived from quiz performance, lesson completion, and simulator usage
// ==========================================

export const getSkillRadar = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await resolveUser(ctx);
    if (!resolved) return null;
    const { user, identity } = resolved;

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const completedLessons = allProgress.filter((p: any) => p.completed).length;

    const quizAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_course", (q: any) => q.eq("userId", user._id))
      .collect();

    const passedQuizzes = quizAttempts.filter((a: any) => a.passed).length;

    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .collect();

    const simulatorSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .collect();

    const completedSimSessions = simulatorSessions.filter(
      (s: any) => s.status === "completed"
    );
    const avgSimScore =
      completedSimSessions.length > 0
        ? completedSimSessions.reduce(
            (sum: number, s: any) => sum + (s.score ?? 0),
            0
          ) / completedSimSessions.length
        : 0;

    // Derive skill levels (1-5) from activity metrics
    // Communication: chat sessions + simulator
    const commLevel = Math.min(
      5,
      Math.max(
        1,
        Math.floor(
          (chatSessions.length * 0.5 +
            completedSimSessions.length * 1.5 +
            avgSimScore * 0.02) /
            2
        ) + 1
      )
    );

    // Listening: lesson completion (shows patience and focus)
    const listenLevel = Math.min(
      5,
      Math.max(1, Math.floor(completedLessons / 5) + 1)
    );

    // Empathy: chat sessions + quiz performance
    const empathyLevel = Math.min(
      5,
      Math.max(
        1,
        Math.floor((chatSessions.length * 0.4 + passedQuizzes * 0.3) / 1.5) +
          1
      )
    );

    // Conflict resolution: simulator sessions (hard scenarios)
    const conflictLevel = Math.min(
      5,
      Math.max(1, Math.floor(completedSimSessions.length * 0.8) + 1)
    );

    // Trust building: overall completions + certificates
    const certs = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
    const trustLevel = Math.min(
      5,
      Math.max(
        1,
        Math.floor(
          (completedLessons * 0.15 + passedQuizzes * 0.3 + certs.length * 1)
        ) + 1
      )
    );

    return {
      skills: [
        {
          id: "communication",
          label: "תקשורת",
          level: commLevel,
          maxLevel: 5,
          color: "#3b82f6",
        },
        {
          id: "listening",
          label: "הקשבה",
          level: listenLevel,
          maxLevel: 5,
          color: "#10b981",
        },
        {
          id: "empathy",
          label: "אמפתיה",
          level: empathyLevel,
          maxLevel: 5,
          color: "#8b5cf6",
        },
        {
          id: "conflict",
          label: "ניהול קונפליקטים",
          level: conflictLevel,
          maxLevel: 5,
          color: "#f59e0b",
        },
        {
          id: "trust",
          label: "בניית אמון",
          level: trustLevel,
          maxLevel: 5,
          color: "#ef4444",
        },
      ],
    };
  },
});
