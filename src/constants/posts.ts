import { ForumPost } from "@/types/api";

import { users } from "./users";

export const posts: ForumPost[] = [
  {
    id: "1",
    title: "איך להתחיל ללמוד תכנות?",
    content:
      "אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. אשמח להמלצות!",
    author: users[0]
      ? {
          id: users[0].id,
          name: users[0].name,
          email: users[0].email,
          avatar_url: users[0].avatar_url,
          bio: users[0].bio,
        }
      : {
          id: "default",
          name: "משתמש ברירת מחדל",
          email: "default@example.com",
          avatar_url: null,
          bio: null,
        },
    user: users[0] ?? {
      id: "default",
      name: "משתמש ברירת מחדל",
      email: "default@example.com",
      avatar_url: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: "user",
      settings: {
        notifications: true,
        language: "he",
        theme: "light",
      },
    },
    userId: users[0]?.id ?? "default",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    likes: 5,
    likes_count: 5,
    comments_count: 2,
    comments: [],
    tags: ["תכנות", "התחלה", "המלצות"],
    is_liked: false,
  },
  {
    id: "2",
    title: "React או Vue?",
    content: "מה עדיף ללמוד כספריית UI ראשונה - React או Vue?",
    author: users[1]
      ? {
          id: users[1].id,
          name: users[1].name,
          email: users[1].email,
          avatar_url: users[1].avatar_url,
          bio: users[1].bio,
        }
      : {
          id: "default",
          name: "משתמש ברירת מחדל",
          email: "default@example.com",
          avatar_url: null,
          bio: null,
        },
    user: users[1] ?? {
      id: "default",
      name: "משתמש ברירת מחדל",
      email: "default@example.com",
      avatar_url: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: "user",
      settings: {
        notifications: true,
        language: "he",
        theme: "light",
      },
    },
    userId: users[1]?.id ?? "default",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    likes: 3,
    likes_count: 3,
    comments_count: 5,
    comments: [],
    tags: ["react", "vue", "frontend"],
    is_liked: true,
  },
  {
    id: "3",
    title: "טיפים ללימוד Node.js",
    content: "אשמח לקבל טיפים ללימוד Node.js למתחילים",
    author: users[2]
      ? {
          id: users[2].id,
          name: users[2].name,
          email: users[2].email,
          avatar_url: users[2].avatar_url,
          bio: users[2].bio,
        }
      : {
          id: "default",
          name: "משתמש ברירת מחדל",
          email: "default@example.com",
          avatar_url: null,
          bio: null,
        },
    user: users[2] ?? {
      id: "default",
      name: "משתמש ברירת מחדל",
      email: "default@example.com",
      avatar_url: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: "user",
      settings: {
        notifications: true,
        language: "he",
        theme: "light",
      },
    },
    userId: users[2]?.id ?? "default",
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-03T00:00:00Z"),
    likes: 2,
    likes_count: 2,
    comments_count: 1,
    comments: [],
    tags: ["nodejs", "backend", "javascript"],
    is_liked: false,
  },
];
