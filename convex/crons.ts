import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up abandoned simulator sessions (older than 24 hours, still "active")
crons.interval(
  "cleanup abandoned simulator sessions",
  { hours: 6 },
  internal.scheduledTasks.cleanupAbandonedSessions
);

// Update daily content rotation
crons.daily(
  "rotate daily content",
  { hourUTC: 5, minuteUTC: 0 }, // 8:00 AM Israel time (UTC+3)
  internal.scheduledTasks.rotateDailyContent
);

// Clean up old notifications (older than 30 days, already read)
crons.weekly(
  "cleanup old notifications",
  { dayOfWeek: "sunday", hourUTC: 3, minuteUTC: 0 },
  internal.scheduledTasks.cleanupOldNotifications
);

export default crons;
