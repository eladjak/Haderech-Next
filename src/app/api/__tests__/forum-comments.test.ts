import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "../forum/comments/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Comments API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockComment = {
    id: "test-comment-id",
    post_id: "test-post-id",
    content: "תוכן התגובה",
    author_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockComment,
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

  describe("POST /api/forum/comments", () => {
    const newComment = {
      post_id: "test-post-id",
      content: "תוכן התגובה",
      parent_id: null,
    };

    it("יוצר תגובה חדשה בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-comment-1", ...newComment },
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "POST",
          body: JSON.stringify(newComment),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-comment-1");
      expect(data).toMatchObject(newComment);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "POST",
          body: JSON.stringify(newComment),
        }
      );

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

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "POST",
          body: JSON.stringify(newComment),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הפוסט לא נמצא",
      });
    });

    it("מחזיר שגיאה כאשר תגובת האב לא נמצאה", async () => {
      const commentWithParent = {
        ...newComment,
        parent_id: "non-existent-id",
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
          error: { message: "תגובת האב לא נמצאה" },
        });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "POST",
          body: JSON.stringify(commentWithParent),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "תגובת האב לא נמצאה",
      });
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("DELETE /api/forum/comments", () => {
    it("מוחק תגובה בהצלחה", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "test-comment-id", author_id: mockUser.id },
          error: null,
        });

      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "DELETE",
          body: JSON.stringify({ comment_id: "test-comment-id" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "התגובה נמחקה בהצלחה",
      });
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "DELETE",
          body: JSON.stringify({ comment_id: "test-comment-id" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר התגובה לא נמצאה", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "התגובה לא נמצאה" },
        });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "DELETE",
          body: JSON.stringify({ comment_id: "non-existent-id" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "התגובה לא נמצאה",
      });
    });

    it("מחזיר שגיאת הרשאה כאשר המשתמש מנסה למחוק תגובה של משתמש אחר", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "test-comment-id", author_id: "other-user-id" },
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/forum/comments",
        {
          method: "DELETE",
          body: JSON.stringify({ comment_id: "test-comment-id" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: "אין לך הרשאה למחוק תגובה זו",
      });
    });
  });
});
