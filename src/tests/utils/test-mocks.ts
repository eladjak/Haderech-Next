import { vi } from "vitest";

import type {
  Author,
  ForumCategory,
  ForumComment,
  ForumPost,
  ForumStats,
  ForumTag,
} from "@/types/forum";
import type { Mock } from "@/types/mock-types";
import type { Database } from "@/types/supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

// מוקים למשתמשים
export const mockAuthor: Author = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  image: undefined,
  avatar_url: undefined,
  bio: undefined,
  username: "testuser",
  role: "user",
  full_name: "Test User",
  points: 100,
  level: 1,
  badges: [],
  achievements: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_seen: undefined,
};

// מוקים לקטגוריות
export const mockCategory: ForumCategory = {
  id: "1",
  name: "כללי",
  description: "דיונים כלליים",
  slug: "general",
  order: 1,
  icon: "MessageSquare",
  color: "#3498db",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// מוקים לתגיות
export const mockTag: ForumTag = {
  id: "mock-tag-id",
  name: "מוק תג",
  slug: "mock-tag",
  description: "תיאור של מוק תג לבדיקות",
  color: "#3498db",
  posts_count: 15,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
};

// מוקים לתגובות
export const mockComment: ForumComment = {
  id: "mock-comment-id",
  content: "תוכן של תגובה לבדיקות",
  post_id: "mock-post-id",
  author_id: "mock-author-id",
  parent_id: undefined,
  likes: 5,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
  author: mockAuthor,
  user: mockAuthor,
  replies: [],
};

// מוקים לפוסטים
export const mockPost: ForumPost = {
  id: "mock-post-id",
  title: "כותרת פוסט לבדיקות",
  content: "תוכן של פוסט לבדיקות",
  author_id: "mock-author-id",
  category_id: "mock-category-id",
  pinned: false,
  solved: false,
  likes: 10,
  views: 100,
  author: mockAuthor,
  category: mockCategory,
  tags: [mockTag],
  comments: [mockComment],
  comments_count: 1,
  last_activity: "2023-01-01T00:00:00.000Z",
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
};

// מוקים לסטטיסטיקות
export const mockStats: ForumStats = {
  total_users: 100,
  active_users: 50,
  posts_today: 5,
  total_posts: 1000,
  total_comments: 5000,
  total_views: 10000,
  total_likes: 2000,
  total_solved: 500,
  trending_tags: [{ tag: mockTag, count: 10 }],
  popular_tags: [{ tag: mockTag, count: 20 }],
  top_contributors: [mockAuthor],
};

// מוקים ל-API responses
export const mockApiResponses = {
  success: { status: 200, data: { success: true } },
  created: { status: 201, data: { success: true } },
  error: { status: 500, data: { error: "Internal Server Error" } },
  unauthorized: { status: 401, data: { error: "Unauthorized" } },
  notFound: { status: 404, data: { error: "Not Found" } },
  badRequest: { status: 400, data: { error: "Bad Request" } },
};

// מוקים לפונקציות
export const mockFunctions = {
  navigate: vi.fn(),
  handleEvent: vi.fn(),
  submitForm: vi.fn(),
  fetchApi: vi.fn().mockResolvedValue(mockApiResponses.success),
  createPost: vi.fn().mockResolvedValue(mockPost),
  updatePost: vi.fn().mockResolvedValue(mockPost),
  deletePost: vi.fn().mockResolvedValue({ success: true }),
  createComment: vi.fn().mockResolvedValue(mockComment),
  updateComment: vi.fn().mockResolvedValue(mockComment),
  deleteComment: vi.fn().mockResolvedValue({ success: true }),
};

// מוקים לשירותים
export const mockServices = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockAuthor } }),
    signIn: vi.fn().mockResolvedValue({ data: { user: mockAuthor } }),
  },
  db: {
    getPosts: vi.fn().mockResolvedValue([mockPost]),
    getPost: vi.fn().mockResolvedValue(mockPost),
    createPost: vi.fn().mockResolvedValue(mockPost),
    updatePost: vi.fn().mockResolvedValue(mockPost),
    deletePost: vi.fn().mockResolvedValue({ success: true }),
    getComments: vi.fn().mockResolvedValue([mockComment]),
    createComment: vi.fn().mockResolvedValue(mockComment),
    updateComment: vi.fn().mockResolvedValue(mockComment),
    deleteComment: vi.fn().mockResolvedValue({ success: true }),
  },
  storage: {
    uploadFile: vi.fn().mockResolvedValue({ data: { path: "test/path" } }),
    getFileUrl: vi.fn().mockReturnValue("https://example.com/image.jpg"),
    deleteFile: vi.fn().mockResolvedValue({ success: true }),
  },
  notification: {
    send: vi.fn().mockResolvedValue({ success: true }),
    getAll: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn().mockResolvedValue({ success: true }),
  },
};

// מוקים ל-Auth
export const mockAuth = {
  getUser: vi.fn().mockResolvedValue({ data: { user: mockAuthor } }),
  signIn: vi.fn().mockResolvedValue({ data: { user: mockAuthor } }),
};

// מוקים ל-Supabase client
export const mockSupabaseClient = {
  auth: mockAuth,
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockPost }),
        is: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPost }),
        }),
      }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [mockPost],
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockPost }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: mockPost }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ success: true }),
    }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: "test/path" } }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: "https://example.com/image.jpg" },
      }),
      remove: vi.fn().mockResolvedValue({ success: true }),
    }),
  },
} as unknown as SupabaseClient<Database>;

// מוקים ל-Cookies
export const mockCookies = {
  get: vi.fn().mockReturnValue("test-value"),
  set: vi.fn(),
  remove: vi.fn(),
};

// מוקים ל-Route Handler
export const mockRouteHandlerClient = {
  cookies: vi.fn().mockReturnValue(mockCookies),
  supabase: mockSupabaseClient,
};

// מוקים ל-Server
export const mockServerClient = {
  cookies: vi.fn().mockReturnValue(mockCookies),
  supabase: mockSupabaseClient,
};

// מוקים ל-OpenAI
export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "תוכן תשובה מ-OpenAI",
            },
          },
        ],
      }),
    },
  },
};

// מוקים לרכיבים
export const mockComponents = {
  Spinner: () => null,
  Skeleton: () => null,
  Toast: () => null,
  Alert: () => null,
  Input: () => null,
  Select: () => null,
  Button: () => null,
};

// ייצוא ברירת מחדל של כל המוקים
export default {
  author: mockAuthor,
  category: mockCategory,
  tag: mockTag,
  comment: mockComment,
  post: mockPost,
  stats: mockStats,
  apiResponses: mockApiResponses,
  functions: mockFunctions,
  services: mockServices,
  auth: mockAuth,
  supabaseClient: mockSupabaseClient,
  cookies: mockCookies,
  routeHandlerClient: mockRouteHandlerClient,
  serverClient: mockServerClient,
  openAI: mockOpenAI,
  components: mockComponents,
};
