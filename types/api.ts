import type { Database } from "./database";
import type { ForumComment } from "./forum";

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  success?: boolean;
};

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string;
  avatar_url?: string;
  bio?: string;
  role: "user" | "admin" | "instructor";
  points: number;
  level: string;
  badges: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
  last_seen?: string;
}

export interface Author extends User {
  full_name: string;
  completed_courses?: string[];
  forum_posts?: number;
  login_streak?: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  course_id: string;
  is_free: boolean;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  progress?: number;
  isCompleted?: boolean;
}

export interface CourseRating {
  id: string;
  rating: number;
  review: string;
  user_id: string;
  course_id: string;
  created_at: string;
  updated_at: string;
  user: Author;
}

export interface CourseComment extends ForumComment {
  course_id: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: number;
  level: string;
  category: string;
  tags: string[];
  instructor_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  featured: boolean;
  lessons_count: number;
  students_count: number;
  ratings_count: number;
  average_rating: number;
  instructor: Author;
  lessons?: CourseLesson[];
  ratings?: CourseRating[];
  comments?: CourseComment[];
  sections?: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: CourseLesson[];
  }[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  message: string;
  read: boolean;
  user_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  user: Author;
  content?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  created_at: string;
  updated_at: string;
  achievement: Achievement;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  created_at: string;
  updated_at: string;
  badge: Badge;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio: string;
  avatar_url: string;
  social_links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    theme: "light" | "dark" | "system";
    language: string;
  };
  created_at: string;
  updated_at: string;
}

export type { Database };
