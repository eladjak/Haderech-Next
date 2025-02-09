import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * יצירת לקוח Supabase עבור הפרויקט
 * משתמש במשתני סביבה להגדרת ה-URL והמפתח
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

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

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Helper types for common tables
export type Profile = Tables<"profiles">;
export type Course = Tables<"courses">;
export type Lesson = Tables<"lessons">;
export type LessonContent = Tables<"lesson_content">;
export type LessonProgress = Tables<"lesson_progress">;
export type CourseRating = Tables<"course_ratings">;
export type CourseEnrollment = Tables<"course_enrollments">;
export type ForumPost = Tables<"forum_posts">;
export type ForumComment = Tables<"forum_comments">;
export type Notification = Tables<"notifications">;
export type Achievement = Tables<"achievements">;
export type Upload = Tables<"uploads">;

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

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<{
  error: Error | null;
  data: any | null;
}> => {
  try {
    const supabase = createSupabaseClient();
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

export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<{
  error: Error | null;
  data: any | null;
}> => {
  try {
    const supabase = createSupabaseClient();
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
