export interface ForumAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface ForumComment {
  id: string;
  content: string;
  author: ForumAuthor;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: ForumAuthor;
  createdAt: string;
  updatedAt?: string;
  commentsCount: number;
  comments?: ForumComment[];
  tags?: string[];
  likes?: number;
  views?: number;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  postsCount: number;
  lastPost?: ForumPost;
}
