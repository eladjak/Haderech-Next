import type {
  Author
} from "./forum";
  ForumComment,
  ForumPost,
  ForumStats,
  ForumTag,
} from "./forum";
import type { SimulatorState } from "./simulator";
import type { Database } from "./supabase";

/**
 * API Types
 *
 * טיפוסים עבור ה-API של המערכת
 */

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  avatar_url?: string;
  bio?: string;
  username: string;
  role: "user" | "admin" | "instructor";
  full_name: string;
  points: number;
  level: number;
  badges: any[];
  achievements: any[];
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  image_url?: string;
  price: number;
  duration: number;
  level: string;
  category: string;
  tags: string[];
  instructor_id: string;
  instructor: Author;
  created_at: string;
  updated_at: string;
  published: boolean;
  featured: boolean;
  status?: "draft" | "published" | "archived";
  lessons_count: number;
  students_count: number;
  total_students?: number;
  ratings_count: number;
  average_rating: number;
  lessons?: CourseLesson[];
  ratings?: CourseRating[];
  comments?: CourseComment[];
  sections?: Section[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  course_id: string;
  lessons: CourseLesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  course_id: string;
  section_id: string;
  is_free: boolean;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  progress?: CourseProgress[];
  isCompleted?: boolean;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRating {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  comment?: string;
}

export interface CourseComment {
  id: string;
  content: string;
  course_id: string;
  user_id: string;
  parent_id?: string;
  likes: number;
  created_at: string;
  updated_at: string;
  user: User;
  replies?: CourseComment[];
}

export interface CourseWithRelations extends Course {
  lessons: CourseLesson[];
  ratings: CourseRating[];
  comments: CourseComment[];
  instructor: Author;
}

export interface ExtendedCourseLesson extends Lesson {
  progress?: CourseProgress[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  earned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  achieved_at: string;
  achievement: Achievement;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  achieved_at: string;
  badge: Badge;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  message: string;
  content: string;
  read: boolean;
  user_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  user: Author;
}

export type APIResponse<T = any> = {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  success?: boolean;
  state?: SimulatorState;
};

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  course_id: string;
  section_id: string;
  is_free: boolean;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  progress?: number;
  isCompleted?: boolean;
}

// Re-export types from forum
export type { ForumPost, ForumComment, ForumTag, ForumStats, Author, Database };
