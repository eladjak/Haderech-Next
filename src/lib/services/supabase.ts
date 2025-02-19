/**
 * Supabase Service
 *
 * This module provides a centralized interface for interacting with our Supabase backend.
 * It includes type definitions, the main client instance, and helper functions for common operations.
 *
 * @module services/supabase
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env.mjs";
import {
  DatabaseCourse,
  DatabaseCourseComment,
  DatabaseCourseProgress,
  DatabaseCourseRating,
  DatabaseForumCategory,
  DatabaseForumPost,
  DatabaseForumTag,
  DatabaseLesson,
  DatabaseNotification,
  DatabaseSimulatorScenario,
  DatabaseUser,
} from "@/types/database";
import { Database } from "@/types/supabase";

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Initialize Supabase client with environment variables
export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Type exports for database schema
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums = Database["public"]["Enums"];

// Helper types for common tables
export type UserRow = Tables<"users">;
export type CourseRow = Tables<"courses">;
export type LessonRow = Tables<"lessons">;
export type ForumPostRow = Tables<"forum_posts">;

// Helper types for database entities
export type Profile = DatabaseUser;
export type Course = DatabaseCourse;
export type Lesson = DatabaseLesson;
export type CourseProgress = DatabaseCourseProgress;
export type CourseRating = DatabaseCourseRating;
export type CourseComment = DatabaseCourseComment;
export type ForumPost = DatabaseForumPost;
export type ForumCategory = DatabaseForumCategory;
export type ForumTag = DatabaseForumTag;
export type Notification = DatabaseNotification;
export type SimulatorScenario = DatabaseSimulatorScenario;

/**
 * פונקציית עזר לבדיקת חיבור למסד הנתונים
 */
export async function checkDatabaseConnection() {
  try {
    const { error } = await supabase.from("users").select("count").single();
    if (error) throw error;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

/**
 * פונקציית עזר לבדיקת סטטוס אימות
 */
export async function checkAuthStatus() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Auth status check failed:", error);
    return null;
  }
}

// Create a single supabase client for interacting with your database
export const createSupabaseClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};

/**
 * Fetches a user's profile by their ID
 * @param userId - The unique identifier of the user
 * @returns The user's profile data
 * @throws Will throw an error if the database query fails
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates a user's profile with the provided changes
 * @param userId - The unique identifier of the user
 * @param updates - Partial profile data to update
 * @returns The updated profile data
 * @throws Will throw an error if the database query fails
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserRow>
) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetches a course by its ID, including related data
 * @param courseId - The unique identifier of the course
 * @returns The course data with lessons and author information
 * @throws Will throw an error if the database query fails
 */
export async function getCourse(courseId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      lessons (*),
      author:users (
        id,
        name, 
        avatar_url,
        bio,
        expertise
      )
    `
    )
    .eq("id", courseId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Interface for course filtering options
 */
export interface CourseFilters {
  published?: boolean;
  authorId?: string;
  level?: string;
  category?: string;
  searchQuery?: string;
  sortBy?: "newest" | "popular" | "rating";
}

/**
 * Fetches courses based on provided filters
 * @param filters - Optional filters to apply to the query
 * @returns An array of courses with related data
 * @throws Will throw an error if the database query fails
 */
export async function getCourses(filters?: CourseFilters) {
  let query = supabase.from("courses").select(`
    *,
    author:users (
      id,
      name, 
      avatar_url,
      expertise
    ),
    lessons (count),
    average_rating,
    total_students
  `);

  // Apply filters
  if (filters?.published !== undefined) {
    query = query.eq("published", filters.published);
  }

  if (filters?.authorId) {
    query = query.eq("author_id", filters.authorId);
  }

  if (filters?.level) {
    query = query.eq("level", filters.level);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.searchQuery) {
    query = query.textSearch("title", filters.searchQuery);
  }

  // Apply sorting
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "popular":
        query = query.order("total_students", { ascending: false });
        break;
      case "rating":
        query = query.order("average_rating", { ascending: false });
        break;
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Enrolls a user in a course
 * @param userId - The unique identifier of the user
 * @param courseId - The unique identifier of the course
 * @returns The enrollment data
 * @throws Will throw an error if the database query fails
 */
export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates a user's progress in a course lesson
 * @param userId - The unique identifier of the user
 * @param lessonId - The unique identifier of the lesson
 * @param progress - Progress data to update
 * @returns The updated progress data
 * @throws Will throw an error if the database query fails
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  progress: {
    completed: boolean;
    last_position?: number;
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      ...progress,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches forum posts with author information
 * @returns An array of forum posts with author details
 * @throws Will throw an error if the database query fails
 */
export const getForumPosts = async () => {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      *,
      author:users (
        id,
        name,
        avatar_url
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetches a specific forum post with author and comments
 * @param postId - The unique identifier of the post
 * @returns The forum post with author and comments data
 * @throws Will throw an error if the database query fails
 */
export const getForumPost = async (postId: string) => {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      *,
      author:users (
        id,
        name,
        avatar_url
      ),
      comments (
        *,
        author:users (
          id,
          name,
          avatar_url
        )
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Signs in a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns Object containing error or data
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{
  error: Error | null;
  data: any | null;
}> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      return { error, data: null };
    }

    return { error: null, data };
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    return { error: error as Error, data: null };
  }
};

/**
 * Signs up a new user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns Object containing error or data
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{
  error: Error | null;
  data: any | null;
}> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error.message);
      return { error, data: null };
    }

    return { error: null, data };
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    return { error: error as Error, data: null };
  }
};
