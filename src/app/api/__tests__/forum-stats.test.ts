import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "@/lib/utils";

import { beforeEach, describe, expect, it, vi } from "@/lib/utils";
import { NextRequest } from "@/lib/utils";
import { GET } from "@/lib/utils";


vi.mock("next/headers");
vi.mock("@supabase/auth-helpers-nextjs");

describe("Forum Stats API",  => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "משתמש לדוגמה",
    username: "example_user",
    full_name: "משתמש לדוגמה",
    avatar_url: "/avatar1.jpg",
    image: "/avatar1.jpg",
    role: "user"};

  const mockStats = {
    total_posts: 100,
    total_comments: 500,
    total_views: 1000,
    total_likes: 750,
    active_users: 50,
    posts_today: 10,
    trending_tags: [
      {
        tag: {
          id: "1",
          name: "JavaScript",
          description: "שפת תכנות פופולרית",
          color: "#f7df1e"},
        count: 15},
      {
        tag: {
          id: "2",
          name: "React",
          description: "ספריית UI פופולרית",
          color: "#61dafb"},
        count: 10},
    ],
    top_contributors: [
      {
        author: mockUser,
        posts_count: 25,
        likes_received: 100},
      {
        author: { ...mockUser, id: "2", name: "משתמש 2", username: "user2" },
        posts_count: 20,
        likes_received: 80},
    ]};

  const mockSupabase = {
    from: vi.fn( => ({
      select: vi.fn.mockReturnThis,
      count: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => ({
        data: mockStats,
        error: null}))}))};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "test-token" })} as any);
    vi.mocked(createRouteHandlerClient).mockReturnValue(mockSupabase as any);
  });

  describe("GET /api/forum/stats", () => {
    it("מחזיר את כל הסטטיסטיקות", async () => {
      // מדמה את התוצאות של כל השאילתות
      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 100 }],
          error: null}); // posts count

      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 500 }],
          error: null}); // comments count

      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 1000 }],
          error: null}); // views count

      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 750 }],
          error: null}); // likes count

      mockSupabase
        .from()
        .select()
        .gte()
        .count.mockResolvedValueOnce({
          data: [{ count: 50 }],
          error: null}); // active users

      mockSupabase
        .from()
        .select()
        .gte()
        .count.mockResolvedValueOnce({
          data: [{ count: 10 }],
          error: null}); // today posts

      mockSupabase.from().select().limit.mockResolvedValueOnce({
        data: mockStats.trending_tags,
        error: null}); // trending tags

      mockSupabase.from().select().limit.mockResolvedValueOnce({
        data: mockStats.top_contributors,
        error: null}); // top contributors

      const request = new NextRequest("http://localhost:3000/api/forum/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStats);
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת מספר הפוסטים", async () => {
      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }});

      const request = new NextRequest("http://localhost:3000/api/forum/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת מספר התגובות", async () => {
      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 100 }],
          error: null}); // posts count

      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }}); // comments count

      const request = new NextRequest("http://localhost:3000/api/forum/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת התגיות", async () => {
      // מדמה הצלחה בכל השאילתות הקודמות
      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 100 }],
          error: null}) // posts count
        .mockResolvedValueOnce({
          data: [{ count: 500 }],
          error: null}) // comments count
        .mockResolvedValueOnce({
          data: [{ count: 1000 }],
          error: null}) // views count
        .mockResolvedValueOnce({
          data: [{ count: 750 }],
          error: null}) // likes count
        .mockResolvedValueOnce({
          data: [{ count: 50 }],
          error: null}) // active users
        .mockResolvedValueOnce({
          data: [{ count: 10 }],
          error: null}); // today posts

      mockSupabase
        .from()
        .select()
        .limit.mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }}); // tags error

      const request = new NextRequest("http://localhost:3000/api/forum/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });

    it("מחזיר שגיאה כאשר יש בעיה בשליפת התורמים", async () => {
      // מדמה הצלחה בכל השאילתות הקודמות
      mockSupabase
        .from()
        .select()
        .count.mockResolvedValueOnce({
          data: [{ count: 100 }],
          error: null}) // posts count
        .mockResolvedValueOnce({
          data: [{ count: 500 }],
          error: null}) // comments count
        .mockResolvedValueOnce({
          data: [{ count: 1000 }],
          error: null}) // views count
        .mockResolvedValueOnce({
          data: [{ count: 750 }],
          error: null}) // likes count
        .mockResolvedValueOnce({
          data: [{ count: 50 }],
          error: null}) // active users
        .mockResolvedValueOnce({
          data: [{ count: 10 }],
          error: null}); // today posts

      mockSupabase
        .from()
        .select()
        .limit.mockResolvedValueOnce({
          data: mockStats.trending_tags,
          error: null}) // tags
        .mockResolvedValueOnce({
          data: null,
          error: { message: "שגיאת מסד נתונים" }}); // contributors error

      const request = new NextRequest("http://localhost:3000/api/forum/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "שגיאת מסד נתונים"});
    });
  });
});
