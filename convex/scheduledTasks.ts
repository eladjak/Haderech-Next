import { internalMutation } from "./_generated/server";

// Clean up simulator sessions that have been active for over 24 hours
export const cleanupAbandonedSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    const activeSessions = await ctx.db
      .query("simulatorSessions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    let cleaned = 0;
    for (const session of activeSessions) {
      if (session.createdAt < cutoff) {
        await ctx.db.patch(session._id, {
          status: "abandoned",
          completedAt: Date.now(),
        });
        cleaned++;
      }
    }

    console.log(`Cleaned up ${cleaned} abandoned simulator sessions`);
  },
});

// Rotate daily content - this just logs; actual rotation happens in query by dayOfYear
export const rotateDailyContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Daily content is already rotated by dayOfYear in the query
    // This cron just ensures we log the rotation
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Count total daily content items to verify data exists
    const contentItems = await ctx.db.query("dailyContent").collect();
    console.log(
      `Daily content rotated to day ${dayOfYear} (${contentItems.length} items total)`
    );
  },
});

// Clean up read notifications older than 30 days
export const cleanupOldNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const notifications = await ctx.db.query("notifications").collect();

    let cleaned = 0;
    for (const notif of notifications) {
      if (notif.read && notif.createdAt < cutoff) {
        await ctx.db.delete(notif._id);
        cleaned++;
      }
    }

    console.log(`Cleaned up ${cleaned} old read notifications`);
  },
});

// Clean up expired/cancelled mentoring sessions older than 90 days
export const cleanupOldMentoringSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db.query("mentoringSessions").collect();

    let cleaned = 0;
    for (const session of sessions) {
      if (session.status === "cancelled" && session.createdAt < cutoff) {
        await ctx.db.delete(session._id);
        cleaned++;
      }
    }

    console.log(`Cleaned up ${cleaned} old cancelled mentoring sessions`);
  },
});
