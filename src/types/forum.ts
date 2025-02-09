import type { Tables } from "@/types/database";

export type ForumPost = Tables<"forum_posts">;
export type ForumComment = Tables<"forum_comments">;

export interface ForumPostWithRelations extends ForumPost {
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  comments?: ForumCommentWithRelations[];
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface ForumCommentWithRelations extends ForumComment {
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  post?: ForumPost;
  replies?: ForumCommentWithRelations[];
  _count?: {
    replies: number;
    likes: number;
  };
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  posts_count: number;
  last_activity?: string;
}

export interface ForumStats {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  activeUsers: number;
  postsToday: number;
  popularCategories: {
    id: string;
    name: string;
    posts_count: number;
  }[];
}

export interface ForumFilters {
  search?: string;
  category?: string;
  author?: string;
  sortBy?: "newest" | "popular" | "unanswered";
  timeframe?: "today" | "week" | "month" | "all";
}

export interface ForumNotification {
  id: string;
  userId: string;
  type: "mention" | "reply" | "like";
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
