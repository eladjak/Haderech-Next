import type { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface Author {
  id: string;
  name: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  image: string | null;
  role: string;
}

export interface ForumPost extends Tables<"forum_posts"> {
  author: Author;
  comments: ForumComment[];
  likes: number;
  views: number;
  tags: string[];
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  author: Author;
  content: string;
  likes: number;
  parent_id: string | null;
  replies: ForumComment[];
  created_at: string;
  updated_at: string;
}

export interface ExtendedForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: Author;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: ForumComment[];
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  replies_count?: number;
}

export interface ExtendedForumComment extends ForumComment {
  isLiked: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  post_count: number;
  icon: string;
}

export interface ForumTag {
  id: string;
  name: string;
  description: string;
  color: string;
}
