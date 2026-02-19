// Pure utility functions for notifications

export type NotificationType =
  | "achievement"
  | "comment_reply"
  | "course_update"
  | "certificate"
  | "quiz_result";

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  achievement: "🏆",
  comment_reply: "💬",
  course_update: "📚",
  certificate: "🎓",
  quiz_result: "📝",
};

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  achievement: "הישג",
  comment_reply: "תגובה",
  course_update: "עדכון קורס",
  certificate: "תעודה",
  quiz_result: "תוצאת בוחן",
};

export function getNotificationIcon(type: string): string {
  return NOTIFICATION_ICONS[type as NotificationType] ?? "🔔";
}

export function getNotificationLabel(type: string): string {
  return NOTIFICATION_LABELS[type as NotificationType] ?? "התראה";
}

export function formatNotificationTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "עכשיו";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}ד`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}ש`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}י`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}ש`;

  const months = Math.floor(days / 30);
  return `${months}ח`;
}

export function groupNotificationsByDate(
  notifications: Array<{ createdAt: number; read: boolean }>
): { today: typeof notifications; earlier: typeof notifications } {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const today = notifications.filter((n) => n.createdAt >= todayStart);
  const earlier = notifications.filter((n) => n.createdAt < todayStart);

  return { today, earlier };
}

export function countUnreadInGroup(
  notifications: Array<{ read: boolean }>
): number {
  return notifications.filter((n) => !n.read).length;
}

export function isValidNotificationType(type: string): type is NotificationType {
  return type in NOTIFICATION_ICONS;
}
