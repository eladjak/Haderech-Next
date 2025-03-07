import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "@/lib/utils";

import { beforeEach, describe, expect, it, vi } from "@/lib/utils";
import { NextRequest } from "@/lib/utils";
import { mockSupabaseClient } from "@/lib/utils";
import { DELETE, GET as GET_ID, PATCH } from "@/lib/utils";
import { GET, POST } from "@/lib/utils";


/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Course API",  => {
  const mockSupabase = {
    from: vi.fn.mockImplementation( => ({
      select: vi.fn.mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            id: "test-id",
            title: "Test Course",
            description: "Test Description",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()}})
      ),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()})),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null})}};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRouteHandlerClient).mockImplementation(
      () => mockSupabase as any
    );
    vi.mocked(cookies).mockImplementation(
      () =>
        ({
          get: vi.fn().mockImplementation(() => ({ value: "test-cookie" }))}) as any
    );
  });

  describe("GET courses", () => {
    it("should return all courses", async () => {
      // Update the mock to return an array for the courses endpoint
      mockSupabase.from().select = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "test-id",
              title: "Test Course",
              description: "Test Description",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()},
          ],
          error: null})});

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(data).toHaveProperty("courses");
      expect(Array.isArray(data.courses)).toBe(true);
    });
  });

  describe("GET specific course", () => {
    it("should return course data", async () => {
      const response = await GET_ID({} as NextRequest, {
        params: { id: "test-id" }});
      const data = await response.json();

      expect(data).toHaveProperty("course");
      expect(data.course).toEqual(
        expect.objectContaining({
          id: "test-id",
          title: "Test Course",
          description: "Test Description"}); );
    });

    it("should handle missing course", async () => {
      mockSupabase.from().single = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: { message: "Not found", code: "PGRST116" }})
      );

      const response = await GET_ID({} as NextRequest, {
        params: { id: "missing-id" }});

      expect(response.status).toBe(404);
    });
  });

  describe("POST", () => {
    it("should create a new course", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            title: "New Course",
            description: "New Description"})} as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data).toHaveProperty("course");
      expect(data.course).toEqual(
        expect.objectContaining({
          title: "Test Course",
          description: "Test Description"}); );
    });
  });

  describe("PATCH", () => {
    it("should update a course", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            title: "Updated Course",
            description: "Updated Description"})} as unknown as NextRequest;

      const response = await PATCH(mockRequest, {
        params: { id: "test-id" }});
      const data = await response.json();

      expect(data).toHaveProperty("course");
      expect(data.course).toEqual(
        expect.objectContaining({
          id: "test-id",
          title: "Test Course",
          description: "Test Description"}); );
    });
  });

  describe("DELETE", () => {
    it("should delete a course", async () => {
      const response = await DELETE({} as NextRequest, {
        params: { id: "test-id" }});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("message");
      expect(typeof data.message).toBe("string");
    });
  });
});
