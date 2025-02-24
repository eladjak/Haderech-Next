import type { Author, ForumCategory, ForumPost, ForumTag } from "@/types/forum";

export const forumCategories: ForumCategory[] = [
  {
    id: "1",
    name: "כללי",
    description: "דיונים כלליים בנושאי תכנות",
    slug: "general",
    order: 1,
    icon: "MessageSquare",
    color: "#3498db",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "שאלות ותשובות",
    description: "שאלות טכניות ועזרה הדדית",
    slug: "questions",
    order: 2,
    icon: "HelpCircle",
    color: "#2ecc71",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const forumTags: ForumTag[] = [
  {
    id: "1",
    name: "JavaScript",
    description: "שפת התכנות JavaScript",
    slug: "javascript",
    color: "#f7df1e",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "React",
    description: "ספריית React",
    slug: "react",
    color: "#61dafb",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockAuthor: Author = {
  id: "1",
  name: "משתמש לדוגמה",
  email: "example@test.com",
  username: "example_user",
  role: "user",
  points: 100,
  level: 1,
  badges: [],
  achievements: [],
  full_name: "משתמש לדוגמה",
  image: undefined,
  avatar_url: undefined,
  bio: undefined,
  last_seen: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  posts_count: 0,
  likes_received: 0,
};

export const mockCategory: ForumCategory = {
  id: "1",
  name: "כללי",
  description: "דיונים כלליים",
  slug: "general",
  color: "#4A5568",
  order: 1,
  icon: "MessageSquare",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockTag: ForumTag = {
  id: "1",
  name: "JavaScript",
  description: "שפת תכנות JavaScript",
  slug: "javascript",
  color: "#F7DF1E",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const SAMPLE_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "שאלה לגבי התחלת הקורס",
    content: "האם כדאי להתחיל מהקורס הבסיסי או מהמתקדם?",
    author_id: mockAuthor.id,
    category_id: mockCategory.id,
    category: mockCategory,
    tags: [mockTag],
    pinned: false,
    solved: false,
    likes: 0,
    views: 0,
    comments_count: 0,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: mockAuthor,
  },
];

export const mockPosts: ForumPost[] = [SAMPLE_POSTS[0]];
