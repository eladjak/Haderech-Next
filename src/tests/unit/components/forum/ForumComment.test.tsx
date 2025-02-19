import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ForumComment } from "@/components/forum/ForumComment";
import type { Author, ExtendedForumComment } from "@/types/forum";

// מוסיף מוקים לפונקציות החסרות
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.scrollIntoView = vi.fn();
});

const mockAuthor: Author = {
  id: "1",
  name: "משתמש לדוגמה",
  username: "example_user",
  full_name: "משתמש לדוגמה",
  email: "user@example.com",
  avatar_url: "/images/avatar.jpg",
  image: null,
  bio: "מורה ותיק לפיזיקה",
  role: "user",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_seen: new Date().toISOString(),
  points: 100,
  level: 1,
  badges: ["test"],
  achievements: ["test"],
};

const mockComment: ExtendedForumComment = {
  id: "1",
  post_id: "post-1",
  content: "תוכן התגובה לדוגמה",
  author_id: mockAuthor.id,
  author: mockAuthor,
  parent_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  likes: 0,
  isLiked: false,
  replies_count: 0,
  replies: [],
};

describe("ForumComment", () => {
  it("מציג תמונת פרופיל של המחבר", async () => {
    render(<ForumComment comment={mockComment} />);

    const avatar = await screen.findByRole("img", {
      name: mockComment.author.name,
    });
    expect(avatar).toBeInTheDocument();
  });

  it("מציג תמונת פרופיל כברירת מחדל כאשר אין תמונה", async () => {
    const commentWithoutImage = {
      ...mockComment,
      author: {
        ...mockComment.author,
        avatar_url: null,
        image: null,
        name: "משתמש לדוגמה",
      },
    };
    render(<ForumComment comment={commentWithoutImage} />);

    const fallback = await screen.findByRole("img", {
      name: commentWithoutImage.author.name,
    });
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("מ");
  });

  it("מקבל ומחיל className", () => {
    const className = "test-class";
    const { container } = render(
      <ForumComment comment={mockComment} className={className} />
    );
    expect(container.firstChild).toHaveClass(className);
  });

  it("מציג את תוכן התגובה", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText(mockComment.content)).toBeInTheDocument();
  });

  it("מציג את שם המשתמש", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText(mockComment.author.name)).toBeInTheDocument();
  });

  it("מציג את מספר הלייקים", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText(mockComment.likes.toString())).toBeInTheDocument();
  });
});
