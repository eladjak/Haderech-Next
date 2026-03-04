import { query, mutation, internalMutation } from "./_generated/server";
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

// ==========================================
// Phase 25 - Event-based XP System
// Persistent XP events, badge tables, mutations
// ==========================================

// --- Get user stats (total XP from events, level, streak, badge count) ---
export const getUserStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Sum XP from xpEvents table
    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalXP = xpEvents.reduce((sum, e) => sum + e.points, 0);

    // Level: level = floor(xp / 100) + 1
    const level = Math.floor(totalXP / 100) + 1;
    const xpInCurrentLevel = totalXP % 100;
    const xpNeededForNextLevel = 100;

    // Count current streak from progress table (consecutive days with activity)
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    // Also count xpEvent days as active
    for (const e of xpEvents) {
      const date = new Date(e.createdAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    const activeDays = Array.from(activeDaysSet).sort();
    let currentStreak = 0;
    if (activeDays.length > 0) {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const yesterday = new Date(today.getTime() - 86400000);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

      const isActiveToday = activeDaysSet.has(todayKey);
      const isActiveYesterday = activeDaysSet.has(yesterdayKey);

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
    }

    // Badge count from userBadges table
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalXP,
      level,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercent:
        xpNeededForNextLevel > 0
          ? Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
          : 100,
      currentStreak,
      badgeCount: userBadges.length,
    };
  },
});

// --- Recent XP events for user (last 20) ---
export const getUserXpHistory = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    return events;
  },
});

// --- All badges earned by user with badge details ---
export const getUserEarnedBadges = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all badge definitions
    const allBadges = await ctx.db.query("badges").collect();

    // Get user's earned badges
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    // Map badges with earned status
    const badges = allBadges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge._id);
      return {
        _id: badge._id,
        slug: badge.slug,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        condition: badge.condition,
        earned: earnedBadgeIds.has(badge._id),
        earnedAt: userBadge?.earnedAt,
      };
    });

    const earnedCount = badges.filter((b) => b.earned).length;

    return {
      badges,
      earnedCount,
      totalCount: allBadges.length,
    };
  },
});

// --- Leaderboard (top 10 users by XP from events, public) ---
export const getXpLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const entries = await Promise.all(
      users.map(async (user) => {
        const xpEvents = await ctx.db
          .query("xpEvents")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const totalXP = xpEvents.reduce((sum, e) => sum + e.points, 0);
        const level = Math.floor(totalXP / 100) + 1;

        const userBadges = await ctx.db
          .query("userBadges")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        return {
          userId: user._id,
          name: user.name ?? "סטודנט",
          imageUrl: user.imageUrl,
          totalXP,
          level,
          badgeCount: userBadges.length,
        };
      })
    );

    return entries
      .filter((e) => e.totalXP > 0)
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 10);
  },
});

// --- Award XP (internal mutation) ---
export const awardXp = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    points: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("xpEvents", {
      userId: args.userId,
      type: args.type,
      points: args.points,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

// --- Check and award badges (internal mutation) ---
export const checkAndAwardBadges = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all badge definitions
    const allBadges = await ctx.db.query("badges").collect();

    // Get user's already earned badges
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const earnedSlugs = new Set<string>();
    for (const ub of userBadges) {
      const badge = await ctx.db.get(ub.badgeId);
      if (badge) earnedSlugs.add(badge.slug);
    }

    // Gather user data for condition checks
    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const totalXP = xpEvents.reduce((sum, e) => sum + e.points, 0);

    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completedLessons = allProgress.filter((p) => p.completed).length;

    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);
    const passedQuizzes = userAttempts.filter((a) => a.passed).length;

    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user")
      .collect();
    const userChatSessions = chatSessions.filter(
      (s) => s.userId === args.userId.toString()
    );

    const simulatorSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user")
      .collect();
    const completedSimulations = simulatorSessions.filter(
      (s) => s.userId === args.userId.toString() && s.status === "completed"
    );

    const communityPosts = await ctx.db
      .query("communityTopics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Calculate current streak
    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }
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

    // Check each unearned badge
    const now = Date.now();
    for (const badge of allBadges) {
      if (earnedSlugs.has(badge.slug)) continue;

      let qualified = false;

      switch (badge.slug) {
        case "first_lesson":
          qualified = completedLessons >= 1;
          break;
        case "streak_3":
          qualified = longestStreak >= 3;
          break;
        case "streak_7":
          qualified = longestStreak >= 7;
          break;
        case "streak_30":
          qualified = longestStreak >= 30;
          break;
        case "first_chat":
          qualified = userChatSessions.length >= 1;
          break;
        case "first_simulation":
          qualified = completedSimulations.length >= 1;
          break;
        case "quiz_master":
          qualified = passedQuizzes >= 5;
          break;
        case "course_complete": {
          const certificates = await ctx.db
            .query("certificates")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
          qualified = certificates.length >= 1;
          break;
        }
        case "community_active":
          qualified = communityPosts.length >= 5;
          break;
        case "xp_100":
          qualified = totalXP >= 100;
          break;
        case "xp_500":
          qualified = totalXP >= 500;
          break;
        case "xp_1000":
          qualified = totalXP >= 1000;
          break;
      }

      if (qualified) {
        await ctx.db.insert("userBadges", {
          userId: args.userId,
          badgeId: badge._id,
          earnedAt: now,
        });
      }
    }
  },
});

