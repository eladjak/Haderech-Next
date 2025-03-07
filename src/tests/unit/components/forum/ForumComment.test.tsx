import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ForumComment } from "@/components/forum/ForumComment";
import type { Author, ExtendedForumComment } from "@/types/forum";

("use client");

export {};

// מוסיף מוקים לפונקציות החסרות
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.scrollIntoView = vi.fn();
});

const mockAuthor: Author = {
  id: "1",
  name: "משתמש בדיקה",
  email: "test@test.com",
  image: undefined,
  avatar_url: undefined,
  bio: undefined,
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

const mockComment: ExtendedForumComment = {
  id: "1",
  content: "תוכן התגובה",
  author_id: mockAuthor.id,
  post_id: "1",
  parent_id: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: mockAuthor,
  user: mockAuthor,
  likes: 0,
  replies: [],
  liked_by_user: false,
  isLiked: false,
  replies_count: 0,
  post: {
    id: "1",
    title: "פוסט בדיקה",
    content: "תוכן פוסט בדיקה",
    author_id: mockAuthor.id,
    category_id: "1",
    category: {
      id: "1",
      name: "קטגוריה",
      description: "תיאור",
      slug: "category",
      color: "blue",
      order: 1,
      icon: "icon",
      posts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    tags: [],
    pinned: false,
    solved: false,
    likes: 0,
    views: 0,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: mockAuthor,
  },
};

describe("ForumComment Component", () => {
  it("renders comment content", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText(mockComment.content)).toBeInTheDocument();
  });

  it("renders author information", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText(mockComment.author.name)).toBeInTheDocument();
    const avatar = screen.getByAltText(`${mockComment.author.name} avatar`);
    expect(avatar).toBeInTheDocument();
  });

  it("renders likes count", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders replies count", () => {
    render(<ForumComment comment={mockComment} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders nested replies", () => {
    const nestedComment: ExtendedForumComment = {
      ...mockComment,
      replies: [{ ...mockComment, id: "2" }],
      replies_count: 1,
    };
    render(<ForumComment comment={nestedComment} />);
    expect(screen.getAllByText(mockComment.content)).toHaveLength(2);
  });
});
