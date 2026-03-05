import { query } from "./_generated/server";

// ==========================================
// Activity Feed - Phase 49
// Aggregates user activity from existing tables
// into a unified timeline (no new tables needed)
// ==========================================

type ActivityItem = {
  type: "lesson" | "xp" | "badge" | "certificate" | "simulator" | "chat";
  title: string;
  description: string;
  timestamp: number;
  icon: string;
  xp?: number;
};

export const getActivityFeed = query({
  args: {},
  handler: async (ctx): Promise<ActivityItem[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Resolve Convex user from Clerk identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const activities: ActivityItem[] = [];

    // 1. Lesson completions from progress table
    const progressRecords = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const p of progressRecords) {
      if (!p.completed || !p.completedAt) continue;
      const lesson = await ctx.db.get(p.lessonId);
      const course = await ctx.db.get(p.courseId);
      activities.push({
        type: "lesson",
        title: `סיימת שיעור: ${lesson?.title ?? "שיעור"}`,
        description: course?.title
          ? `בקורס "${course.title}"`
          : "השלמת שיעור בהצלחה",
        timestamp: p.completedAt,
        icon: "lesson",
        xp: 10,
      });
    }

    // 2. XP events
    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const xp of xpEvents) {
      // Skip lesson_complete XP events to avoid duplicating lesson completions
      if (xp.type === "lesson_complete") continue;
      activities.push({
        type: "xp",
        title: xp.description,
        description: `+${xp.points} XP`,
        timestamp: xp.createdAt,
        icon: "xp",
        xp: xp.points,
      });
    }

    // 3. Badges earned
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const ub of userBadges) {
      const badge = await ctx.db.get(ub.badgeId);
      activities.push({
        type: "badge",
        title: `הישג חדש: ${badge?.title ?? "תג"}`,
        description: badge?.description ?? "קיבלת הישג חדש!",
        timestamp: ub.earnedAt,
        icon: "badge",
      });
    }

    // 4. Certificates earned
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const cert of certificates) {
      activities.push({
        type: "certificate",
        title: `תעודה: ${cert.courseName}`,
        description: `סיימת את הקורס "${cert.courseName}" בהצלחה!`,
        timestamp: cert.issuedAt,
        icon: "certificate",
        xp: 50,
      });
    }

    // 5. Simulator sessions (userId is Clerk string)
    const simSessions = await ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const sim of simSessions) {
      const scenario = await ctx.db.get(sim.scenarioId);
      const statusText =
        sim.status === "completed"
          ? "הושלמה"
          : sim.status === "active"
            ? "בתהליך"
            : "ננטשה";
      activities.push({
        type: "simulator",
        title: `סימולציה: ${scenario?.title ?? "תרחיש"}`,
        description: `${statusText}${sim.score ? ` - ציון ${sim.score}` : ""}`,
        timestamp: sim.completedAt ?? sim.createdAt,
        icon: "simulator",
      });
    }

    // 6. Chat sessions (userId is Clerk string)
    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const modeLabels: Record<string, string> = {
      coach: "מאמן אישי",
      practice: "סימולטור דייט",
      analysis: "ניתוח שיחה",
    };

    for (const chat of chatSessions) {
      activities.push({
        type: "chat",
        title: chat.title ?? `שיחת ${modeLabels[chat.mode] ?? "צ'אט"}`,
        description: `${chat.messageCount} הודעות · ${modeLabels[chat.mode] ?? chat.mode}`,
        timestamp: chat.updatedAt,
        icon: "chat",
      });
    }

    // Sort by timestamp (newest first) and limit to 50
    activities.sort((a, b) => b.timestamp - a.timestamp);
    return activities.slice(0, 50);
  },
});