// --- Seed initial 12 badges ---
export const seedBadges = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if badges already seeded
    const existing = await ctx.db.query("badges").first();
    if (existing) {
      return { message: "Badges already seeded", count: 0 };
    }

    const now = Date.now();
    const badgeDefinitions = [
      {
        slug: "first_lesson",
        title: "השיעור הראשון",
        description: "השלמת את השיעור הראשון",
        icon: "\uD83C\uDF93",
        category: "learning" as const,
        condition: "lessons_completed >= 1",
      },
      {
        slug: "streak_3",
        title: "3 ימים ברצף",
        description: "למדת 3 ימים ברציפות",
        icon: "\uD83D\uDD25",
        category: "streak" as const,
        condition: "streak_days >= 3",
      },
      {
        slug: "streak_7",
        title: "שבוע ברצף",
        description: "למדת שבוע שלם ברציפות",
        icon: "\uD83D\uDD25",
        category: "streak" as const,
        condition: "streak_days >= 7",
      },
      {
        slug: "streak_30",
        title: "חודש ברצף",
        description: "למדת חודש שלם ברציפות",
        icon: "\uD83D\uDD25",
        category: "streak" as const,
        condition: "streak_days >= 30",
      },
      {
        slug: "first_chat",
        title: "שיחה ראשונה",
        description: "ניהלת שיחה ראשונה עם המאמן",
        icon: "\uD83D\uDCAC",
        category: "social" as const,
        condition: "chat_sessions >= 1",
      },
      {
        slug: "first_simulation",
        title: "סימולציה ראשונה",
        description: "השלמת סימולציה ראשונה",
        icon: "\uD83C\uDFAD",
        category: "learning" as const,
        condition: "simulations_completed >= 1",
      },
      {
        slug: "quiz_master",
        title: "מאסטר בחנים",
        description: "עברת 5 בחנים בהצלחה",
        icon: "\uD83D\uDCDD",
        category: "learning" as const,
        condition: "quizzes_passed >= 5",
      },
      {
        slug: "course_complete",
        title: "סיום קורס",
        description: "השלמת קורס שלם",
        icon: "\uD83C\uDFC6",
        category: "achievement" as const,
        condition: "courses_completed >= 1",
      },
      {
        slug: "community_active",
        title: "פעיל בקהילה",
        description: "פרסמת 5 פוסטים בקהילה",
        icon: "\uD83D\uDC65",
        category: "social" as const,
        condition: "community_posts >= 5",
      },
      {
        slug: "xp_100",
        title: "100 נקודות",
        description: "צברת 100 נקודות ניסיון",
        icon: "\u2B50",
        category: "achievement" as const,
        requiredXp: 100,
        condition: "total_xp >= 100",
      },
      {
        slug: "xp_500",
        title: "500 נקודות",
        description: "צברת 500 נקודות ניסיון",
        icon: "\uD83C\uDF1F",
        category: "achievement" as const,
        requiredXp: 500,
        condition: "total_xp >= 500",
      },
      {
        slug: "xp_1000",
        title: "1000 נקודות",
        description: "צברת 1000 נקודות ניסיון",
        icon: "\uD83D\uDC8E",
        category: "achievement" as const,
        requiredXp: 1000,
        condition: "total_xp >= 1000",
      },
    ];

    for (const badge of badgeDefinitions) {
      await ctx.db.insert("badges", {
        ...badge,
        createdAt: now,
      });
    }

    return { message: "Badges seeded successfully", count: badgeDefinitions.length };
  },
});
