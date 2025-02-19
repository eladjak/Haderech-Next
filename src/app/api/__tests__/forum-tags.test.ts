import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, POST } from "../forum/tags/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Tags API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    username: "example_user",
    full_name: "משתמש לדוגמה",
    avatar_url: "/avatar1.jpg",
    image: "/avatar1.jpg",
    role: "admin", // נדרשת הרשאת מנהל ליצירה ומחיקה של תגיות
  };

  const mockTag = {
    id: "test-tag-id",
    name: "JavaScript",
    description: "שפת תכנות פופולרית",
    color: "#f7df1e",
    created_at: new Date().toISOString(),
    created_by: mockUser.id,
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockTag,
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

  describe("GET /api/forum/tags", () => {
    it("מחזיר את כל התגיות", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: [mockTag],
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/tags");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockTag]);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת התגיות", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/tags");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("POST /api/forum/tags", () => {
    const newTag = {
      name: "TypeScript",
      description: "שפת תכנות מבוססת JavaScript עם תמיכה בטיפוסים",
      color: "#3178c6",
    };

    it("יוצר תגית חדשה בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-tag-1", ...newTag },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "POST",
        body: JSON.stringify(newTag),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-tag-1");
      expect(data).toMatchObject(newTag);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "POST",
        body: JSON.stringify(newTag),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאת הרשאה כאשר המשתמש אינו מנהל", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { ...mockUser, role: "user" },
          },
        },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "POST",
        body: JSON.stringify(newTag),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: "אין לך הרשאה ליצור תגיות",
      });
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
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

    it("מחזיר שגיאה כאשר כבר קיימת תגית עם אותו שם", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "existing-tag" },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "POST",
        body: JSON.stringify(newTag),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "כבר קיימת תגית עם שם זה",
      });
    });
  });

  describe("DELETE /api/forum/tags", () => {
    it("מוחק תגית בהצלחה", async () => {
      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "DELETE",
        body: JSON.stringify({
          tag_id: "test-tag-id",
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "התגית נמחקה בהצלחה",
      });
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "DELETE",
        body: JSON.stringify({
          tag_id: "test-tag-id",
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאת הרשאה כאשר המשתמש אינו מנהל", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { ...mockUser, role: "user" },
          },
        },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "DELETE",
        body: JSON.stringify({
          tag_id: "test-tag-id",
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: "אין לך הרשאה למחוק תגיות",
      });
    });

    it("מחזיר שגיאה כאשר חסר מזהה תגית", async () => {
      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "נדרש מזהה תגית",
      });
    });

    it("מחזיר שגיאה כאשר התגית לא נמצאה", async () => {
      mockSupabase
        .from()
        .delete()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "התגית לא נמצאה" },
        });

      const request = new NextRequest("http://localhost:3000/api/forum/tags", {
        method: "DELETE",
        body: JSON.stringify({
          tag_id: "non-existent-id",
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "התגית לא נמצאה",
      });
    });
  });
});
