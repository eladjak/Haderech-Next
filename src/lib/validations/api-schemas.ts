import * as z from "zod";

/**
 * @file api-schemas.ts
 * @description Comprehensive Zod validation schemas for all API endpoints
 * Provides input validation and sanitization for security
 */

// ============================================
// PROFILE API SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(1, "שם חייב להכיל לפחות תו אחד").max(100, "שם חייב להכיל פחות מ-100 תווים").optional(),
  username: z
    .string()
    .min(3, "שם משתמש חייב להכיל לפחות 3 תווים")
    .max(30, "שם משתמש חייב להכיל פחות מ-30 תווים")
    .regex(/^[a-zA-Z0-9_]+$/, "שם משתמש יכול להכיל רק אותיות אנגליות, מספרים וקו תחתון")
    .optional(),
  bio: z.string().max(500, "ביוגרפיה חייבת להכיל פחות מ-500 תווים").optional(),
  avatar_url: z.string().url("כתובת URL לא תקינה").optional(),
  // SECURITY: Prevent users from modifying sensitive fields
  // These fields are explicitly NOT included: role, points, badges, is_admin
}).strict(); // Reject any additional fields

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================
// FORUM API SCHEMAS
// ============================================

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "כותרת חייבת להכיל לפחות 5 תווים")
    .max(200, "כותרת חייבת להכיל פחות מ-200 תווים")
    .trim(),
  content: z
    .string()
    .min(10, "תוכן חייב להכיל לפחות 10 תווים")
    .max(10000, "תוכן חייב להכיל פחות מ-10000 תווים")
    .trim(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(5, "ניתן להוסיף עד 5 תגיות").optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().min(5).max(200).trim().optional(),
  content: z.string().min(10).max(10000).trim().optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "תגובה חייבת להכיל לפחות תו אחד")
    .max(2000, "תגובה חייבת להכיל פחות מ-2000 תווים")
    .trim(),
  post_id: z.string().uuid("מזהה פוסט לא תקין"),
  parent_id: z.string().uuid("מזהה הורה לא תקין").optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// ============================================
// COURSE API SCHEMAS
// ============================================

export const enrollmentSchema = z.object({
  course_id: z.string().uuid("מזהה קורס לא תקין"),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const unenrollmentSchema = z.object({
  course_id: z.string().uuid("מזהה קורס לא תקין"),
});

export type UnenrollmentInput = z.infer<typeof unenrollmentSchema>;

export const updateLessonProgressSchema = z.object({
  completed: z.boolean().optional(),
  last_position: z.number().min(0, "מיקום חייב להיות חיובי").optional(),
  progress: z.number().min(0, "התקדמות חייבת להיות בין 0 ל-100").max(100).optional(),
});

export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;

export const createCourseCommentSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  rating: z.number().min(1).max(5).optional(),
});

export type CreateCourseCommentInput = z.infer<typeof createCourseCommentSchema>;

export const createCourseRatingSchema = z.object({
  rating: z.number().min(1, "דירוג חייב להיות בין 1 ל-5").max(5, "דירוג חייב להיות בין 1 ל-5"),
  review: z.string().max(1000).optional(),
});

export type CreateCourseRatingInput = z.infer<typeof createCourseRatingSchema>;

// ============================================
// BOT/CHAT API SCHEMAS
// ============================================

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "הודעה חייבת להכיל לפחות תו אחד")
    .max(1000, "הודעה חייבת להכיל פחות מ-1000 תווים")
    .trim(),
  context: z
    .object({
      scenario_id: z.string().uuid().optional(),
      session_id: z.string().uuid().optional(),
    })
    .optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ============================================
// SIMULATOR API SCHEMAS
// ============================================

export const simulatorSubmissionSchema = z.object({
  scenario_id: z.string().uuid("מזהה תרחיש לא תקין"),
  code: z.string().min(1, "קוד חייב להכיל לפחות תו אחד").max(50000, "קוד ארוך מדי"),
  test_results: z.array(
    z.object({
      name: z.string(),
      passed: z.boolean(),
      error: z.string().optional(),
    })
  ),
});

export type SimulatorSubmissionInput = z.infer<typeof simulatorSubmissionSchema>;

export const simulatorChatSchema = z.object({
  scenario_id: z.string().uuid("מזהה תרחיש לא תקין"),
  message: z.string().min(1).max(500).trim(),
  session_id: z.string().uuid().optional(),
});

export type SimulatorChatInput = z.infer<typeof simulatorChatSchema>;

// ============================================
// COMMUNITY API SCHEMAS
// ============================================

export const createCommunityPostSchema = z.object({
  title: z.string().min(5, "כותרת חייבת להכיל לפחות 5 תווים").max(200).trim(),
  content: z.string().min(10, "תוכן חייב להכיל לפחות 10 תווים").max(10000).trim(),
  group_id: z.string().uuid("מזהה קבוצה לא תקין").optional(),
});

export type CreateCommunityPostInput = z.infer<typeof createCommunityPostSchema>;

export const createCommunityCommentSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  post_id: z.string().uuid("מזהה פוסט לא תקין"),
});

export type CreateCommunityCommentInput = z.infer<typeof createCommunityCommentSchema>;

// ============================================
// BOOKMARKS API SCHEMAS
// ============================================

export const createBookmarkSchema = z.object({
  post_id: z.string().uuid("מזהה פוסט לא תקין").optional(),
  course_id: z.string().uuid("מזהה קורס לא תקין").optional(),
  lesson_id: z.string().uuid("מזהה שיעור לא תקין").optional(),
}).refine(data => data.post_id || data.course_id || data.lesson_id, {
  message: "חובה לציין לפחות מזהה אחד (פוסט/קורס/שיעור)",
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;

// ============================================
// NOTIFICATIONS API SCHEMAS
// ============================================

export const markNotificationReadSchema = z.object({
  notification_id: z.string().uuid("מזהה התראה לא תקין"),
});

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;

// ============================================
// SEARCH API SCHEMAS
// ============================================

export const searchQuerySchema = z.object({
  q: z.string().min(1, "שאילתת חיפוש חייבת להכיל לפחות תו אחד").max(100),
  type: z.enum(["posts", "courses", "users", "all"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================
// UPLOAD API SCHEMAS
// ============================================

export const uploadFileSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["avatar", "course_image", "post_attachment"]),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

// ============================================
// LIKE/VOTE API SCHEMAS
// ============================================

export const createLikeSchema = z.object({
  post_id: z.string().uuid("מזהה פוסט לא תקין").optional(),
  comment_id: z.string().uuid("מזהה תגובה לא תקין").optional(),
}).refine(data => data.post_id || data.comment_id, {
  message: "חובה לציין מזהה פוסט או תגובה",
});

export type CreateLikeInput = z.infer<typeof createLikeSchema>;

// ============================================
// UUID VALIDATION HELPER
// ============================================

export const uuidSchema = z.string().uuid("מזהה לא תקין");

// ============================================
// PAGINATION SCHEMA
// ============================================

export const paginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
