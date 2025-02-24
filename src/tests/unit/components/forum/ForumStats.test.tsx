import { render, screen } from "@testing-library/react";

import { ForumStats } from "@/components/forum/ForumStats";
import type {
  Author,
  ForumStats as ForumStatsType,
  ForumTag,
} from "@/types/forum";

const mockAuthor: Author = {
  id: "1",
  name: "משתמש בדיקה",
  email: "test@test.com",
  image: undefined,
  avatar_url: undefined,
  bio: "תיאור משתמש בדיקה",
  username: "testuser",
  role: "user",
  points: 100,
  level: 1,
  badges: [],
  achievements: [],
  full_name: "משתמש בדיקה מלא",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_seen: undefined,
};

const mockTag: ForumTag = {
  id: "1",
  name: "תגית בדיקה",
  description: "תיאור תגית",
  slug: "test-tag",
  color: "blue",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockStats: ForumStatsType = {
  total_posts: 100,
  total_comments: 500,
  total_users: 50,
  total_solved: 30,
  total_views: 1000,
  total_likes: 200,
  active_users: 20,
  posts_today: 5,
  popular_tags: [{ tag: mockTag, count: 20 }],
  top_contributors: [mockAuthor],
  trending_tags: [{ tag: mockTag, count: 10 }],
};

describe("ForumStats Component", () => {
  it("renders all statistics correctly", () => {
    render(<ForumStats stats={mockStats} />);

    expect(screen.getByText(/100/)).toBeInTheDocument(); // total posts
    expect(screen.getByText(/500/)).toBeInTheDocument(); // total comments
    expect(screen.getByText(/50/)).toBeInTheDocument(); // total users
    expect(screen.getByText(/30/)).toBeInTheDocument(); // total solved
    expect(screen.getByText(/1000/)).toBeInTheDocument(); // total views
    expect(screen.getByText(/200/)).toBeInTheDocument(); // total likes
  });

  it("renders popular tags", () => {
    render(<ForumStats stats={mockStats} />);
    mockStats.popular_tags?.forEach(({ tag }) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("renders top contributors", () => {
    render(<ForumStats stats={mockStats} />);
    mockStats.top_contributors.forEach((contributor) => {
      expect(screen.getByText(contributor.name)).toBeInTheDocument();
    });
  });

  it("renders trending tags", () => {
    render(<ForumStats stats={mockStats} />);
    mockStats.trending_tags?.forEach(({ tag }) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("renders with partial data", () => {
    const partialStats: ForumStatsType = {
      total_posts: 0,
      total_comments: 0,
      total_users: 0,
      total_solved: 0,
      total_views: 0,
      total_likes: 0,
      active_users: 0,
      posts_today: 0,
      popular_tags: [],
      top_contributors: [],
      trending_tags: [],
    };
    render(<ForumStats stats={partialStats} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
