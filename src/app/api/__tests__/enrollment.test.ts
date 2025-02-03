/**
 * @file enrollment.test.ts
 * @description Tests for course enrollment API endpoints
 */

import { createMocks } from "node-mocks-http";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { POST, DELETE } from "../courses/[id]/enroll/route";

jest.mock("next/headers");
jest.mock("@supabase/ssr");

describe("Enrollment API Routes", () => {
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

  describe("POST /api/courses/[id]/enroll", () => {
    it("should enroll user in course", async () => {
      const mockSession = {
        user: { id: "user-id" },
      };

      const mockCourse = {
        id: "1",
        price: 100,
      };

      const mockEnrollment = {
        id: "1",
        user_id: "user-id",
        course_id: "1",
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValueOnce({ data: mockCourse });
      mockSupabase.single.mockResolvedValueOnce({ data: null }); // No existing enrollment
      mockSupabase.insert.mockResolvedValueOnce({ data: mockEnrollment });

      const { req } = createMocks({
        method: "POST",
        body: {
          payment_method_id: "pm_123",
          coupon_code: "WELCOME10",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "נרשמת בהצלחה לקורס",
        enrollment: mockEnrollment,
      });
    });

    it("should return 401 if user not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const { req } = createMocks({
        method: "POST",
        body: {
          payment_method_id: "pm_123",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "יש להתחבר כדי להירשם לקורס" });
    });

    it("should return 404 if course not found", async () => {
      const mockSession = {
        user: { id: "user-id" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValue({ data: null });

      const { req } = createMocks({
        method: "POST",
        body: {
          payment_method_id: "pm_123",
        },
      });

      const response = await POST(req, { params: { id: "999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "קורס לא נמצא" });
    });

    it("should return 400 if already enrolled", async () => {
      const mockSession = {
        user: { id: "user-id" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "1", price: 100 },
      });
      mockSupabase.single.mockResolvedValueOnce({ data: { id: "1" } }); // Existing enrollment

      const { req } = createMocks({
        method: "POST",
        body: {
          payment_method_id: "pm_123",
        },
      });

      const response = await POST(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "כבר נרשמת לקורס זה" });
    });
  });

  describe("DELETE /api/courses/[id]/enroll", () => {
    it("should unenroll user from course", async () => {
      const mockSession = {
        user: { id: "user-id" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSupabase.delete.mockResolvedValue({ data: null });

      const { req } = createMocks({
        method: "DELETE",
      });

      const response = await DELETE(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: "Unenrolled successfully" });
    });

    it("should return 401 if user not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const { req } = createMocks({
        method: "DELETE",
      });

      const response = await DELETE(req, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Authentication required" });
    });
  });
});
