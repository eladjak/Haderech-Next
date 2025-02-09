/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { GET, PATCH, DELETE } from "../courses/[id]/route";

jest.mock("next/headers");
jest.mock("@supabase/ssr");

describe("Course API", () => {
  const mockCourse = {
    id: "1",
    title: "Test Course",
    description: "Test Description",
    instructor_id: "1",
    price: 100,
    duration: 120,
    level: "beginner",
    total_students: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "mock-cookie" }),
      set: jest.fn(),
      delete: jest.fn(),
    });
  });

  describe("GET /api/courses/[id]", () => {
    it("should return course if found", async () => {
      mockSupabase.single.mockResolvedValue({ data: mockCourse, error: null });

      const response = await GET({} as Request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourse);
    });

    it("should return 404 if course not found", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const response = await GET({} as Request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Course not found" });
    });
  });

  describe("PATCH /api/courses/[id]", () => {
    it("should update course if authorized", async () => {
      const updates = { title: "Updated Title" };
      mockSupabase.single.mockResolvedValue({
        data: { ...mockCourse, ...updates },
        error: null,
      });

      const response = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify(updates),
        }),
        { params: { id: "1" } },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...mockCourse, ...updates });
    });
  });

  describe("DELETE /api/courses/[id]", () => {
    it("should delete course if authorized", async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const response = await DELETE({} as Request, { params: { id: "1" } });

      expect(response.status).toBe(200);
    });
  });
});
