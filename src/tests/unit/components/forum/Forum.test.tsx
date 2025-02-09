import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Forum } from "@/components/forum/Forum";

// Mock data
const mockPosts = [
  {
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
  },
  {
    id: "2",
    title: "Another Post",
    content: "Another post content",
    createdAt: new Date("2024-01-02T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    userId: "user2",
    user: {
      id: "user2",
      name: "Another User",
      email: "another@example.com",
      image: "/another-avatar.jpg",
    },
    _count: {
      comments: 3,
    },
  },
];

describe("Forum", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders posts correctly", () => {
    render(<Forum posts={mockPosts} />);

    // Check if posts are displayed
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
    expect(screen.getByText("Another Post")).toBeInTheDocument();
  });

  it("filters posts by search query", async () => {
    render(<Forum posts={mockPosts} />);

    // Type in search input
    const searchInput = screen.getByPlaceholderText(/חיפוש בפורום/i);
    await userEvent.type(searchInput, "Another");

    // Check if only matching post is displayed
    expect(screen.getByText("Another Post")).toBeInTheDocument();
    expect(screen.queryByText("Test Post Title")).not.toBeInTheDocument();
  });

  it("shows empty state when no posts match search", async () => {
    render(<Forum posts={mockPosts} />);

    // Type in search input
    const searchInput = screen.getByPlaceholderText(/חיפוש בפורום/i);
    await userEvent.type(searchInput, "nonexistent");

    // Check if empty state message is displayed
    expect(
      screen.getByText(/לא נמצאו פוסטים התואמים את החיפוש/i),
    ).toBeInTheDocument();
  });

  it("shows empty state when no posts exist", () => {
    render(<Forum posts={[]} />);

    // Check if empty state message is displayed
    expect(screen.getByText(/אין פוסטים להצגה/i)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "test-class";
    const { container } = render(
      <Forum
        posts={mockPosts}
        className={customClass}
      />,
    );

    expect(container.firstChild).toHaveClass(customClass);
  });
});
