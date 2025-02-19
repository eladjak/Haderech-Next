/**
 * @file ForumPost.test.tsx
 * @description Tests for the ForumPost component
 */

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ForumPost } from "@/components/forum/ForumPost";
import type { Author, ExtendedForumPost } from "@/types/forum";

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.scrollIntoView = vi.fn();
});

const mockAuthor: Author = {
  id: "1",
  name: "משתמש לדוגמה",
  username: "example_user",
  full_name: "משתמש לדוגמה",
  email: "example@test.com",
  avatar_url: "/avatar1.jpg",
  image: "/avatar1.jpg",
  bio: "מורה ותיק לפיזיקה",
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

const mockPost: ExtendedForumPost = {
  id: "1",
  title: "כותרת לדוגמה",
  content: "תוכן לדוגמה",
  author: mockAuthor,
  author_id: "1",
  category: "כללי",
  tags: ["javascript", "react"],
  views: 100,
  likes: 50,
  comments: [],
  created_at: "2024-02-03T12:00:00Z",
  updated_at: "2024-02-03T12:00:00Z",
  isLiked: false,
  isBookmarked: false,
  replies_count: 5,
  pinned: false,
  solved: false,
  last_activity: new Date().toISOString(),
  last_reply: {
    author: mockAuthor,
    content: "תגובה לדוגמה",
    created_at: "2024-02-03T13:00:00Z",
  },
};

describe("ForumPost", () => {
  it("מציג את כל המידע של הפוסט", () => {
    render(<ForumPost post={mockPost} />);

    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
    expect(screen.getByText(mockPost.author.name)).toBeInTheDocument();
    expect(screen.getByText(mockPost.category)).toBeInTheDocument();
    mockPost.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("מציג תמונת פרופיל של המחבר", () => {
    render(<ForumPost post={mockPost} />);

    const avatar = screen.getByRole("img", {
      name: `תמונת הפרופיל של ${mockPost.author.name}`,
    });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", mockPost.author.image);
  });

  it("מציג תמונת פרופיל כברירת מחדל כאשר אין תמונה", () => {
    const postWithoutImage = {
      ...mockPost,
      author: { ...mockPost.author, image: null, avatar_url: null },
    };
    render(<ForumPost post={postWithoutImage} />);

    const fallback = screen.getByRole("img", {
      name: `תמונת הפרופיל של ${mockPost.author.name}`,
    });
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent(
      mockPost.author.name.charAt(0).toUpperCase()
    );
  });

  it("מקשר לעמוד הפוסט המלא", () => {
    render(<ForumPost post={mockPost} />);

    const link = screen.getByTestId(`post-link-${mockPost.id}`);
    expect(link).toHaveAttribute("href", `/forum/post/${mockPost.id}`);
  });

  it("מקבל ומחיל className", () => {
    const className = "test-class";
    const { container } = render(
      <ForumPost post={mockPost} className={className} />
    );

    expect(container.firstChild).toHaveClass(className);
  });

  it("מספק תיאורים נגישים", () => {
    render(<ForumPost post={mockPost} />);

    expect(
      screen.getByRole("img", {
        name: `תמונת הפרופיל של ${mockPost.author.name}`,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`פוסט: ${mockPost.title}`)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`תוכן הפוסט: ${mockPost.content}`)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`תגובות (${mockPost.replies_count})`)
    ).toBeInTheDocument();
  });
});
