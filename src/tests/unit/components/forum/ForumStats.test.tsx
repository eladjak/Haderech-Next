import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForumStats } from "@/components/forum/ForumStats";
import { Author, ForumTag } from "@/types/forum";

describe("ForumStats", () => {
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

  it("מציג את כל הסטטיסטיקות הכלליות", () => {
    render(<ForumStats stats={mockStats} />);

    // בודק שהמספרים הכלליים מוצגים
    expect(screen.getByTestId("total-posts")).toHaveTextContent("100");
    expect(screen.getByTestId("total-comments")).toHaveTextContent("500");
    expect(screen.getByTestId("total-views")).toHaveTextContent("1000");
    expect(screen.getByTestId("total-likes")).toHaveTextContent("300");
    expect(screen.getByTestId("active-users")).toHaveTextContent("50");
    expect(screen.getByTestId("posts-today")).toHaveTextContent("10");

    // בודק שהתגיות הפופולריות מוצגות
    const trendingTags = screen.getByTestId("trending-tags");
    expect(trendingTags).toHaveTextContent("Test Tag");
    expect(trendingTags).toHaveTextContent("15");

    // בודק שהתורמים המובילים מוצגים
    const topContributors = screen.getByTestId("top-contributors");
    expect(topContributors).toHaveTextContent("Test User");
    expect(topContributors).toHaveTextContent("20");
    expect(topContributors).toHaveTextContent("50");
  });

  it("מציג הודעה כשאין נתונים", () => {
    render(
      <ForumStats
        stats={{
          ...mockStats,
          trending_tags: [],
          top_contributors: [],
        }}
      />
    );

    // בודק שהתגיות והתורמים ריקים
    const trendingTags = screen.getByTestId("trending-tags");
    const topContributors = screen.getByTestId("top-contributors");
    expect(trendingTags.children).toHaveLength(0);
    expect(topContributors.children).toHaveLength(0);
  });

  it("מספק תיאורים נגישים", () => {
    render(<ForumStats stats={mockStats} />);

    // בודק שיש כותרות נגישות
    expect(screen.getByTestId("total-posts-title")).toHaveTextContent(
      "סה״כ פוסטים"
    );
    expect(screen.getByTestId("trending-tags-title")).toHaveTextContent(
      "תגיות פופולריות"
    );
    expect(screen.getByTestId("top-contributors-title")).toHaveTextContent(
      "תורמים מובילים"
    );

    // בודק שיש תיאורים נגישים למספרים
    expect(screen.getByTestId("total-posts")).toHaveAttribute(
      "aria-label",
      "סך הכל 100 פוסטים"
    );
    expect(screen.getByTestId("total-views")).toHaveAttribute(
      "aria-label",
      "סך הכל 1000 צפיות"
    );
  });
});
