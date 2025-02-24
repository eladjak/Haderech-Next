import type {
  Author,
  ForumCategory,
  ForumComment,
  ForumPost,
  ForumStats,
  ForumTag,
} from "@/types/forum";

// פיקסצ'רים למשתמשים
export const users = {
  // משתמש רגיל
  regularUser: {
    id: "1",
    name: "משתמש רגיל",
    email: "user@example.com",
    image: undefined,
    avatar_url: undefined,
    bio: undefined,
    username: "regular_user",
    role: "user",
    points: 100,
    level: 1,
    badges: [],
    achievements: [],
    full_name: "משתמש רגיל",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen: undefined,
  } as Author,

  // מנהל
  adminUser: {
    id: "2",
    name: "מנהל מערכת",
    email: "admin@example.com",
    image: undefined,
    avatar_url: undefined,
    bio: undefined,
    username: "admin_user",
    role: "admin",
    points: 500,
    level: 5,
    badges: [],
    achievements: [],
    full_name: "מנהל מערכת",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen: undefined,
  } as Author,

  // מדריך
  instructorUser: {
    id: "3",
    name: "מדריך",
    email: "instructor@example.com",
    image: undefined,
    avatar_url: undefined,
    bio: undefined,
    username: "instructor_user",
    role: "instructor",
    points: 300,
    level: 3,
    badges: [],
    achievements: [],
    full_name: "מדריך",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen: undefined,
  } as Author,
};

// פיקסצ'רים לקטגוריות
export const categories = {
  // קטגוריה כללית
  general: {
    id: "1",
    name: "כללי",
    description: "דיונים כלליים",
    slug: "general",
    order: 1,
    icon: "chat",
    color: "#4CAF50",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as ForumCategory,

  // קטגוריית שאלות
  technical: {
    id: "2",
    name: "טכני",
    description: "שאלות טכניות",
    slug: "technical",
    order: 2,
    icon: "code",
    color: "#2196F3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as ForumCategory,
};

// פיקסצ'רים לתגיות
export const tags = {
  // תגית JavaScript
  javascript: {
    id: "1",
    name: "JavaScript",
    description: "שפת תכנות JavaScript",
    slug: "javascript",
    color: "#F7DF1E",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as ForumTag,

  // תגית React
  react: {
    id: "2",
    name: "React",
    description: "ספריית React",
    slug: "react",
    color: "#61DAFB",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as ForumTag,
};

// פיקסצ'רים לתגובות
export const comments = {
  regular: {
    id: "1",
    content: "תגובה רגילה",
    author_id: users.regularUser.id,
    post_id: "1",
    parent_id: undefined,
    likes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: users.regularUser,
    user: users.regularUser,
    replies: [],
  } as ForumComment,

  withReplies: {
    id: "2",
    content: "תגובה עם תגובות",
    author_id: users.regularUser.id,
    post_id: "1",
    parent_id: undefined,
    likes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: users.regularUser,
    user: users.regularUser,
    replies: [],
  } as ForumComment,
};

// פיקסצ'רים לפוסטים
export const posts = {
  regular: {
    id: "1",
    title: "פוסט רגיל",
    content: "תוכן הפוסט",
    author_id: users.regularUser.id,
    category_id: categories.general.id,
    category: categories.general,
    tags: [tags.javascript],
    pinned: false,
    solved: false,
    likes: 0,
    views: 0,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: users.regularUser,
    comments: [],
    comments_count: 0,
  } as ForumPost,

  pinned: {
    id: "2",
    title: "פוסט נעוץ",
    content: "תוכן הפוסט הנעוץ",
    author_id: users.adminUser.id,
    category_id: categories.technical.id,
    category: categories.technical,
    tags: [tags.react],
    pinned: true,
    solved: false,
    likes: 10,
    views: 100,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: users.adminUser,
    comments: [],
    comments_count: 0,
  } as ForumPost,
};

// פיקסצ'רים לסטטיסטיקות
export const statsFixtures: ForumStats = {
  total_users: 100,
  active_users: 50,
  posts_today: 10,
  total_posts: 1000,
  total_comments: 5000,
  total_views: 10000,
  total_likes: 2000,
  total_solved: 500,
  trending_tags: [{ tag: tags.javascript, count: 10 }],
  popular_tags: [{ tag: tags.react, count: 20 }],
  top_contributors: [users.regularUser],
};

// ייצוא ברירת מחדל
export default {
  users,
  categories,
  tags,
  comments,
  posts,
  stats: statsFixtures,
};
