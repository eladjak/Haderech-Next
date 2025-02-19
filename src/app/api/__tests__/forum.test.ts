import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../forum/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockPost = {
    id: "test-post-id",
    title: "פוסט לדוגמה",
    content: "תוכן הפוסט",
    author_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: "general",
    tags: ["test"],
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockPost,
        error: null,
      })),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      }),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    } as any);
    vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);
  });

  describe("GET /api/forum", () => {
    it("מחזיר את כל הפוסטים", async () => {
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
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
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });

    it("מסנן פוסטים לפי קטגוריה", async () => {
      const category = "javascript";
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: [mockPost],
          error: null,
        });

      const request = new NextRequest(
        `http://localhost:3000/api/forum?category=${category}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(mockSupabase.from().select().order().eq).toHaveBeenCalledWith(
        "category",
        category
      );
      expect(response.status).toBe(200);
      expect(data).toEqual([mockPost]);
    });

    it("מסנן פוסטים לפי תגית", async () => {
      const tag = "react";
      mockSupabase
        .from()
        .select()
        .order()
        .contains.mockResolvedValueOnce({
          data: [mockPost],
          error: null,
        });

      const request = new NextRequest(
        `http://localhost:3000/api/forum?tag=${tag}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(
        mockSupabase.from().select().order().contains
      ).toHaveBeenCalledWith("tags", [tag]);
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
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-post-1", ...newPost },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-post-1");
      expect(data).toMatchObject(newPost);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "חסרים שדות חובה",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה ביצירת הפוסט", async () => {
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

      const request = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });
});
