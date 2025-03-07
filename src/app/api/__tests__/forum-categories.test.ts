import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "@/lib/utils"

import { beforeEach, describe, expect, it, vi } from "@/lib/utils";
import { NextRequest } from "@/lib/utils"
import { DELETE, GET, POST } from "@/lib/utils";


vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Categories API",  => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    username: "example_user",
    full_name: "משתמש לדוגמה",
    avatar_url: "/avatar1.jpg",
    image: "/avatar1.jpg",
    role: "admin", // נדרשת הרשאת מנהל ליצירה ומחיקה של קטגוריות
  }

  const mockCategory = {
    id: "test-category-id",
    name: "JavaScript",
    description: "דיונים בנושא JavaScript",
    icon: "code",
    color: "#f7df1e",
    created_at: new Date.toISOString,
    created_by: mockUser.id,
    order: 1,
    is_active: true};

  const mockSupabase = {
    from: vi.fn( => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockCategory,
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

  describe("GET /api/forum/categories", () => {
    it("מחזיר את כל הקטגוריות", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: [mockCategory],
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockCategory]);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת הקטגוריות", async () => {
      mockSupabase
        .from()
        .select()
        .order()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });
  });

  describe("POST /api/forum/categories", () => {
    const newCategory = {
      name: "TypeScript",
      description: "דיונים בנושא TypeScript",
      icon: "code",
      color: "#3178c6",
      order: 2,
      is_active: true};

    it("יוצר קטגוריה חדשה בהצלחה", async () => {
      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().insert().select.mockReturnThis();
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: "new-category-1", ...newCategory },
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "POST",
          body: JSON.stringify(newCategory)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-category-1");
      expect(data).toMatchObject(newCategory);
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "POST",
          body: JSON.stringify(newCategory)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאת הרשאה כאשר המשתמש אינו מנהל", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { ...mockUser, role: "user" }}},
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "POST",
          body: JSON.stringify(newCategory)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: "אין לך הרשאה ליצור קטגוריות"});
    });

    it("מחזיר שגיאה כאשר חסרים שדות חובה", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "POST",
          body: JSON.stringify({})}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "חסרים שדות חובה"});
    });

    it("מחזיר שגיאה כאשר כבר קיימת קטגוריה עם אותו שם", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: "existing-category" },
          error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "POST",
          body: JSON.stringify(newCategory)}
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "כבר קיימת קטגוריה עם שם זה"});
    });
  });

  describe("DELETE /api/forum/categories", () => {
    it("מוחק קטגוריה בהצלחה", async () => {
      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "DELETE",
          body: JSON.stringify({
            category_id: "test-category-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "הקטגוריה נמחקה בהצלחה"});
    });

    it("מחזיר שגיאת הזדהות כאשר אין משתמש מחובר", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "DELETE",
          body: JSON.stringify({
            category_id: "test-category-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: "נדרשת הזדהות"});
    });

    it("מחזיר שגיאת הרשאה כאשר המשתמש אינו מנהל", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { ...mockUser, role: "user" }}},
        error: null});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "DELETE",
          body: JSON.stringify({
            category_id: "test-category-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: "אין לך הרשאה למחוק קטגוריות"});
    });

    it("מחזיר שגיאה כאשר חסר מזהה קטגוריה", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "DELETE",
          body: JSON.stringify({})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "נדרש מזהה קטגוריה"});
    });

    it("מחזיר שגיאה כאשר הקטגוריה לא נמצאה", async () => {
      mockSupabase
        .from()
        .delete()
        .eq.mockResolvedValueOnce({
          data: null,
          error: { message: "הקטגוריה לא נמצאה" }});

      const request = new NextRequest(
        "http://localhost:3000/api/forum/categories",
        {
          method: "DELETE",
          body: JSON.stringify({
            category_id: "non-existent-id"})}
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "הקטגוריה לא נמצאה"});
    });
  });
});
