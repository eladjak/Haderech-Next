import { cookies, headers } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "@/lib/utils";

import { beforeEach, describe, expect, it, vi, vitest } from "@/lib/utils";
import { NextRequest } from "@/lib/utils";
import { DELETE, POST } from "@/lib/utils";


/**
 * @file enrollment.test.ts
 * @description Tests for course enrollment API endpoints
 */

vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Enrollments API",  => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com"};

  const mockCourse = {
    id: "test-course-id",
    title: "Test Course"};

  const mockSupabase = {
    from: vi.fn( => ({
      select: vi.fn.mockReturnThis,
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: null,
        error: null}))})),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null})}};

  vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" })} as any);
  });

  describe("POST /api/enrollments", () => {
    it("נרשם לקורס בהצלחה", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: mockCourse,
        error: null});

      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: null,
        error: null});

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: { id: "enrollment-1" },
        error: null});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        message: "נרשמת לקורס בהצלחה"});
    });

    it("מחזיר שגיאה כאשר המשתמש כבר רשום לקורס", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: mockCourse,
        error: null});

      mockSupabase
        .from()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "enrollment-1" },
          error: null});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "אתה כבר רשום לקורס זה"});
    });

    it("מחזיר שגיאה כאשר הקורס לא נמצא", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: null,
        error: null});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: "non-existent" })});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הקורס לא נמצא"});
    });

    it("מחזיר שגיאה כאשר יש בעיה במסד הנתונים", async () => {
      mockSupabase.from().select().single.mockResolvedValueOnce({
        data: mockCourse,
        error: null});

      mockSupabase
        .from()
        .select()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116", message: "שגיאת מסד נתונים" }});

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: { message: "שגיאת מסד נתונים" }});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });
  });

  describe("DELETE /api/enrollments", () => {
    it("מבטל הרשמה לקורס בהצלחה", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: null});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "DELETE",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "ההרשמה בוטלה בהצלחה"});
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "DELETE",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאה כאשר יש בעיה בביטול ההרשמה", async () => {
      mockSupabase.from().delete.mockResolvedValueOnce({
        data: null,
        error: { message: "שגיאת מסד נתונים" }});

      const request = new NextRequest("http://localhost:3000/api/enrollments", {
        method: "DELETE",
        body: JSON.stringify({ course_id: mockCourse.id })});

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });
  });
});

const mockEnrollUser = async () => {
  await Promise.resolve(); // Add await to satisfy require-await
  return { success: true }
}
