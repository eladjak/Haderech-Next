import { query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// Gamification Module - Phase 5
// Leaderboard, badges, daily streak, XP
// ==========================================

// --- XP Calculation ---
// XP is calculated from activity, not stored separately:
//   - Completed lesson: 10 XP
//   - Quiz attempt: 5 XP
//   - Quiz passed: 15 XP (bonus on top of attempt)
//   - Perfect quiz score: 25 XP (bonus on top of passed)
//   - Certificate earned: 50 XP
//   - Each active day: 3 XP
//   - Streak bonus: currentStreak * 2 XP

// --- Badge Definitions (12 types) ---
const BADGE_DEFINITIONS = [
  {
    id: "first_step",
    title: "צעד ראשון",
    description: "נרשמת לקורס הראשון שלך",
    icon: "rocket",
    category: "enrollment" as const,
    threshold: 1,
  },
  {
    id: "eager_learner",
    title: "תלמיד חרוץ",
    description: "השלמת 5 שיעורים",
    icon: "book",
    category: "lessons" as const,
    threshold: 5,
  },
  {
    id: "lesson_master",
    title: "אלוף השיעורים",
    description: "השלמת 15 שיעורים",
    icon: "bookOpen",
    category: "lessons" as const,
    threshold: 15,
  },
  {
    id: "perfect_score",
    title: "מצטיין",
    description: "השגת ציון 100 בבוחן",
    icon: "star",
    category: "quiz" as const,
    threshold: 100,
  },
  {
    id: "quiz_warrior",
    title: "לוחם הבחנים",
    description: "ענית על 5 בחנים",
    icon: "sword",
    category: "quiz" as const,
    threshold: 5,
  },
  {
    id: "graduate",
    title: "בוגר",
    description: "קיבלת תעודת סיום ראשונה",
    icon: "trophy",
    category: "certificate" as const,
    threshold: 1,
  },
  {
    id: "scholar",
    title: "מלומד",
    description: "קיבלת 3 תעודות סיום",
    icon: "medal",
    category: "certificate" as const,
    threshold: 3,
  },
  {
    id: "streak_3",
    title: "מתמיד",
    description: "למדת 3 ימים רצופים",
    icon: "fire",
    category: "streak" as const,
    threshold: 3,
  },
  {
    id: "streak_7",
    title: "שבוע של למידה",
    description: "למדת 7 ימים רצופים",
    icon: "flame",
    category: "streak" as const,
    threshold: 7,
  },
  {
    id: "streak_30",
    title: "מסור",
    description: "למדת 30 ימים רצופים",
    icon: "crown",
    category: "streak" as const,
    threshold: 30,
  },
  {
    id: "explorer",
    title: "חוקר",
    description: "נרשמת ל-3 קורסים",
    icon: "compass",
    category: "enrollment" as const,
    threshold: 3,
  },
  {
    id: "quiz_ace",
    title: "אלוף הבחנים",
    description: "עברת 5 בחנים בהצלחה",
    icon: "shield",
    category: "quiz" as const,
    threshold: 5,
  },
] as const;

// Calculate XP for a user
export const getUserXP = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let totalXP = 0;

    // Completed lessons: 10 XP each
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completedLessons = allProgress.filter((p) => p.completed);
    totalXP += completedLessons.length * 10;

    // Quiz attempts
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);

    // 5 XP per attempt
    totalXP += userAttempts.length * 5;

    // 15 XP bonus for passed quizzes
    const passedAttempts = userAttempts.filter((a) => a.passed);
    totalXP += passedAttempts.length * 15;

    // 25 XP bonus for perfect scores
    const perfectAttempts = userAttempts.filter((a) => a.score === 100);
    totalXP += perfectAttempts.length * 25;

    // Certificates: 50 XP each
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    totalXP += certificates.length * 50;

    // Active days: 3 XP each
    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    for (const a of userAttempts) {
      const date = new Date(a.attemptedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    totalXP += activeDaysSet.size * 3;

    // Calculate level from XP
    // Level formula: level = floor(sqrt(XP / 25)) + 1
    const level = Math.floor(Math.sqrt(totalXP / 25)) + 1;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 25;
    const xpForNextLevel = Math.pow(level, 2) * 25;
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

    return {
      totalXP,
      level,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercent:
        xpNeededForNextLevel > 0
          ? Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
          : 100,
    };
  },
});

