import { render, screen } from "@testing-library/react";
import React from "react";

import { ForumComment } from "@/components/forum/ForumComment";

// Mock data
const mockComment = {
  id: "1",
  content: "Test comment content",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  userId: "user1",
  user: {
    id: "user1",
    name: "Test User",
    email: "test@example.com",
    image: "/test-avatar.jpg",
  },
};

describe("ForumComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders comment content correctly", () => {
    render(<ForumComment comment={mockComment} />);

    // Check content
    expect(screen.getByText(mockComment.content)).toBeInTheDocument();

    // Check author
    expect(screen.getByText(mockComment.user.name)).toBeInTheDocument();

    // Check date
    expect(screen.getByText(/1 בינואר 2024/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "test-class";
    const { container } = render(
      <ForumComment
        comment={mockComment}
        className={customClass}
      />,
    );

    expect(container.firstChild).toHaveClass(customClass);
  });

  it("formats date correctly", () => {
    const commentWithDifferentDate = {
      ...mockComment,
      createdAt: new Date("2024-03-15T14:30:00.000Z"),
    };

    render(<ForumComment comment={commentWithDifferentDate} />);

    // Should show formatted date (note: exact format depends on locale)
    expect(screen.getByText(/15 במרץ 2024/)).toBeInTheDocument();
  });

  it("renders avatar with fallback", () => {
    const commentWithoutAvatar = {
      ...mockComment,
      user: {
        ...mockComment.user,
        image: "",
      },
    };

    render(<ForumComment comment={commentWithoutAvatar} />);

    // Should show avatar with first letters of name
    const avatar = screen.getByText("TU");
    expect(avatar).toBeInTheDocument();
  });
});
