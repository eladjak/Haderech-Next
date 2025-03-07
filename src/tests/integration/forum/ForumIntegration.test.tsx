import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreatePost } from "@/components/forum/CreatePost";
import { Forum } from "@/components/forum/Forum";
import { ForumComment } from "@/components/forum/ForumComment";
import { ForumFilters } from "@/components/forum/ForumFilters";
import { ForumPost } from "@/components/forum/ForumPost";
import { ForumStats } from "@/components/forum/ForumStats";
import type { Author, ForumCategory, ForumPost as ForumPostType, ForumStats as ForumStatsType, ForumTag,
import type {
import type {

 Author, ForumCategory, ForumPost as ForumPostType, ForumStats as ForumStatsType,










/**
 * @file ForumIntegration.test.tsx
 * @description Integration tests for forum components
 */










  Author,
  ForumCategory,
  ForumPost as ForumPostType,
  ForumStats as ForumStatsType,
  ForumTag} from "@/types/forum";

// Mock useToast
const mockToast = vi.fn;
vi.mock("@/components/ui/use-toast",  => ({
  useToast:  => ({
    toast: mockToast})}));

// Mock useRouter
const mockRouter = {
  refresh: vi.fn,
  push: vi.fn()};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Forum Integration Tests", () => {
  const mockAuthor: Author = {
    id: "1",
    name: "משתמש לדוגמה",
    image: "/path/to/image.jpg",
    avatar_url: undefined,
    role: "user",
    username: "user1",
    full_name: "משתמש לדוגמה",
    email: "test@example.com",
    points: 100,
    level: 1,
    badges: [],
    achievements: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bio: undefined,
    last_seen: undefined,
    posts_count: 0,
    likes_received: 0};

  const mockCategory: ForumCategory = {
    id: "1",
    name: "קטגוריה לדוגמה",
    description: "תיאור הקטגוריה",
    slug: "test-category",
    order: 1,
    icon: "test-icon",
    color: "blue",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()};

  const mockTag: ForumTag = {
    id: "1",
    name: "תגית לדוגמה",
    description: "תיאור התגית",
    slug: "test-tag",
    color: "blue",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()};

  const mockPost: ForumPostType = {
    id: "1",
    title: "פוסט לדוגמה",
    content: "תוכן הפוסט לדוגמה",
    author_id: "1",
    category_id: "1",
    pinned: false,
    solved: false,
    likes: 10,
    views: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: mockAuthor,
    category: mockCategory,
    tags: [mockTag],
    comments: [],
    comments_count: 0,
    last_activity: new Date().toISOString()};

  const mockStats: ForumStatsType = {
    total_posts: 100,
    total_comments: 500,
    total_views: 1000,
    total_likes: 250,
    active_users: 50,
    posts_today: 10,
    trending_tags: [
      {
        tag: mockTag,
        count: 5},
    ],
    top_contributors: [
      {
        ...mockAuthor,
        posts_count: 10,
        likes_received: 20},
    ],
    total_users: 1,
    total_solved: 0,
    popular_tags: [
      {
        tag: mockTag,
        count: 1},
    ]};

  it("מציג את כל רכיבי הפורום בצורה תקינה", () => {
    render(
      <Forum posts={[mockPost]} stats={mockStats} onFilter={() => undefined} />
    );

    // בדיקת הצגת הפוסט
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();

    // בדיקת הצגת הסטטיסטיקות
    expect(screen.getByText("משתמשים פעילים")).toBeInTheDocument();
    expect(screen.getByText("סה״כ פוסטים")).toBeInTheDocument();
    expect(screen.getByText("צפיות")).toBeInTheDocument();
    expect(screen.getByText("לייקים")).toBeInTheDocument();

    // בדיקת הצגת הפילטרים
    expect(screen.getByPlaceholderText("חיפוש בפורום...")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "מיין תוצאות" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "סנן לפי סטטוס" })
    ).toBeInTheDocument();
  });

  it("מאפשר סינון פוסטים", async () => {
    const mockOnFilter = vi.fn();
    render(
      <Forum posts={[mockPost]} stats={mockStats} onFilter={mockOnFilter} />
    );

    // חיפוש
    const searchInput = screen.getByPlaceholderText("חיפוש בפורום...");
    await userEvent.type(searchInput, "javascript");
    expect(mockOnFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "javascript"}); );

    // מיון
    const sortSelect = screen.getByRole("combobox", { name: "מיין תוצאות" });
    await userEvent.selectOptions(sortSelect, "popular");
    expect(mockOnFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "popular"}); );
  });

  it("מאפשר יצירת פוסט חדש", async () => {
    render(<CreatePost />);

    // מילוי טופס
    const titleInput = screen.getByPlaceholderText("כותרת הפוסט");
    const contentInput = screen.getByPlaceholderText("תוכן הפוסט");
    const submitButton = screen.getByRole("button", { name: "פרסם פוסט" });

    await userEvent.type(titleInput, "פוסט חדש");
    await userEvent.type(contentInput, "תוכן הפוסט החדש");
    await userEvent.click(submitButton);

    // בדיקה שהטוסט הוצג
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "הפוסט נוצר בהצלחה"}); );
  });

  it("מאפשר אינטראקציה עם פוסט", async () => {
    render(<ForumPost post={mockPost} />);

    // לחיצה על לייק
    const likeButton = screen.getByRole("button", { name: /לייקים/ });
    await userEvent.click(likeButton);

    // לחיצה על תגובות
    const commentsButton = screen.getByRole("button", { name: /תגובות/ });
    await userEvent.click(commentsButton);

    // בדיקת הצגת התגובות
    expect(
      screen.getByText(`תגובות (${mockPost.comments?.length || 0})`)
    ).toBeInTheDocument();
  });

  it("מציג סטטיסטיקות מעודכנות", () => {
    render(<ForumStats stats={mockStats} />);

    // בדיקת הצגת מספרים
    expect(screen.getByText("100")).toBeInTheDocument(); // total_posts
    expect(screen.getByText("500")).toBeInTheDocument(); // total_comments
    expect(screen.getByText("1000")).toBeInTheDocument(); // total_views
    expect(screen.getByText("250")).toBeInTheDocument(); // total_likes

    // בדיקת הצגת תגיות פופולריות
    expect(screen.getByText("javascript")).toBeInTheDocument();

    // בדיקת הצגת תורמים מובילים
    expect(screen.getByText(mockAuthor.name)).toBeInTheDocument();
  });

  it("renders forum with posts and stats", () => {
    render(<Forum posts={[mockPost]} stats={mockStats} />);
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
  });

  it("displays forum statistics", () => {
    render(<Forum posts={[mockPost]} stats={mockStats} />);
    expect(screen.getByText(/סה"כ פוסטים/i)).toBeInTheDocument();
    expect(screen.getByText(/סה"כ תגובות/i)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Forum posts={[]} stats={mockStats} isLoading={true} />);
    expect(screen.getByTestId("forum-loading")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const errorMessage = "שגיאה בטעינת הפורום";
    render(<Forum posts={[]} stats={mockStats} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
