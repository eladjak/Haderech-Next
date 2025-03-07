/**
 * טיפוסים עבור מערכת הפורום
 */

import type { Database } from "./database";

export type DbResult<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface Author {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  image?: string;
  role?: string;
  points?: number;
  level?: number;
  badges?: any[];
  achievements?: any[];
  full_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BaseForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  category: ForumCategory;
  tags: ForumTag[];
  pinned: boolean;
  solved: boolean;
  likes: number;
  views: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}
export interface ForumPost extends BaseForumPost {
  author: Author;
  comments?: ForumComment[];
  comments_count?: number;
}

export interface ExtendedForumPost extends BaseForumPost {
  author: Author;
  comments?: ForumComment[];
  replies_count?: number;
  comments_count?: number;
}

export interface ForumComment {
  id: string;
  content: string;
  author: Author;
  post_id?: string;
  likes?: number;
  created_at: string;
  updated_at?: string;
}
export interface ExtendedForumComment extends ForumComment {
  post: ForumPost;
  liked_by_user?: boolean;
  isLiked?: boolean;
  replies_count?: number;
}

export interface ForumTag {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  posts_count: number;
  created_at: string;
  updated_at: string;
}
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  icon: string;
  color: string;
  posts_count: number;
  created_at: string;
  updated_at: string;
}
export type ForumPostTag = DbResult<"forum_post_tags">;

export interface ForumStats {
  total_users: number;
  active_users: number;
  posts_today: number;
  total_posts: number;
  total_comments: number;
  total_views: number;
  total_likes: number;
  total_solved: number;
  trending_tags?: Array<{ tag: ForumTag; count: number }>;
  popular_tags?: Array<{ tag: ForumTag; count: number }>;
  top_contributors: Author[];
}

export type ForumFilters = {
  search: string;
  sort: "latest" | "popular" | "unanswered";
  category: string | undefined;
  status: "all" | "solved" | "unsolved";
  timeframe: "all" | "today" | "week" | "month" | "year";
  tag?: string;
};

export interface ForumMetrics {
  engagement_rate: number;
  response_time: number;
  solution_rate: number;
  user_satisfaction: number;
  active_discussions: number;
  trending_topics: string[];
  user_growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  content_quality: {
    average_post_length: number;
    average_response_length: number;
    helpful_responses_ratio: number;
  };
}

export interface ForumProps {
  posts: ExtendedForumPost[];
  stats: ForumStats;
  isLoading?: boolean;
  error?: string;
}
export interface ForumStatsProps {
  stats: ForumStats;
}
export type ForumStatsType = ForumStats;

export interface ForumPostWithAuthor extends ForumPost {
  author: Author;
}
