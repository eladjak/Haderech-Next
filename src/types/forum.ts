import type { Database } from "./database";
import type { User as ModelsUser } from "./models";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Author = ModelsUser;

export type ForumPost = Database["public"]["Tables"]["forum_posts"]["Row"] & {
  author: Author;
  comments: ForumComment[];
  category: ForumCategory;
  tags: ForumTag[];
};

export type ForumComment =
  Database["public"]["Tables"]["forum_comments"]["Row"] & {
    author: Author;
    replies: ForumComment[];
    liked_by_user?: boolean;
  };

export type ForumCategory =
  Database["public"]["Tables"]["forum_categories"]["Row"];

export type ForumTag = Database["public"]["Tables"]["forum_tags"]["Row"];

export type ForumPostTag =
  Database["public"]["Tables"]["forum_post_tags"]["Row"];

export type ForumStats = {
  total_posts: number;
  total_comments: number;
  total_views: number;
  total_likes: number;
  active_users: number;
  posts_today: number;
  trending_tags: Array<{
    tag: ForumTag;
    count: number;
  }>;
  top_contributors: Array<{
    author: Author;
    posts_count: number;
    likes_received: number;
  }>;
};

export type ForumFilters = {
  category?: string;
  tag?: string;
  sort?: "latest" | "popular" | "unanswered";
  search?: string;
  author?: string;
  timeframe?: "today" | "week" | "month" | "year" | "all";
  status?: "all" | "solved" | "unsolved";
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
