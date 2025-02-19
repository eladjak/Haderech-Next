/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH } from "../courses/[id]/route";

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Course API Routes", () => {
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
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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

  describe("GET /api/courses/[id]", () => {
    it("מחזיר קורס כאשר הוא נמצא", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: mockCourse,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id"
      );
      const response = await GET(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourse);
    });

    it("מחזיר 404 כאשר הקורס לא נמצא", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/non-existent"
      );
      const response = await GET(request, {
        params: { id: "non-existent" },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הקורס לא נמצא",
      });
    });

    it("מחזיר שגיאת שרת כאשר יש בעיה במסד הנתונים", async () => {
      mockSupabase
        .from()
        .select()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id"
      );
      const response = await GET(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("PATCH /api/courses/[id]", () => {
    const updates = {
      title: "Updated Title",
      description: "Updated Description",
    };

    it("מעדכן קורס בהצלחה", async () => {
      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().update().select.mockReturnThis();
      mockSupabase
        .from()
        .update()
        .select()
        .single.mockResolvedValueOnce({
          data: { ...mockCourse, ...updates },
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );

      const response = await PATCH(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject(updates);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );

      const response = await PATCH(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הרשאת מנהל",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה בעדכון הקורס", async () => {
      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().update().select.mockReturnThis();
      mockSupabase
        .from()
        .update()
        .select()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );

      const response = await PATCH(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("DELETE /api/courses/[id]", () => {
    it("מוחק קורס בהצלחה", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "הקורס נמחק בהצלחה",
      });
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הרשאת מנהל",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה במחיקת הקורס", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: { message: "שגיאת מסד נתונים" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: "test-course-id" },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });
});
