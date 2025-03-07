import { cookies } from "next/headers";

/**
 * גרסה דמה של קליינט supabase לצרכי בנייה בלבד
 */
export function createClient(cookieStore: ReturnType<typeof cookies>) {
  // במימוש אמיתי, ניצור חיבור לsupabase כאן
  const mockResult = {
    data: [],
    error: null,
    count: 0,
  };

  // יצירת אובייקט שמחזיר את עצמו לכל מתודה כדי לאפשר שרשור
  const chainable = {
    eq: (column: string, value: any) => chainable,
    or: (column: string, value: any) => chainable,
    gte: (column: string, value: any) => chainable,
    contains: (column: string, value: any) => chainable,
    range: (from: string | number, to: string | number) => chainable,
    order: (column: string, options: any) => chainable,
    match: (column: string, value: any) => chainable,
    is: (column: string, value: any) => chainable,
    single: () => {
      const table = chainable._currentTable || "";

      if (table.includes("forum_comments")) {
        return Promise.resolve({
          ...mockResult,
          data: {
            id: "mock-comment-id",
            post_id: "mock-post-id",
            parent_id: null,
            content: "Mock Comment Content",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "mock-user-id",
            author: {
              id: "mock-user-id",
              name: "Mock User",
              avatar_url: null,
              email: "user@example.com",
            },
            replies: [],
          },
        });
      }

      if (table.includes("forum_posts")) {
        return Promise.resolve({
          ...mockResult,
          data: {
            id: "mock-post-id",
            title: "Mock Post Title",
            content: "Mock Post Content",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author_id: "mock-user-id",
            user_id: "mock-user-id",
          },
        });
      }

      return Promise.resolve({
        ...mockResult,
        data: {
          author_id: "mock-user-id",
          id: "mock-id",
          title: "Mock Title",
          content: "Mock Content",
          user_id: "mock-user-id",
        },
      });
    },
    select: (fields?: string) => chainable,
    insert: (data: any) => chainable,
    update: (data: any) => chainable,
    upsert: (data: any, options?: any) => chainable,
    delete: () => chainable,
    from: (table: string) => {
      chainable._currentTable = table;
      return chainable;
    },
    // החזרת הבטחה בסיום השרשור
    _currentTable: "",
    then: (callback: (result: typeof mockResult) => any) =>
      Promise.resolve(mockResult).then(callback),
  };

  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: "mock-user-id",
              email: "user@example.com",
              name: "Mock User",
            },
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: {
          user: {
            id: "mock-user-id",
            email: "user@example.com",
            name: "Mock User",
          },
        },
        error: null,
      }),
    },
    // יצירת חיבור לטבלה שמחזיר את האובייקט chainable
    from: (table: string) => chainable,
    // פונקציות גלובליות נוספות
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => ({
          data: { path },
          error: null,
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://example.com/${path}` },
          error: null,
        }),
      }),
    },
  };
}

// לתאימות עם הקוד הקיים
export const createServerClient = createClient;
