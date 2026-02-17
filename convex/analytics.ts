import { query } from "./_generated/server";
import { v } from "convex/values";

// סטטיסטיקות כלליות של סטודנט
export const getStudentOverview = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // קורסים שנרשם אליהם
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // כל ההתקדמות
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // תעודות
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // ניסיונות בחנים
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);

    const completedLessons = allProgress.filter((p) => p.completed).length;
    const totalLessonsStarted = allProgress.length;
    const averageQuizScore =
      userAttempts.length > 0
        ? Math.round(
            userAttempts.reduce((sum, a) => sum + a.score, 0) /
              userAttempts.length
          )
        : 0;

    return {
      enrolledCourses: enrollments.length,
      completedLessons,
      totalLessonsStarted,
      certificatesEarned: certificates.length,
      quizAttempts: userAttempts.length,
      averageQuizScore,
    };
  },
});

// התקדמות בכל קורס
export const getCourseProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const courseProgressData = await Promise.all(
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

        // בדיקה אם יש תעודה
        const certificate = await ctx.db
          .query("certificates")
          .withIndex("by_user_course", (q) =>
            q.eq("userId", args.userId).eq("courseId", enrollment.courseId)
          )
          .first();

        return {
          courseId: enrollment.courseId,
          courseTitle: course.title,
          totalLessons: publishedLessons.length,
          completedLessons: completedCount,
          completionPercent,
          hasCertificate: certificate !== null,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    return courseProgressData.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
  },
});

// היסטוריית ציוני בחנים
export const getQuizScoreHistory = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();

    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);

    // העשרה עם שם הבוחן והקורס
    const enrichedAttempts = await Promise.all(
      userAttempts.map(async (attempt) => {
        const quiz = await ctx.db.get(attempt.quizId);
        const course = await ctx.db.get(attempt.courseId);

        return {
          attemptId: attempt._id,
          quizTitle: quiz?.title ?? "בוחן לא ידוע",
          courseTitle: course?.title ?? "קורס לא ידוע",
          score: attempt.score,
          passed: attempt.passed,
          attemptedAt: attempt.attemptedAt,
        };
      })
    );

    // מיון לפי תאריך (מהחדש לישן)
    return enrichedAttempts.sort((a, b) => b.attemptedAt - a.attemptedAt);
  },
});

// מונה streak - ימים רצופים של למידה
export const getLearningStreak = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (allProgress.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
    }

    // אוספים את כל הימים שבהם היתה פעילות (לפי lastWatchedAt)
    const activeDaysSet = new Set<string>();

    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      activeDaysSet.add(dayKey);
    }

    // גם ניסיונות בחנים נחשבים כפעילות
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();

    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);
    for (const a of userAttempts) {
      const date = new Date(a.attemptedAt);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      activeDaysSet.add(dayKey);
    }

    const activeDays = Array.from(activeDaysSet).sort();

    if (activeDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
    }

    // חישוב streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // בדיקה אם היום או אתמול היו פעילים (ל-current streak)
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    for (let i = 1; i < activeDays.length; i++) {
      const prev = new Date(activeDays[i - 1]);
      const curr = new Date(activeDays[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / 86400000
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // חישוב current streak (מהיום אחורה)
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

    return {
      currentStreak,
      longestStreak,
      totalActiveDays: activeDays.length,
    };
  },
});

// הישגים / תגים
export const getAchievements = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const achievements: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      earned: boolean;
      earnedAt?: number;
    }> = [];

    // קורסים שנרשם
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // שיעורים שהושלמו
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completedLessons = allProgress.filter((p) => p.completed);

    // תעודות
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // בחנים
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();
    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);
    const passedAttempts = userAttempts.filter((a) => a.passed);

    // streak
    const activeDaysSet = new Set<string>();
    for (const p of allProgress) {
      const date = new Date(p.lastWatchedAt);
      activeDaysSet.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }

    // הישג: צעד ראשון - נרשם לקורס
    achievements.push({
      id: "first_enrollment",
      title: "צעד ראשון",
      description: "נרשמת לקורס הראשון שלך",
      icon: "rocket",
      earned: enrollments.length >= 1,
      earnedAt: enrollments.length >= 1 ? enrollments[0].enrolledAt : undefined,
    });

    // הישג: תלמיד חרוץ - השלים 5 שיעורים
    achievements.push({
      id: "five_lessons",
      title: "תלמיד חרוץ",
      description: "השלמת 5 שיעורים",
      icon: "book",
      earned: completedLessons.length >= 5,
      earnedAt:
        completedLessons.length >= 5
          ? completedLessons[4]?.completedAt
          : undefined,
    });

    // הישג: מצטיין - עבר בוחן עם ציון מושלם
    const perfectScore = userAttempts.find((a) => a.score === 100);
    achievements.push({
      id: "perfect_score",
      title: "מצטיין",
      description: "השגת ציון 100 בבוחן",
      icon: "star",
      earned: perfectScore !== undefined,
      earnedAt: perfectScore?.attemptedAt,
    });

    // הישג: בוגר - קיבל תעודת סיום
    achievements.push({
      id: "first_certificate",
      title: "בוגר",
      description: "קיבלת תעודת סיום ראשונה",
      icon: "trophy",
      earned: certificates.length >= 1,
      earnedAt:
        certificates.length >= 1 ? certificates[0].issuedAt : undefined,
    });

    // הישג: מתמיד - 3 ימים רצופים
    achievements.push({
      id: "streak_3",
      title: "מתמיד",
      description: "למדת 3 ימים רצופים",
      icon: "fire",
      earned: activeDaysSet.size >= 3,
    });

    // הישג: מעמיק - עשה 3 בחנים
    achievements.push({
      id: "quiz_taker",
      title: "מעמיק",
      description: "ענית על 3 בחנים",
      icon: "puzzle",
      earned: userAttempts.length >= 3,
      earnedAt:
        userAttempts.length >= 3 ? userAttempts[2]?.attemptedAt : undefined,
    });

    // הישג: כל הכבוד - עבר 3 בחנים בהצלחה
    achievements.push({
      id: "passed_3_quizzes",
      title: "כל הכבוד",
      description: "עברת 3 בחנים בהצלחה",
      icon: "check",
      earned: passedAttempts.length >= 3,
    });

    // הישג: חובב למידה - נרשם ל-3 קורסים
    achievements.push({
      id: "three_enrollments",
      title: "חובב למידה",
      description: "נרשמת ל-3 קורסים",
      icon: "heart",
      earned: enrollments.length >= 3,
    });

    return achievements;
  },
});
