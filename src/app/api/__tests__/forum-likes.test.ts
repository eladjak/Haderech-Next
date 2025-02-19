import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "../forum/likes/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Likes API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    username: "example_user",
    full_name: "משתמש לדוגמה",
    avatar_url: "/avatar1.jpg",
    image: "/avatar1.jpg",
    role: "user",
  };

  const mockLike = {
    id: "test-like-id",
    post_id: "test-post-id",
    comment_id: null,
    user_id: mockUser.id,
    created_at: new Date().toISOString(),
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockLike,
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

  describe("GET /api/forum/likes", () => {
    it("מחזיר את כל הלייקים של המשתמש", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: [mockLike],
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockLike]);
      expect(mockSupabase.from().select().order().eq).toHaveBeenCalledWith(
        "user_id",
        mockUser.id
      );
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/likes");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת הלייקים", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("POST /api/forum/likes", () => {
    const newLike = {
      post_id: "test-post-id",
      comment_id: null,
    };

    it("יוצר לייק חדש בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-like-1", ...newLike },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "POST",
        body: JSON.stringify(newLike),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-like-1");
      expect(data).toMatchObject(newLike);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "POST",
        body: JSON.stringify(newLike),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר הפוסט לא נמצא", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "הפוסט לא נמצא" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "POST",
        body: JSON.stringify(newLike),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הפוסט לא נמצא",
      });
    });

    it("מחזיר שגיאה כאשר התגובה לא נמצאה", async () => {
      const likeWithComment = {
        ...newLike,
        comment_id: "non-existent-id",
      };

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "test-post-id" },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: "התגובה לא נמצאה" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "POST",
        body: JSON.stringify(likeWithComment),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "התגובה לא נמצאה",
      });
    });

    it("מחזיר שגיאה כאשר כבר קיים לייק", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "test-post-id" },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: "existing-like" },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "POST",
        body: JSON.stringify(newLike),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "כבר נתת לייק לפריט זה",
      });
    });
  });

  describe("DELETE /api/forum/likes", () => {
    it("מוחק לייק בהצלחה", async () => {
      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "DELETE",
        body: JSON.stringify({
          post_id: "test-post-id",
          comment_id: null,
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "הלייק הוסר בהצלחה",
      });
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "DELETE",
        body: JSON.stringify({
          post_id: "test-post-id",
          comment_id: null,
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר חסר מזהה פוסט", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "נדרש מזהה פוסט",
      });
    });

    it("מחזיר שגיאה כאשר הלייק לא נמצא", async () => {
      mockSupabase
        .from()
        .delete()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "הלייק לא נמצא" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/likes", {
        method: "DELETE",
        body: JSON.stringify({
          post_id: "test-post-id",
          comment_id: null,
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הלייק לא נמצא",
      });
    });
  });
});
