import { render, screen } from "@testing-library/react";

import { Forum } from "@/components/forum/Forum";
import type { Author, ForumCategory, ForumPost, ForumStats as ForumStatsType, ForumTag,

/**
 * @file Forum.test.tsx
 * @description Unit tests for the Forum component
 * Tests cover:
 * - Component rendering
 * - Post display
 * - Empty state handling
 * - Loading state
 * - Error state
 * - Forum statistics display
 */



import type {
  Author,
  ForumCategory,
  ForumPost,
  ForumStats as ForumStatsType,
  ForumTag,} from "@/types/forum";

/**
 * Mock data for forum tests
 */

// Mock author data representing a test user
const mockAuthor: Author = {
  id: "1",
  name: "Test User",
  email: "test@test.com",
  image: undefined,
  avatar_url: undefined,
  bio: "Test user description",
  username: "testuser",
  role: "user",
  points: 100,
  level: 1,
  badges: [],
  achievements: [],
  full_name: "Test User Full Name",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_seen: undefined,
};

// Mock category for forum posts
const mockCategory: ForumCategory = {
  id: "1",
  name: "Test Category",
  description: "Test category description",
  slug: "test-category",
  order: 1,
  icon: "test-icon",
  color: "blue",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock tag for categorizing posts
const mockTag: ForumTag = {
  id: "1",
  name: "Test Tag",
  description: "Test tag description",
  slug: "test-tag",
  color: "blue",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockPost: ForumPost = {
  id: "1",
  title: "פוסט בדיקה",
  content: "תוכן פוסט בדיקה",
  author_id: mockAuthor.id,
  category_id: mockCategory.id,
  category: mockCategory,
  tags: [mockTag],
  pinned: false,
  solved: false,
  likes: 0,
  views: 0,
  comments_count: 0,
  last_activity: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: mockAuthor,
  comments: [],
};

const mockStats: ForumStatsType = {
  total_posts: 1,
  total_comments: 0,
  total_users: 1,
  total_solved: 0,
  total_views: 0,
  total_likes: 0,
  active_users: 1,
  posts_today: 1,
  popular_tags: [{ tag: mockTag, count: 1 }],
  top_contributors: [mockAuthor],
  trending_tags: [{ tag: mockTag, count: 1 }],
};

describe("Forum Component", () => {
  it("renders forum posts", () => {
    render(<Forum posts={[mockPost]} stats={mockStats} />);
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
  });

  it("renders empty state when no posts", () => {
    render(<Forum posts={[]} stats={mockStats} />);
    expect(screen.getByText(/אין פוסטים/i)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<Forum posts={[]} stats={mockStats} isLoading={true} />);
    expect(screen.getByTestId("forum-loading")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMessage = "שגיאה בטעינת הפורום";
    render(<Forum posts={[]} stats={mockStats} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders forum stats", () => {
    render(<Forum posts={[mockPost]} stats={mockStats} />);
    expect(screen.getByText(/סה"כ פוסטים/i)).toBeInTheDocument();
  });
});
