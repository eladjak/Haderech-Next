import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { CreatePost } from "@/components/forum/CreatePost";
import { Forum } from "@/components/forum/Forum";
import { ForumPost } from "@/components/forum/ForumPost";
import type {
  Author,
  ExtendedForumPost,
  ForumStats,
  ForumTag,
} from "@/types/forum";
import "@testing-library/jest-dom";
import "jest-axe/extend-expect";

// מוסיף מוקים לפונקציות החסרות
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Forum Accessibility Tests", () => {
  const mockAuthor: Author = {
    id: "1",
    name: "Test User",
    full_name: "Test User",
    username: "testuser",
    email: "test@example.com",
    avatar_url: null,
    image: "/images/avatar.jpg",
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

  const createMockPost = (id: string, title: string): ExtendedForumPost => ({
    id,
    title,
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
  });

  const mockPosts: ExtendedForumPost[] = [
    createMockPost("1", "First Post"),
    createMockPost("2", "Second Post"),
  ];

  const mockStats: ForumStats = {
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
      json: async () => ({ posts: [] }),
    });
  });

  test("Forum component should have no accessibility violations", async () => {
    const { container } = render(
      <Forum
        posts={mockPosts}
        stats={mockStats}
        onCreatePost={async () => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("ForumPost component should have no accessibility violations", async () => {
    const post = mockPosts[0];
    if (!post) {
      throw new Error("Mock post is undefined");
    }
    const { container } = render(<ForumPost post={post} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("CreatePost component should have no accessibility violations", async () => {
    const { container } = render(<CreatePost onSubmit={async () => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("CreatePost form should be keyboard accessible", async () => {
    const user = userEvent.setup();
    render(<CreatePost onSubmit={async () => {}} />);

    const titleInput = screen.getByTestId("title-input");
    const contentInput = screen.getByTestId("content-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.tab();
    expect(titleInput).toHaveFocus();

    await user.tab();
    expect(contentInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it("Forum posts should be announced properly to screen readers", async () => {
    render(<Forum posts={mockPosts} />);

    await waitFor(() => {
      mockPosts.forEach((post) => {
        const article = screen.getByTestId(`post-${post.id}`);
        expect(article).toHaveAttribute("role", "article");
        expect(article).toHaveAttribute(
          "aria-labelledby",
          `post-title-${post.id}`
        );

        const link = screen.getByTestId(`post-link-${post.id}`);
        expect(link).toHaveAttribute("aria-label", `פוסט: ${post.title}`);

        const content = screen.getByTestId(`post-content-${post.id}`);
        expect(content).toHaveAttribute(
          "aria-label",
          `תוכן הפוסט: ${post.content}`
        );
      });
    });
  });

  it("Error messages should be announced to screen readers", async () => {
    const user = userEvent.setup();
    render(<CreatePost onSubmit={async () => {}} />);

    const titleInput = screen.getByTestId("title-input");
    const contentInput = screen.getByTestId("content-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(titleInput, "a");
    await user.type(contentInput, "a");
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByTestId("error-message");
      errorMessages.forEach((error) => {
        expect(error).toHaveAttribute("role", "alert");
        expect(error).toHaveAttribute("aria-live", "polite");
      });
    });
  });

  it("Loading states should be properly announced", () => {
    render(<Forum isLoading={true} />);

    const loadingStatus = screen.getByTestId("loading-status");
    expect(loadingStatus).toHaveAttribute("role", "status");
    expect(loadingStatus).toHaveAttribute("aria-live", "polite");
    expect(loadingStatus.querySelector(".sr-only")).toHaveTextContent(
      "טוען פוסטים..."
    );
  });

  test("מספק תיאורים נגישים לכל הרכיבים", () => {
    render(
      <Forum
        posts={mockPosts}
        stats={mockStats}
        onCreatePost={async () => {}}
      />
    );

    // בודק תיאורים נגישים בסטטיסטיקות
    expect(screen.getByLabelText("סינון פוסטים בפורום")).toBeInTheDocument();
    expect(screen.getByLabelText("משתמשים פעילים")).toBeInTheDocument();
    expect(screen.getByLabelText("תגיות פופולריות")).toBeInTheDocument();

    // בודק תיאורים נגישים בפוסטים
    mockPosts.forEach((post) => {
      expect(
        screen.getByRole("img", {
          name: `תמונת הפרופיל של ${post.author.name}`,
        })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(`פוסט: ${post.title}`)).toBeInTheDocument();
      expect(
        screen.getByLabelText(`תוכן הפוסט: ${post.content}`)
      ).toBeInTheDocument();
    });
  });
});
