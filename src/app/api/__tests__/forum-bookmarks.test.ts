import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "@/lib/utils"

import { beforeEach, describe, expect, it, vi } from "@/lib/utils";
import { NextRequest } from "@/lib/utils"
import { DELETE, GET, POST } from "@/lib/utils";


vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Bookmarks API",  => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    username: "example_user",
    full_name: "משתמש לדוגמה",
    avatar_url: "/avatar1.jpg",
    image: "/avatar1.jpg",
    role: "user"};

  const mockBookmark = {
    id: "test-bookmark-id",
    post_id: "test-post-id",
    user_id: mockUser.id,
    created_at: new Date.toISOString};

  const mockSupabase = {
    from: vi.fn( => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockBookmark,
        error: null}))})),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null})}};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" })} as any);
    vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);
  });

  describe("GET /api/forum/bookmarks", () => {
    it("מחזיר את כל הסימניות של המשתמש", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: [mockBookmark],
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockBookmark]);
      expect(mockSupabase.from().select().order().eq).toHaveBeenCalledWith(
        "user_id",
        mockUser.id
      );
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת הסימניות", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });
  });

  describe("POST /api/forum/bookmarks", () => {
    const newBookmark = {
      post_id: "test-post-id"};

    it("יוצר סימניה חדשה בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-bookmark-1", ...newBookmark },
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "POST",
          body: JSON.stringify(newBookmark)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-bookmark-1");
      expect(data).toMatchObject(newBookmark);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "POST",
          body: JSON.stringify(newBookmark)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאה כאשר הפוסט לא נמצא", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: "הפוסט לא נמצא" }});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "POST",
          body: JSON.stringify(newBookmark)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הפוסט לא נמצא"});
    });

    it("מחזיר שגיאה כאשר כבר קיימת סימניה", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "test-post-id" },
          error: null})
        .mockResolvedValueOnce({
          data: { id: "existing-bookmark" },
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "POST",
          body: JSON.stringify(newBookmark)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "כבר סימנת פוסט זה"});
    });
  });

  describe("DELETE /api/forum/bookmarks", () => {
    it("מוחק סימניה בהצלחה", async () => {
      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "DELETE",
          body: JSON.stringify({
            post_id: "test-post-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "הסימניה הוסרה בהצלחה"});
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "DELETE",
          body: JSON.stringify({
            post_id: "test-post-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאה כאשר חסר מזהה פוסט", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "DELETE",
          body: JSON.stringify({})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "נדרש מזהה פוסט"});
    });

    it("מחזיר שגיאה כאשר הסימניה לא נמצאה", async () => {
      mockSupabase
        .from()
        .delete()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "הסימניה לא נמצאה" }});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/bookmarks",
        {
          method: "DELETE",
          body: JSON.stringify({
            post_id: "test-post-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הסימניה לא נמצאה"});
    });
  });
});
