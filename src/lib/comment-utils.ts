/**
 * Pure utility functions for comments/discussion system.
 * Extracted for unit testing.
 */

export interface CommentRecord {
  _id: string;
  userId: string;
  content: string;
  createdAt: number;
  parentId?: string;
}

/** Format relative time for comments (Hebrew) */
export function formatCommentTime(timestamp: number, now?: number): string {
  const current = now ?? Date.now();
  const diff = current - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "עכשיו";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `לפני ${weeks} שבועות`;
  }
  return new Date(timestamp).toLocaleDateString("he-IL");
}

/** Validate comment content */
export function validateComment(content: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = content.trim();
  if (trimmed.length === 0) return { valid: false, error: "תגובה ריקה" };
  if (trimmed.length > 2000)
    return { valid: false, error: "תגובה ארוכה מדי (מקסימום 2000 תווים)" };
  return { valid: true };
}

/** Count total comments including replies */
export function countTotalComments(comments: CommentRecord[]): number {
  return comments.length;
}

/** Count top-level comments (not replies) */
export function countTopLevelComments(comments: CommentRecord[]): number {
  return comments.filter((c) => !c.parentId).length;
}

/** Get user's comment count */
export function countUserComments(
  comments: CommentRecord[],
  userId: string
): number {
  return comments.filter((c) => c.userId === userId).length;
}

/** Check if comment was edited */
export function isEdited(createdAt: number, updatedAt: number): boolean {
  return updatedAt - createdAt > 1000; // 1 second buffer
}
