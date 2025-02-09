export interface ForumAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author: {
    id?: string;
    name: string;
    avatar_url?: string | null;
  };
  likes_count?: number;
  is_solution?: boolean;
  parent_id?: string;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at?: string;
  author: {
    id?: string;
    name: string;
    avatar_url?: string | null;
  };
  category?: string;
  tags?: string[];
  replies_count: number;
  likes_count?: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  last_reply_at?: string;
  views_count?: number;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  posts_count: number;
  last_post?: {
    id: string;
    title: string;
    created_at: string;
    author: {
      name: string;
      avatar_url?: string | null;
    };
  };
}
