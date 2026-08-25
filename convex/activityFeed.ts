import { query } from "./_generated/server";

// ==========================================
// Activity Feed - Phase 49
// Aggregates user activity from existing tables
// into a unified timeline (no new tables needed)
// ==========================================

type ActivityItem = {
  type: "lesson" | "certificate" | "simulator" | "chat";
  title: string;
  description: string;
  timestamp: number;
  icon: string;
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
      });
    }

    // 2. Course-completion certificates
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
      });
    }

    // 3. Simulator sessions (userId is Clerk string)
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
            : "נעצרה";
      activities.push({
        type: "simulator",
        title: `סימולציה: ${scenario?.title ?? "תרחיש"}`,
        description: `${statusText} · תרגיל עם דמות AI בדיונית`,
        timestamp: sim.completedAt ?? sim.createdAt,
        icon: "simulator",
      });
    }

    // 4. Chat sessions (userId is Clerk string)
    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const modeLabels: Record<string, string> = {
      coach: "כלי AI לרפלקציה",
      practice: "תרגול שיחה בדיוני",
      analysis: "ניתוח טקסט ב-AI",
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
