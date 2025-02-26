import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/ssr";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { GET, POST } from "../forum/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const mockPost = {
    id: "test-post-id",
    title: "פוסט לדוגמה",
    content: "תוכן הפוסט",
    author_id: mockUser.id,
    author: mockUser,
    category: "general",
    category_details: {
      id: "general",
      name: "כללי",
    },
    tags: ["test"],
    tags_details: [
      {
        id: "test",
        name: "טסט",
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockPost,
        error: null,
      })),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      }),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // מוק לשליפת פוסטים
    mockSupabase.from().select.mockResolvedValueOnce({
      data: [mockPost],
      error: null,
    });

    // מוק לשגיאה בשליפת פוסטים
    mockSupabase.from().select.mockResolvedValueOnce({
      data: null,
      error: { message: "שגיאת מסד נתונים" },
    });

    // מוק ליצירת פוסט
    mockSupabase.from().insert.mockReturnThis();
    mockSupabase.from().insert().select.mockReturnThis();
    mockSupabase
      .from()
      .insert()
      .select()
      .single.mockResolvedValueOnce({
        data: { ...mockPost, id: "new-post-1" },
        error: null,
      });

    // מוק לשגיאה ביצירת פוסט
    mockSupabase.from().insert.mockReturnThis();
    mockSupabase.from().insert().select.mockReturnThis();
    mockSupabase
      .from()
      .insert()
      .select()
      .single.mockResolvedValueOnce({
        data: null,
        error: { message: "שגיאת מסד נתונים" },
      });
  });

  vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);
  vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

  describe("GET /api/forum", () => {
    it("מחזיר את כל הפוסטים", async () => {
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [mockPost],
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockPost]);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת הפוסטים", async () => {
      const errorMessage = "שגיאת מסד נתונים";
      mockSupabase.from().select.mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      const request = new NextRequest("http://localhost:3000/api/forum");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
        details: errorMessage,
      });
    });

    it("מסנן פוסטים לפי קטגוריה", async () => {
      const category = "javascript";
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [mockPost],
        error: null,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/forum?category=${category}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(mockSupabase.from().select).toHaveBeenCalledWith(
        `
        *,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      );
      expect(response.status).toBe(200);
      expect(data).toEqual([mockPost]);
    });

    it("מסנן פוסטים לפי תגית", async () => {
      const tag = "react";
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [mockPost],
        error: null,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/forum?tag=${tag}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(mockSupabase.from().select).toHaveBeenCalledWith(
        `
        *,
        author:users(id, name, avatar_url),
        category:forum_categories(id, name),
        tags:forum_tags(id, name)
      `
      );
      expect(response.status).toBe(200);
      expect(data).toEqual([mockPost]);
    });
  });

  describe("POST /api/forum", () => {
    const newPost = {
      title: "פוסט חדש",
      content: "תוכן הפוסט החדש",
      category: "general",
      tags: ["javascript", "react"],
    };

    it("יוצר פוסט חדש בהצלחה", async () => {
      const createdPost = {
        ...newPost,
        id: "new-post-1",
        author_id: mockUser.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        author: mockUser,
        category_details: { id: "general", name: "כללי" },
        tags_details: [
          { id: "javascript", name: "JavaScript" },
          { id: "react", name: "React" },
        ],
      };

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: createdPost,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject(createdPost);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר חסרה כותרת", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({ content: "תוכן" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "חסרה כותרת",
      });
    });

    it("מחזיר שגיאה כאשר חסר תוכן", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({ title: "כותרת" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "חסר תוכן",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה ביצירת הפוסט", async () => {
      const errorMessage = "שגיאת מסד נתונים";
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: errorMessage },
        });

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
        details: errorMessage,
      });
    });
  });
});
