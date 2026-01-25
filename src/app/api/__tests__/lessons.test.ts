import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/ssr";
import { DELETE, GET as GET_LESSON, PATCH as PATCH_LESSON } from "../[id]/lessons/route";
import { GET, PATCH, POST } from "../courses/[id]/lessons/route";

/**
 * @file lessons.test.ts
 * @description Tests for course lessons API endpoints
 */






import {
  DELETE,
  GET as GET_LESSON,
  PATCH as PATCH_LESSON,
} from "../courses/[id]/lessons/[lessonId]/route";


vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

describe("Lessons API", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockCourse = {
    id: "test-course-id",
    title: "Test Course",
    instructor_id: mockUser.id,
  };

  const mockLesson = {
    id: "test-lesson-id",
    title: "Test Lesson",
    content: "Test Content",
    course_id: mockCourse.id,
    order: 1,
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
        data: mockLesson,
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

  vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);
  vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    } as any);
  });

  describe("GET /lessons", () => {
    it("מחזיר את כל השיעורים של הקורס", async () => {
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
          data: [mockLesson],
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons"
      );
      const response = await GET(request, {
        params: { id: mockCourse.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockLesson]);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת השיעורים", async () => {
      mockSupabase
        .from()
        .select()
        .order.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" },
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons"
      );
      const response = await GET(request, {
        params: { id: mockCourse.id },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });

  describe("GET /lesson", () => {
    it("מחזיר שיעור ספציפי", async () => {
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: mockLesson,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id"
      );
      const response = await GET_LESSON(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLesson);
    });

    it("מחזיר 404 כאשר השיעור לא נמצא", async () => {
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/non-existent"
      );
      const response = await GET_LESSON(request, {
        params: { id: mockCourse.id, lessonId: "non-existent" },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "השיעור לא נמצא",
      });
    });
  });

  describe("POST", () => {
    const newLesson = {
      title: "New Lesson",
      description: "New Description",
      content: "New Content",
      order: 1,
      status: "draft" as const,
    };

    it("יוצר שיעור חדש בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-lesson-1", ...newLesson },
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons",
        {
          method: "POST",
          body: JSON.stringify(newLesson),
        }
      );

      const response = await POST(request, {
        params: { id: mockCourse.id },
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject(newLesson);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons",
        {
          method: "POST",
          body: JSON.stringify(newLesson),
        }
      );

      const response = await POST(request, {
        params: { id: mockCourse.id },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });
  });

  describe("PATCH", () => {
    const updatedLesson = {
      title: "Updated Lesson",
      content: "Updated Content",
    };

    it("מעדכן שיעור בהצלחה", async () => {
      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().update().select.mockReturnThis();
      mockSupabase
        .from()
        .update()
        .select()
        .single.mockResolvedValueOnce({
          data: { ...mockLesson, ...updatedLesson },
          error: null,
        });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id",
        {
          method: "PATCH",
          body: JSON.stringify(updatedLesson),
        }
      );

      const response = await PATCH_LESSON(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject(updatedLesson);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id",
        {
          method: "PATCH",
          body: JSON.stringify(updatedLesson),
        }
      );

      const response = await PATCH_LESSON(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });
  });

  describe("DELETE", () => {
    it("מוחק שיעור בהצלחה", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "השיעור נמחק בהצלחה",
      });
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות",
      });
    });

    it("מחזיר שגיאה כאשר יש בעיה במחיקת השיעור", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: { message: "שגיאת מסד נתונים" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/courses/test-course-id/lessons/test-lesson-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: { id: mockCourse.id, lessonId: mockLesson.id },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים",
      });
    });
  });
});

const mockCompleteLessonForUser = async () => {
  await Promise.resolve(); // Add await to satisfy require-await
  return { success: true };
};
