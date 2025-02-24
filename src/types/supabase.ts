/**
 * Supabase Types
 *
 * This module provides type definitions for Supabase database tables and extended types.
 */

import type { Course, CourseLesson, CourseRating, User } from "./api";
import type { Database } from "./database";
import type { Author, ForumComment, ForumPost } from "./forum";

// Base type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Extended types
export type ExtendedForumPost = {
  id: string;
  title: string;
  content: string;
  author: Author;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: ExtendedForumComment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  replies_count?: number;
  created_at: string;
  updated_at: string;
  solved: boolean;
  last_activity: string;
};

export type ExtendedForumComment = {
  id: string;
  post_id: string;
  author: Author;
  content: string;
  created_at: string;
  updated_at: string;
  replies?: ExtendedForumComment[];
  isLiked?: boolean;
};

export type ExtendedCourse = Course & {
  author: Author;
  lessons_count: number;
  students_count: number;
  ratings?: {
    average: number;
    count: number;
  };
  progress?: {
    completed: boolean;
    percent: number;
    last_viewed?: string;
  };
};

export type ExtendedLesson = CourseLesson & {
  course: {
    id: string;
    title: string;
    author_id: string;
  };
  progress?: {
    completed: boolean;
    last_viewed: string;
  };
};

// Re-export types
export type {
  User,
  Course,
  CourseRating,
  CourseLesson,
  Author,
  ForumComment,
  ForumPost,
};
export type { Database };

export interface SocialGroup {
  id: string;
  name: string;
  description: string;
  type: "public" | "private";
  owner_id: string;
  members_count: number;
  created_at: string;
  updated_at: string;
  members?: {
    user_id: string;
    role: "member" | "admin" | "moderator";
    joined_at: string;
  }[];
}
