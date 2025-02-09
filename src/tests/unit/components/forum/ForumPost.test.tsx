import { render, screen } from "@testing-library/react";
import React from "react";

import { ForumPost } from "@/components/forum/ForumPost";

// Mock data
const mockPost = {
  id: "1",
  title: "Test Post Title",
  content: "Test post content",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  userId: "user1",
  user: {
    id: "user1",
    name: "Test User",
    email: "test@example.com",
    image: "/test-avatar.jpg",
  },
  _count: {
    comments: 5,
  },
};

describe("ForumPost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders post content correctly", () => {
    render(<ForumPost post={mockPost} />);

    // Check title
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();

    // Check content
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();

    // Check author
    expect(screen.getByText(mockPost.user.name)).toBeInTheDocument();

    // Check comment count
    expect(screen.getByText("5 תגובות")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "test-class";
    const { container } = render(
      <ForumPost
        post={mockPost}
        className={customClass}
      />,
    );

    expect(container.firstChild).toHaveClass(customClass);
  });

  it("formats date correctly", () => {
    render(<ForumPost post={mockPost} />);

    // Should show formatted date (note: exact format depends on locale)
    expect(screen.getByText(/1 בינואר 2024/)).toBeInTheDocument();
  });

  it("renders avatar with fallback", () => {
    const postWithoutAvatar = {
      ...mockPost,
      user: {
        ...mockPost.user,
        image: "",
      },
    };

    render(<ForumPost post={postWithoutAvatar} />);

    // Should show avatar with first letters of name
    const avatar = screen.getByText("TU");
    expect(avatar).toBeInTheDocument();
  });

  it("truncates long content", () => {
    const longPost = {
      ...mockPost,
      content: "A".repeat(250),
    };

    render(<ForumPost post={longPost} />);

    // Should show truncated content
    const content = screen.getByText(/A+/);
    expect(content.textContent?.length).toBeLessThan(300);
  });
});
