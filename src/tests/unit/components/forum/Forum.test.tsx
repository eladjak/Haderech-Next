import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Forum } from "@/components/forum/Forum";
import { Author, ExtendedForumPost } from "@/types/forum";

describe("Forum", () => {
  const mockAuthor: Author = {
    id: "1",
    name: "Test User",
    username: "testuser",
    full_name: "Test User",
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
      last_reply: null,
      comments: [],
    },
  ];

  it("מציג את הפוסטים כשיש פוסטים", () => {
    render(<Forum posts={mockPosts} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("מציג הודעה כשאין פוסטים", () => {
    render(<Forum posts={[]} />);
    expect(
      screen.getByText("עדיין אין פוסטים בפורום. היה הראשון ליצור פוסט!")
    ).toBeInTheDocument();
  });

  it("מציג מצב טעינה", () => {
    render(<Forum isLoading={true} />);
    const loadingStatus = screen.getByTestId("loading-status");
    expect(loadingStatus).toHaveTextContent("טוען פוסטים...");
  });

  it("מציג הודעת שגיאה כאשר יש בעיה בטעינה", () => {
    const errorMessage = "שגיאה בטעינת הפוסטים";
    render(<Forum error={errorMessage} />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  it("מספק תיאורים נגישים לכל הפוסטים", () => {
    render(<Forum posts={mockPosts} />);
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).toHaveAttribute("aria-labelledby");
    });
  });
});
