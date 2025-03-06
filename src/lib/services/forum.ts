"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database";
import type {
  Author,
  ForumComment as ForumCommentType,
  ForumPost as ForumPostType,
  ForumTag as ForumTagType,
} from "@/types/forum";

// טיפוסים בסיסיים לפורום
export interface CreateForumPostParams {
  title: string;
  content: string;
  tags?: string[];
}

export interface CreateForumCommentParams {
  postId: string;
  content: string;
}

/**
 * יוצר פוסט חדש בפורום
 */
export async function createForumPost(
  params: CreateForumPostParams
): Promise<Partial<ForumPostType>> {
  try {
    console.log("Creating forum post:", params);

    // בסביבת פיתוח, מחזיר נתונים מדומים
    if (process.env.NODE_ENV === "development") {
      const mockAuthor: Author = {
        id: "user-1",
        name: "משתמש מדומה",
        image: "/placeholder-avatar.jpg",
      };

      const mockCategory = {
        id: "category-1",
        name: "כללי",
        description: "",
        slug: "general",
        order: 0,
        icon: "chat",
        color: "blue",
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTags: ForumTagType[] =
        params.tags?.map((tag, index) => ({
          id: `tag-${index}`,
          name: tag,
          description: "",
          slug: tag.toLowerCase().replace(/\s+/g, "-"),
          color: "gray",
          posts_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) || [];

      return {
        id: `post-${Date.now()}`,
        title: params.title,
        content: params.content,
        author: mockAuthor,
        author_id: mockAuthor.id,
        category_id: mockCategory.id,
        category: mockCategory,
        tags: mockTags,
        pinned: false,
        solved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        views: 0,
        last_activity: new Date().toISOString(),
        comments_count: 0,
      };
    }

    // בסביבת ייצור, שומר את הפוסט בבסיס הנתונים
    const supabase = createClientComponentClient<Database>();

    // קבלת פרטי המשתמש המחובר
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("המשתמש אינו מחובר");
    }

    // קבלת פרטי הפרופיל של המשתמש
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // יצירת הפוסט
    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        title: params.title,
        content: params.content,
        user_id: user.id,
        tags: params.tags,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // המרת התגיות למבנה הנדרש
    const formattedTags: ForumTagType[] = (data.tags || []).map(
      (tag: string, index: number) => ({
        id: `tag-${index}`,
        name: tag,
        description: "",
        slug: tag.toLowerCase().replace(/\s+/g, "-"),
        color: "gray",
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );

    const defaultCategory = {
      id: "default",
      name: "כללי",
      description: "",
      slug: "general",
      order: 0,
      icon: "chat",
      color: "blue",
      posts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: {
        id: profile.id,
        name: profile.full_name || profile.username,
        image: profile.avatar_url,
      },
      author_id: user.id,
      category_id: data.category_id || "default",
      category: defaultCategory,
      tags: formattedTags,
      pinned: false,
      solved: false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      likes: data.likes_count || 0,
      views: data.views_count || 0,
      last_activity: data.created_at,
      comments_count: data.comments_count || 0,
    };
  } catch (error) {
    console.error("Error creating forum post:", error);
    throw error;
  }
}

/**
 * יוצר תגובה חדשה לפוסט בפורום
 */
export async function createForumComment(
  params: CreateForumCommentParams
): Promise<ForumCommentType> {
  try {
    console.log("Creating forum comment:", params);

    // בסביבת פיתוח, מחזיר נתונים מדומים
    if (process.env.NODE_ENV === "development") {
      return {
        id: `comment-${Date.now()}`,
        content: params.content,
        author: {
          id: "user-1",
          name: "משתמש מדומה",
          image: "/placeholder-avatar.jpg",
        },
        created_at: new Date().toISOString(),
        post_id: params.postId,
        likes: 0,
      };
    }

    // בסביבת ייצור, שומר את התגובה בבסיס הנתונים
    const supabase = createClientComponentClient<Database>();

    // קבלת פרטי המשתמש המחובר
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("המשתמש אינו מחובר");
    }

    // קבלת פרטי הפרופיל של המשתמש
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // יצירת התגובה
    const { data, error } = await supabase
      .from("forum_comments")
      .insert({
        content: params.content,
        post_id: params.postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // עדכון מספר התגובות בפוסט
    await supabase.rpc("increment_post_comments_count", {
      post_id: params.postId,
    });

    return {
      id: data.id,
      content: data.content,
      author: {
        id: profile.id,
        name: profile.full_name || profile.username,
        image: profile.avatar_url,
      },
      created_at: data.created_at,
      post_id: data.post_id,
      likes: 0,
    };
  } catch (error) {
    console.error("Error creating forum comment:", error);
    throw error;
  }
}

/**
 * מחזיר את כל הפוסטים בפורום
 */
export async function getForumPosts() {
  const supabase = createClientComponentClient<Database>();

  try {
    const { data, error } = await supabase
      .from("forum_posts")
      .select(
        `
        id,
        title,
        content,
        created_at,
        updated_at,
        tags,
        profiles(id, name, avatar)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.profiles[0].id,
        name: post.profiles[0].name,
        avatar: post.profiles[0].avatar,
      },
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      likes: 0, // זה יהיה query נפרד
      comments: 0, // זה יהיה query נפרד
      views: 0, // זה יהיה query נפרד
      tags: post.tags,
    }));
  } catch (error) {
    console.error("שגיאה בקבלת פוסטים מהפורום:", error);
    throw error;
  }
}

/**
 * מחזיר פוסט ספציפי לפי מזהה
 */
export async function getForumPost(id: string) {
  const supabase = createClientComponentClient<Database>();

  try {
    const { data, error } = await supabase
      .from("forum_posts")
      .select(
        `
        id,
        title,
        content,
        created_at,
        updated_at,
        tags,
        profiles(id, name, avatar)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: {
        id: data.profiles[0].id,
        name: data.profiles[0].name,
        avatar: data.profiles[0].avatar,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      likes: 0, // זה יהיה query נפרד
      comments: 0, // זה יהיה query נפרד
      views: 0, // זה יהיה query נפרד
      tags: data.tags,
    };
  } catch (error) {
    console.error(`שגיאה בקבלת פוסט ${id} מהפורום:`, error);
    throw error;
  }
}

/**
 * מחזיר את כל התגובות לפוסט ספציפי
 */
export async function getForumComments(postId: string) {
  const supabase = createClientComponentClient<Database>();

  try {
    const { data, error } = await supabase
      .from("forum_comments")
      .select(
        `
        id,
        content,
        created_at,
        post_id,
        parent_id,
        profiles(id, name, avatar)
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.profiles[0].id,
        name: comment.profiles[0].name,
        avatar: comment.profiles[0].avatar,
      },
      createdAt: comment.created_at,
      postId: comment.post_id,
      parentId: comment.parent_id,
      likes: 0, // זה יהיה query נפרד
    }));
  } catch (error) {
    console.error(`שגיאה בקבלת תגובות לפוסט ${postId}:`, error);
    throw error;
  }
}
