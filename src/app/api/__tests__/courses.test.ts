/**
 * @file courses.test.ts
 * @description Tests for courses API endpoints
 */

import { GET, POST } from "../courses/route";

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
  })),
  auth: {
    getSession: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
  rpc: jest.fn(),
};

// Mock createServerClient
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

// Mock cookies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "mock-cookie" })),
    getAll: jest.fn(() => []),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("Courses API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/courses", () => {
    it("should return courses list", async () => {
      const mockCourses = [
        {
          id: "1",
          title: "Test Course",
          description: "Test Description",
        },
      ];

      mockSupabase
        .from()
        .select.mockResolvedValueOnce({ data: mockCourses, error: null });

      const request = new Request("http://localhost:3000/api/courses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it("should handle search query", async () => {
      const mockCourses = [
        {
          id: "1",
          title: "Test Course",
          description: "Test Description",
        },
      ];

      mockSupabase
        .from()
        .select.mockResolvedValueOnce({ data: mockCourses, error: null });

      const request = new Request(
        "http://localhost:3000/api/courses?search=test",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it("should handle category filter", async () => {
      const mockCourses = [
        {
          id: "1",
          title: "Test Course",
          description: "Test Description",
          category: "test",
        },
      ];

      mockSupabase
        .from()
        .select.mockResolvedValueOnce({ data: mockCourses, error: null });

      const request = new Request(
        "http://localhost:3000/api/courses?category=test",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it("should handle level filter", async () => {
      const mockCourses = [
        {
          id: "1",
          title: "Test Course",
          description: "Test Description",
          level: "beginner",
        },
      ];

      mockSupabase
        .from()
        .select.mockResolvedValueOnce({ data: mockCourses, error: null });

      const request = new Request(
        "http://localhost:3000/api/courses?level=beginner",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it("should handle instructor filter", async () => {
      const mockCourses = [
        {
          id: "1",
          title: "Test Course",
          description: "Test Description",
          instructor_id: "test-instructor",
        },
      ];

      mockSupabase
        .from()
        .select.mockResolvedValueOnce({ data: mockCourses, error: null });

      const request = new Request(
        "http://localhost:3000/api/courses?instructor=test-instructor",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it("should handle database error", async () => {
      mockSupabase.from().select.mockResolvedValueOnce({
        data: null,
        error: new Error("Database error"),
      });

      const request = new Request("http://localhost:3000/api/courses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch courses" });
    });
  });

  describe("POST /api/courses", () => {
    it("should create a new course for authenticated instructor", async () => {
      const mockSession = {
        user: { id: "test-user" },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      });

      const mockCourse = {
        id: "1",
        title: "New Course",
        description: "Course Description",
      };

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: mockCourse,
        error: null,
      });

      const request = new Request("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockCourse),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourse);
    });

    it("should reject unauthenticated requests", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      const request = new Request("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should handle database error", async () => {
      const mockSession = {
        user: { id: "test-user" },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      });
      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: new Error("Database error"),
      });

      const request = new Request("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to create course" });
    });
  });
});
