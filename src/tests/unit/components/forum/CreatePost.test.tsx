import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CreatePost } from "@/components/forum/CreatePost";

// Mock functions
const mockOnSubmit = jest.fn();

describe("CreatePost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    // Check for input fields
    expect(screen.getByPlaceholderText(/כותרת הפוסט/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/תוכן הפוסט/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/הוסף תגיות/i)).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole("button", { name: /פרסם/i })).toBeInTheDocument();
  });

  it("handles form submission correctly", async () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    // Fill in the form
    const titleInput = screen.getByPlaceholderText(/כותרת הפוסט/i);
    const contentInput = screen.getByPlaceholderText(/תוכן הפוסט/i);

    await userEvent.type(titleInput, "Test Title");
    await userEvent.type(contentInput, "Test Content");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /פרסם/i });
    await userEvent.click(submitButton);

    // Check if onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "Test Title",
      content: "Test Content",
      tags: [],
    });
  });

  it("handles tag addition and removal", async () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByPlaceholderText(/הוסף תגיות/i);

    // Add tags
    await userEvent.type(tagInput, "tag1{enter}");
    await userEvent.type(tagInput, "tag2{enter}");

    // Check if tags are displayed
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();

    // Remove a tag
    const removeButtons = screen.getAllByRole("button");
    await userEvent.click(removeButtons[0]); // First remove button

    // Check if tag was removed
    expect(screen.queryByText("tag1")).not.toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
  });

  it("prevents duplicate tags", async () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByPlaceholderText(/הוסף תגיות/i);

    // Add same tag twice
    await userEvent.type(tagInput, "tag1{enter}");
    await userEvent.type(tagInput, "tag1{enter}");

    // Check that tag appears only once
    const tags = screen.getAllByText("tag1");
    expect(tags).toHaveLength(1);
  });

  it("disables submit button when required fields are empty", () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /פרסם/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when required fields are filled", async () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByPlaceholderText(/כותרת הפוסט/i);
    const contentInput = screen.getByPlaceholderText(/תוכן הפוסט/i);
    const submitButton = screen.getByRole("button", { name: /פרסם/i });

    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Fill required fields
    await userEvent.type(titleInput, "Test Title");
    await userEvent.type(contentInput, "Test Content");

    // Should be enabled
    expect(submitButton).toBeEnabled();
  });

  it("shows loading state during submission", async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(
      <CreatePost
        onSubmit={mockOnSubmit}
        isLoading={true}
      />,
    );

    const submitButton = screen.getByRole("button");
    expect(submitButton).toHaveTextContent(/שולח/i);
    expect(submitButton).toBeDisabled();
  });

  it("clears form after successful submission", async () => {
    render(<CreatePost onSubmit={mockOnSubmit} />);

    // Fill in the form
    const titleInput = screen.getByPlaceholderText(/כותרת הפוסט/i);
    const contentInput = screen.getByPlaceholderText(/תוכן הפוסט/i);
    const tagInput = screen.getByPlaceholderText(/הוסף תגיות/i);

    await userEvent.type(titleInput, "Test Title");
    await userEvent.type(contentInput, "Test Content");
    await userEvent.type(tagInput, "tag1{enter}");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /פרסם/i });
    await userEvent.click(submitButton);

    // Check if form is cleared
    await waitFor(() => {
      expect(titleInput).toHaveValue("");
      expect(contentInput).toHaveValue("");
      expect(screen.queryByText("tag1")).not.toBeInTheDocument();
    });
  });

  it("handles submission errors gracefully", async () => {
    const error = new Error("Test error");
    mockOnSubmit.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<CreatePost onSubmit={mockOnSubmit} />);

    // Fill and submit form
    await userEvent.type(
      screen.getByPlaceholderText(/כותרת הפוסט/i),
      "Test Title",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/תוכן הפוסט/i),
      "Test Content",
    );
    await userEvent.click(screen.getByRole("button", { name: /פרסם/i }));

    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith("שגיאה ביצירת פוסט:", error);

    consoleSpy.mockRestore();
  });

  it("applies custom className", () => {
    const customClass = "test-class";
    const { container } = render(
      <CreatePost
        onSubmit={mockOnSubmit}
        className={customClass}
      />,
    );

    expect(container.firstChild).toHaveClass(customClass);
  });
});
