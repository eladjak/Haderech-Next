import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../forum/views/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Views API", () => {
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

  const mockView = {
    id: "test-view-id",
    post_id: "test-post-id",
    user_id: mockUser.id,
    created_at: new Date().toISOString(),
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0",
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockView,
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

  describe("POST /api/forum/views", () => {
    const newView = {
      post_id: "test-post-id",
      ip_address: "127.0.0.1",
      user_agent: "Mozilla/5.0",
    };

    it("יוצר צפייה חדשה בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-view-1", ...newView },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/views", {
        method: "POST",
        body: JSON.stringify(newView),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-view-1");
      expect(data).toMatchObject(newView);
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum/views", {
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

    it("מחזיר שגיאה כאשר הפוסט לא נמצא", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "הפוסט לא נמצא" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/views", {
        method: "POST",
        body: JSON.stringify(newView),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הפוסט לא נמצא",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה ביצירת הצפייה", async () => {
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

      const request = new NextRequest("http://localhost:3000/api/forum/views", {
        method: "POST",
        body: JSON.stringify(newView),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });

    it("מוסיף מזהה משתמש כאשר המשתמש מחובר", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: {
            id: "new-view-1",
            ...newView,
            user_id: mockUser.id,
          },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/views", {
        method: "POST",
        body: JSON.stringify(newView),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("user_id", mockUser.id);
    });

    it("יוצר צפייה חדשה גם כאשר המשתמש לא מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-view-1", ...newView },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/views", {
        method: "POST",
        body: JSON.stringify(newView),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).not.toHaveProperty("user_id");
    });
  });
});