// Leaderboard - top students by XP
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Calculate XP for each user
    const leaderboardEntries = await Promise.all(
      users.map(async (user) => {
        let totalXP = 0;

        // Completed lessons
        const allProgress = await ctx.db
          .query("progress")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        const completedLessons = allProgress.filter((p) => p.completed);
        totalXP += completedLessons.length * 10;

        // Quiz attempts
        const allAttempts = await ctx.db
          .query("quizAttempts")
          .withIndex("by_user_quiz")
          .collect();
        const userAttempts = allAttempts.filter(
          (a) => a.userId === user._id
        );
        totalXP += userAttempts.length * 5;
        totalXP += userAttempts.filter((a) => a.passed).length * 15;
        totalXP += userAttempts.filter((a) => a.score === 100).length * 25;

        // Certificates
        const certificates = await ctx.db
          .query("certificates")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        totalXP += certificates.length * 50;

        // Active days
        const activeDaysSet = new Set<string>();
        for (const p of allProgress) {
          const date = new Date(p.lastWatchedAt);
          activeDaysSet.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          );
        }
        totalXP += activeDaysSet.size * 3;

        const level = Math.floor(Math.sqrt(totalXP / 25)) + 1;

        // Count badges earned
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        let badgesEarned = 0;
        // Simple badge count based on thresholds
        if (enrollments.length >= 1) badgesEarned++;
        if (enrollments.length >= 3) badgesEarned++;
        if (completedLessons.length >= 5) badgesEarned++;
        if (completedLessons.length >= 15) badgesEarned++;
        if (userAttempts.some((a) => a.score === 100)) badgesEarned++;
        if (userAttempts.length >= 5) badgesEarned++;
        if (userAttempts.filter((a) => a.passed).length >= 5) badgesEarned++;
        if (certificates.length >= 1) badgesEarned++;
        if (certificates.length >= 3) badgesEarned++;
        if (activeDaysSet.size >= 3) badgesEarned++;
        if (activeDaysSet.size >= 7) badgesEarned++;
        if (activeDaysSet.size >= 30) badgesEarned++;

        return {
          userId: user._id,
          name: user.name ?? "סטודנט",
          imageUrl: user.imageUrl,
          totalXP,
          level,
          completedLessons: completedLessons.length,
          certificatesEarned: certificates.length,
          badgesEarned,
        };
      })
    );

    // Sort by XP descending, filter out users with 0 XP
    return leaderboardEntries
      .filter((entry) => entry.totalXP > 0)
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 50);
  },
});

