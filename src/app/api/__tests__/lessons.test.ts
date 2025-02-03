/**
 * @file lessons.test.ts
 * @description Tests for course lessons API endpoints
 */

import { createMocks } from "node-mocks-http";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { GET, POST, PATCH } from "../courses/[id]/lessons/route";

jest.mock("next/headers");
jest.mock("@supabase/ssr");

describe("Lessons API Routes", () => {
  let mockCookies: jest.Mock;
  let mockCreateServerClient: jest.Mock;
  let mockSupabase: any;

  beforeEach(() => {
    mockCookies = cookies as jest.Mock;
    mockCreateServerClient = createServerClient as jest.Mock;
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      insert: jest.fn(),
    };

    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "mock-cookie" }),
    });
    mockCreateServerClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/courses/[id]/lessons", () => {
    it("should return lessons for a course", async () => {
      const mockLessons = [
        {
          id: "1",
          title: "Lesson 1",
          description: "Description 1",
        },
      ];

      mockSupabase.select.mockResolvedValue({ data: mockLessons });

      const { req } = createMocks({
        method: "GET",
      });

      const response = await GET(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLessons);
    });

    it("should handle errors", async () => {
      mockSupabase.select.mockRejectedValue(new Error("Database error"));

      const { req } = createMocks({
        method: "GET",
      });

      const response = await GET(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /api/courses/[id]/lessons", () => {
    it("should create lesson if user is instructor", async () => {
      const mockSession = {
        user: { id: "instructor-id" },
      };

      const mockCourse = {
        instructor_id: "instructor-id",
      };

      const mockLesson = {
        id: "1",
        title: "New Lesson",
        description: "New Description",
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValueOnce({ data: mockCourse });
      mockSupabase.insert.mockResolvedValueOnce({ data: mockLesson });

      const { req } = createMocks({
        method: "POST",
        body: {
          title: "New Lesson",
          description: "New Description",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockLesson);
    });

    it("should return 401 if user not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const { req } = createMocks({
        method: "POST",
        body: {
          title: "New Lesson",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 403 if user is not instructor", async () => {
      const mockSession = {
        user: { id: "other-user" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValue({
        data: { instructor_id: "instructor-id" },
      });

      const { req } = createMocks({
        method: "POST",
        body: {
          title: "New Lesson",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Unauthorized" });
    });
  });

  describe("PATCH /api/courses/[id]/lessons", () => {
    it("should update lesson order if user is instructor", async () => {
      const mockSession = {
        user: { id: "instructor-id" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValue({
        data: { instructor_id: "instructor-id" },
      });
      mockSupabase.update.mockResolvedValue({ data: null });

      const { req } = createMocks({
        method: "PATCH",
        body: {
          lessonOrder: ["1", "2", "3"],
        },
      });

      const response = await PATCH(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: "Lesson order updated successfully" });
    });

    it("should return 401 if user not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const { req } = createMocks({
        method: "PATCH",
        body: {
          lessonOrder: ["1", "2", "3"],
        },
      });

      const response = await PATCH(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 403 if user is not instructor", async () => {
      const mockSession = {
        user: { id: "other-user" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValue({
        data: { instructor_id: "instructor-id" },
      });

      const { req } = createMocks({
        method: "PATCH",
        body: {
          lessonOrder: ["1", "2", "3"],
        },
      });

      const response = await PATCH(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Unauthorized" });
    });
  });
});
