/**
 * @file ForumIntegration.test.tsx
 * @description Integration tests for forum components
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreatePost } from "@/components/forum/CreatePost";
import { Forum } from "@/components/forum/Forum";
import { ForumComment } from "@/components/forum/ForumComment";
import { ForumFilters } from "@/components/forum/ForumFilters";
import { ForumPost } from "@/components/forum/ForumPost";
import { ForumStats } from "@/components/forum/ForumStats";
import { Author, ExtendedForumPost, ForumTag } from "@/types/forum";
import type { ForumStats as ForumStatsType } from "@/types/forum";

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock useRouter
const mockRouter = {
  refresh: vi.fn(),
  push: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Forum", () => {
  const mockAuthor: Author = {
    id: "1",
    name: "Test User",
    full_name: "Test User",
    username: "testuser",
    email: "test@example.com",
    avatar_url: "/images/avatar.jpg",
    image: null,
    bio: "Test bio",
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    points: 100,
    level: 1,
    badges: ["test"],
    achievements: ["test"],
    is_verified: true,
    stats: {
      posts_count: 10,
      followers_count: 5,
      following_count: 3,
    },
  };

  const mockTag: ForumTag = {
    id: "1",
    name: "Test Tag",
    description: "Test Description",
    slug: "test-tag",
    color: "blue",
    posts_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockPosts: ExtendedForumPost[] = [
    {
      id: "1",
      title: "Test Post",
      content: "Test content",
      author_id: mockAuthor.id,
      author: mockAuthor,
      category: "test",
      tags: ["test"],
      pinned: false,
      solved: false,
      likes: 0,
      views: 0,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isLiked: false,
      isBookmarked: false,
      replies_count: 0,
      last_reply: {
        author: mockAuthor,
        content: "Test reply",
        created_at: new Date().toISOString(),
      },
      comments: [],
    },
  ];

  const mockStats = {
    total_posts: 100,
    total_comments: 500,
    total_views: 1000,
    total_likes: 300,
    active_users: 50,
    posts_today: 10,
    trending_tags: [
      {
        tag: mockTag,
        count: 15,
      },
    ],
    top_contributors: [
      {
        author: mockAuthor,
        posts_count: 20,
        likes_received: 50,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-post-1" }),
    });
  });

  it("מציג את הפוסטים כשיש פוסטים", () => {
    render(<Forum posts={mockPosts} stats={mockStats} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("מציג הודעה כשאין פוסטים", () => {
    render(<Forum posts={[]} stats={mockStats} />);
    expect(
      screen.getByText("עדיין אין פוסטים בפורום. היה הראשון ליצור פוסט!")
    ).toBeInTheDocument();
  });

  it("מציג מצב טעינה", () => {
    render(<Forum isLoading={true} stats={mockStats} />);
    const loadingStatus = screen.getByTestId("loading-status");
    expect(loadingStatus).toHaveTextContent("טוען פוסטים...");
  });

  it("מציג הודעת שגיאה כאשר יש בעיה בטעינה", () => {
    const errorMessage = "שגיאה בטעינת הפוסטים";
    render(<Forum error={errorMessage} stats={mockStats} />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  it("מספק תיאורים נגישים לכל הפוסטים", () => {
    render(<Forum posts={mockPosts} stats={mockStats} />);
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).toHaveAttribute("aria-labelledby");
    });
  });
});
