/**
 * @file api.ts
 * @description Client-side API utilities for interacting with the Supabase backend.
 * Provides a singleton instance of the Supabase client and helper functions for common operations.
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import { APIResponse } from "@/types/api";
import type { Database } from "@/types/database";
import type {
  Course,
  ExtendedForumComment,
  ExtendedForumPost,
  ForumPost,
} from "@/types/supabase";

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type DatabaseCourse = Tables<"courses">;
type DatabaseLesson = Tables<"lessons">;
type DatabaseUser = Tables<"users">;
type DatabaseForumPost = Tables<"forum_posts">;

/**
 * Creates a singleton instance of the Supabase client for browser use
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    .from("users")
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
  updates: Partial<Database["public"]["Tables"]["users"]["Update"]>
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error } = await supabase
    .from("users")
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

export async function getLatestForumPosts(): Promise<ExtendedForumPost[]> {
  const { data: posts, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id,
      title,
      content,
      created_at,
      author:users(id, name, avatar_url, image),
      replies_count:forum_replies(count)
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching latest forum posts:", error);
    return [];
  }

  return (posts as any[]).map((post) => ({
    ...post,
    author: post.author[0] || {
      name: "משתמש לא ידוע",
      avatar_url: null,
      image: null,
    },
    replies_count: post.replies_count[0]?.count || 0,
  }));
}

// Create a single supabase client for interacting with your database
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};

export const fetchCourses = async (): Promise<
  APIResponse<DatabaseCourse[]>
> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient.from("courses").select("*");

    return {
      success: !error,
      message: error ? error.message : "Courses fetched successfully",
      data: data || [],
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch courses",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchCourse = async (
  id: string
): Promise<APIResponse<DatabaseCourse>> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    return {
      success: !error,
      message: error ? error.message : "Course fetched successfully",
      data: data || undefined,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch course",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchLessons = async (
  courseId: string
): Promise<APIResponse<DatabaseLesson[]>> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order", { ascending: true });

    return {
      success: !error,
      message: error ? error.message : "Lessons fetched successfully",
      data: data || [],
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lessons",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchLesson = async (
  id: string
): Promise<APIResponse<DatabaseLesson>> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    return {
      success: !error,
      message: error ? error.message : "Lesson fetched successfully",
      data: data || undefined,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lesson",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const searchContent = async (
  query: string,
  filters?: {
    type?: string;
    category?: string;
    level?: string;
    limit?: number;
  }
): Promise<APIResponse<DatabaseCourse[]>> => {
  try {
    const supabaseClient = createSupabaseClient();
    let queryBuilder = supabaseClient.from("courses").select("*");

    if (filters?.type) {
      queryBuilder = queryBuilder.eq("type", filters.type);
    }

    if (filters?.category) {
      queryBuilder = queryBuilder.eq("category", filters.category);
    }

    if (filters?.level) {
      queryBuilder = queryBuilder.eq("level", filters.level);
    }

    if (filters?.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    const { data, error } = await queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );

    return {
      success: !error,
      message: error ? error.message : "Search completed successfully",
      data: data || [],
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to search content",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export interface CreateForumPostData {
  title: string;
  content: string;
  category?: string;
}

export async function createForumPost(data: CreateForumPostData) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: post, error } = await supabase
    .from("forum_posts")
    .insert({
      title: data.title,
      content: data.content,
      category: data.category,
      author_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return post;
}

export async function getForumPost(postId: string): Promise<ExtendedForumPost> {
  const { data: post, error } = await supabase
    .from("forum_posts")
    .select(
      `
      *,
      author:author_id (
        id,
        name:full_name,
        role,
        avatar_url
      ),
      comments:forum_comments (
        *,
        author:author_id (
          id,
          name:full_name,
          role,
          avatar_url
        )
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!post) {
    throw new Error("הפוסט לא נמצא");
  }

  return {
    ...post,
    category: "general",
    isLiked: false,
    isBookmarked: false,
    likes: 0,
    views: 0,
    tags: [],
  } as ExtendedForumPost;
}

interface CreateForumCommentParams {
  postId: string;
  content: string;
}

export async function createForumComment({
  postId,
  content,
}: CreateForumCommentParams) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("יש להתחבר כדי להוסיף תגובה");
  }

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    content,
    author_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export const fetchUserProfile = async (
  userId: string
): Promise<APIResponse<DatabaseUser>> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return {
      success: !error,
      message: error ? error.message : "Profile fetched successfully",
      data: data || undefined,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch user profile",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Database["public"]["Tables"]["users"]["Update"]>
): Promise<APIResponse<DatabaseUser>> => {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    return {
      success: !error,
      message: error ? error.message : "Profile updated successfully",
      data: data || undefined,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update user profile",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchForumPosts = async (options?: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
}): Promise<APIResponse<(DatabaseForumPost & { author: DatabaseUser })[]>> => {
  try {
    const supabaseClient = createSupabaseClient();
    let query = supabaseClient
      .from("forum_posts")
      .select("*, author:users!author_id(*)");

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.tag) {
      query = query.contains("tags", [options.tag]);
    }

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    return {
      success: !error,
      message: error ? error.message : "Forum posts fetched successfully",
      data: data || [],
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch forum posts",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
