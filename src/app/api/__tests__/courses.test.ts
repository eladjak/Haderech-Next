/**
 * @file courses.test.ts
 * @description Tests for courses API endpoints
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../courses/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Courses API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockCourse = {
    id: "test-course-id",
    title: "Test Course",
    description: "Test Description",
    author_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockCourse,
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

  vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    } as any);
  });

  describe("GET /api/courses", () => {
    it("מחזיר את כל הקורסים", async () => {
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
          data: [mockCourse],
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/courses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockCourse]);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת הקורסים", async () => {
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest("http://localhost:3000/api/courses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("POST /api/courses", () => {
    const newCourse = {
      title: "קורס חדש",
      description: "תיאור הקורס",
      image_url: "https://example.com/image.jpg",
      status: "draft" as const,
      level: "beginner" as const,
      duration: 60,
      tags: ["javascript", "react"],
    };

    it("יוצר קורס חדש בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-course-1", ...newCourse },
          error: null,
        });

      const request = new NextRequest("http://localhost:3000/api/courses", {
        method: "POST",
        body: JSON.stringify(newCourse),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-course-1");
      expect(data).toMatchObject(newCourse);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/courses", {
        method: "POST",
        body: JSON.stringify(newCourse),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest("http://localhost:3000/api/courses", {
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

    it("מחזיר שגיאה כאשר יש בעיה ביצירת הקורס", async () => {
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

      const request = new NextRequest("http://localhost:3000/api/courses", {
        method: "POST",
        body: JSON.stringify(newCourse),
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
