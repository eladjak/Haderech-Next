/**
 * @file api.ts
 * @description Client-side API utilities for interacting with the Supabase backend.
 * Provides a singleton instance of the Supabase client and helper functions for common operations.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Creates a singleton instance of the Supabase client for browser use
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Uploads a file to Supabase storage
 *
 * @param file - The file to upload
 * @param bucket - The storage bucket to upload to
 * @returns The public URL of the uploaded file
 * @throws Error if the upload fails
 */
export async function uploadFile(file: File, bucket: string) {
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${timestamp}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Fetches the current user's profile
 *
 * @returns The user's profile data
 * @throws Error if fetching fails or user is not authenticated
 */
export async function getProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    throw error;
  }

  return profile;
}

/**
 * Updates the current user's profile
 *
 * @param updates - The profile fields to update
 * @returns The updated profile data
 * @throws Error if update fails or user is not authenticated
 */
export async function updateProfile(
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return profile;
}

/**
 * Signs out the current user
 *
 * @throws Error if sign out fails
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Signs in with GitHub OAuth
 *
 * @throws Error if sign in fails
 */
export async function signInWithGithub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  averageRating: number;
  thumbnail?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  author: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  replies_count: number;
}

interface RawForumPost {
  id: string;
  title: string;
  created_at: string;
  author: {
    name: string;
    avatar_url: string | null;
  }[];
  replies_count: { count: number }[];
}

export async function getRecommendedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("averageRating", { ascending: false })
    .limit(3);

  if (error) {
    throw new Error("Failed to fetch recommended courses");
  }

  return data || [];
}

export async function getLatestForumPosts(): Promise<ForumPost[]> {
  const { data: posts, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id,
      title,
      created_at,
      author:profiles(name, avatar_url),
      replies_count:forum_replies(count)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching latest forum posts:", error);
    return [];
  }

  return (posts as RawForumPost[]).map((post) => ({
    id: post.id,
    title: post.title,
    created_at: post.created_at,
    author: {
      name: post.author[0]?.name || "משתמש לא ידוע",
      avatar_url: post.author[0]?.avatar_url || undefined,
    },
    replies_count: post.replies_count[0]?.count || 0,
  }));
}
