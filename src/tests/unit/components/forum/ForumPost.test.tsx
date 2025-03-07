import { render, screen } from "@testing-library/react";

import { beforeAll, describe, expect, it, vi } from "vitest";
import { ForumPost } from "@/components/forum/ForumPost";
import type { Author, ExtendedForumPost, ForumCategory, ForumTag,
import type {
import type {

"use client";

 Author, ExtendedForumPost, ForumCategory,


export {}







/**
 * @file ForumPost.test.tsx
 * @description Tests for the ForumPost component
 */




  Author,
  ExtendedForumPost,
  ForumCategory,
  ForumTag} from "@/types/forum";

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
  last_seen: undefined};

const mockCategory: ForumCategory = {
  id: "1",
  name: "קטגוריה לבדיקה",
  description: "תיאור קטגוריה",
  slug: "test-category",
  order: 1,
  icon: "test-icon",
  color: "blue",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()};

const mockTag: ForumTag = {
  id: "1",
  name: "תגית בדיקה",
  description: "תיאור תגית",
  slug: "test-tag",
  color: "blue",
  posts_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()};

const mockPost: ExtendedForumPost = {
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
  replies_count: 0};

describe("ForumPost Component", () => {
  it("renders post title and content", () => {
    render(<ForumPost post={mockPost} />);
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
  });

  it("renders author information", () => {
    render(<ForumPost post={mockPost} />);
    expect(screen.getByText(mockPost.author.name)).toBeInTheDocument();
    const avatar = screen.getByAltText(`${mockPost.author.name} avatar`);
    expect(avatar).toBeInTheDocument();
  });

  it("renders category and tags", () => {
    render(<ForumPost post={mockPost} />);
    expect(screen.getByText(mockPost.category.name)).toBeInTheDocument();
    mockPost.tags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("renders post metadata", () => {
    render(<ForumPost post={mockPost} />);
    expect(
      screen.getByText(`תגובות (${mockPost.comments_count})`)
    ).toBeInTheDocument();
    expect(screen.getByText(`צפיות: ${mockPost.views}`)).toBeInTheDocument();
    expect(screen.getByText(`לייקים: ${mockPost.likes}`)).toBeInTheDocument();
  });

  it("shows pinned status when post is pinned", () => {
    const pinnedPost = { ...mockPost, pinned: true }
    render(<ForumPost post={pinnedPost} />);
    expect(screen.getByTestId("pinned-icon")).toBeInTheDocument();
  });

  it("shows solved status when post is solved", () => {
    const solvedPost = { ...mockPost, solved: true }
    render(<ForumPost post={solvedPost} />);
    expect(screen.getByTestId("solved-icon")).toBeInTheDocument();
  });
});