// Get all badges for a user
export const getUserBadges = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Gather all user data
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completedLessons = allProgress.filter((p) => p.completed);

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);
    const passedAttempts = userAttempts.filter((a) => a.passed);

    // Calculate streak for streak badges
    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    for (const a of userAttempts) {
      const date = new Date(a.attemptedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    // Calculate longest streak
    const activeDays = Array.from(activeDaysSet).sort();
    let longestStreak = activeDays.length > 0 ? 1 : 0;
    let tempStreak = 1;
    for (let i = 1; i < activeDays.length; i++) {
      const prev = new Date(activeDays[i - 1]);
      const curr = new Date(activeDays[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / 86400000
      );
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Evaluate each badge
    const badges = BADGE_DEFINITIONS.map((badge) => {
      let earned = false;
      let earnedAt: number | undefined;

      switch (badge.id) {
        case "first_step":
          earned = enrollments.length >= 1;
          earnedAt = earned ? enrollments[0]?.enrolledAt : undefined;
          break;
        case "explorer":
          earned = enrollments.length >= 3;
          earnedAt = earned ? enrollments[2]?.enrolledAt : undefined;
          break;
        case "eager_learner":
          earned = completedLessons.length >= 5;
          earnedAt = earned ? completedLessons[4]?.completedAt : undefined;
          break;
        case "lesson_master":
          earned = completedLessons.length >= 15;
          earnedAt = earned ? completedLessons[14]?.completedAt : undefined;
          break;
        case "perfect_score": {
          const perfect = userAttempts.find((a) => a.score === 100);
          earned = perfect !== undefined;
          earnedAt = perfect?.attemptedAt;
          break;
        }
        case "quiz_warrior":
          earned = userAttempts.length >= 5;
          earnedAt = earned ? userAttempts[4]?.attemptedAt : undefined;
          break;
        case "quiz_ace":
          earned = passedAttempts.length >= 5;
          earnedAt = earned ? passedAttempts[4]?.attemptedAt : undefined;
          break;
        case "graduate":
          earned = certificates.length >= 1;
          earnedAt = earned ? certificates[0]?.issuedAt : undefined;
          break;
        case "scholar":
          earned = certificates.length >= 3;
          earnedAt = earned ? certificates[2]?.issuedAt : undefined;
          break;
        case "streak_3":
          earned = longestStreak >= 3;
          break;
        case "streak_7":
          earned = longestStreak >= 7;
          break;
        case "streak_30":
          earned = longestStreak >= 30;
          break;
      }

      return {
        ...badge,
        earned,
        earnedAt,
      };
    });

    const earnedCount = badges.filter((b) => b.earned).length;
    const totalCount = badges.length;

    return {
      badges,
      earnedCount,
      totalCount,
      completionPercent: Math.round((earnedCount / totalCount) * 100),
    };
  },
});

// Get daily streak details (extended from analytics)
export const getDailyStreak = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);

    // Build set of active days
    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    for (const a of userAttempts) {
      const date = new Date(a.attemptedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    const activeDays = Array.from(activeDaysSet).sort();

    if (activeDays.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        isActiveToday: false,
        lastActiveDate: null,
        weekActivity: [false, false, false, false, false, false, false],
      };
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < activeDays.length; i++) {
      const prev = new Date(activeDays[i - 1]);
      const curr = new Date(activeDays[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / 86400000
      );
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Current streak
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const isActiveToday = activeDaysSet.has(todayKey);
    const isActiveYesterday = activeDaysSet.has(yesterdayKey);

    let currentStreak = 0;
    if (isActiveToday || isActiveYesterday) {
      currentStreak = 1;
      const checkDate = isActiveToday ? today : yesterday;
      for (let i = 1; i <= activeDays.length; i++) {
        const prevDate = new Date(checkDate.getTime() - 86400000 * i);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
        if (activeDaysSet.has(prevKey)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Last 7 days activity
    const weekActivity: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - 86400000 * i);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      weekActivity.push(activeDaysSet.has(dateKey));
    }

    return {
      currentStreak,
      longestStreak,
      totalActiveDays: activeDays.length,
      isActiveToday,
      lastActiveDate: activeDays[activeDays.length - 1],
      weekActivity,
    };
  },
});

// Get student profile data (aggregated)
export const getStudentProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Progress
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completedLessons = allProgress.filter((p) => p.completed);

    // Certificates
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Quiz stats
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);
    const passedAttempts = userAttempts.filter((a) => a.passed);
    const averageScore =
      userAttempts.length > 0
        ? Math.round(
            userAttempts.reduce((sum, a) => sum + a.score, 0) /
              userAttempts.length
          )
        : 0;

    // XP calculation
    let totalXP = 0;
    totalXP += completedLessons.length * 10;
    totalXP += userAttempts.length * 5;
    totalXP += passedAttempts.length * 15;
    totalXP += userAttempts.filter((a) => a.score === 100).length * 25;
    totalXP += certificates.length * 50;

    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    for (const a of userAttempts) {
      const date = new Date(a.attemptedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
    totalXP += activeDaysSet.size * 3;

    const level = Math.floor(Math.sqrt(totalXP / 25)) + 1;

    // Course details
    const courseDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
          .collect();
        const publishedLessons = lessons.filter((l) => l.published);

        const progress = await ctx.db
          .query("progress")
          .withIndex("by_user_course", (q) =>
            q.eq("userId", args.userId).eq("courseId", enrollment.courseId)
          )
          .collect();
        const completedCount = progress.filter((p) => p.completed).length;
        const completionPercent =
          publishedLessons.length > 0
            ? Math.round((completedCount / publishedLessons.length) * 100)
            : 0;

        const certificate = await ctx.db
          .query("certificates")
          .withIndex("by_user_course", (q) =>
            q.eq("userId", args.userId).eq("courseId", enrollment.courseId)
          )
          .first();

        return {
          courseId: enrollment.courseId,
          courseTitle: course.title,
          courseImage: course.imageUrl,
          totalLessons: publishedLessons.length,
          completedLessons: completedCount,
          completionPercent,
          hasCertificate: certificate !== null,
          certificateNumber: certificate?.certificateNumber ?? null,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    return {
      name: user.name ?? "סטודנט",
      email: user.email,
      imageUrl: user.imageUrl,
      joinedAt: user.createdAt,
      totalXP,
      level,
      stats: {
        enrolledCourses: enrollments.length,
        completedLessons: completedLessons.length,
        certificatesEarned: certificates.length,
        quizAttempts: userAttempts.length,
        quizzesPassed: passedAttempts.length,
        averageScore,
        activeDays: activeDaysSet.size,
      },
      courses: courseDetails.filter(
        (c): c is NonNullable<typeof c> => c !== null
      ),
      certificates: certificates.map((c) => ({
        courseId: c.courseId,
        courseName: c.courseName,
        certificateNumber: c.certificateNumber,
        issuedAt: c.issuedAt,
        completionPercent: c.completionPercent,
      })),
    };
  },
});

// Get certificate data for sharing
export const getCertificateForSharing = query({
  args: {
    certificateNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_certificate_number", (q) =>
        q.eq("certificateNumber", args.certificateNumber)
      )
      .first();

    if (!certificate) return null;

    const user = await ctx.db.get(certificate.userId);
    const course = await ctx.db.get(certificate.courseId);

    return {
      userName: certificate.userName,
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      completionPercent: certificate.completionPercent,
      userImageUrl: user?.imageUrl ?? null,
      courseImageUrl: course?.imageUrl ?? null,
    };
  },
});
