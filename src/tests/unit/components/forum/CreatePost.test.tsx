import { useRouter } from "next/navigation";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreatePost } from "@/components/forum/CreatePost";
import { useToast } from "@/components/ui/use-toast";

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock useRouter
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CreatePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    mockRefresh.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "test-post-id" }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    const titleInput = screen.getByPlaceholderText(/כותרת הפוסט/i);
    const contentInput = screen.getByPlaceholderText(/תוכן הפוסט/i);
    await user.type(titleInput, "Test Title");
    await user.type(contentInput, "Test Content");
    return { titleInput, contentInput };
  };

  const getFormElements = () => {
    const titleInput = screen.getByPlaceholderText(/כותרת הפוסט/i);
    const contentInput = screen.getByPlaceholderText(/תוכן הפוסט/i);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    return { titleInput, contentInput, submitButton };
  };

  it("מאפשר יצירת פוסט חדש", async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Title",
          content: "Test Content",
        }),
      });
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(titleInput).toHaveValue("");
      expect(contentInput).toHaveValue("");
    });
  });

  it("מציג הודעת הצלחה כאשר הפוסט נוצר", async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "הפוסט נוצר בהצלחה",
        description: "הפוסט שלך פורסם בפורום",
      });
      expect(titleInput).toHaveValue("");
      expect(contentInput).toHaveValue("");
    });
  });

  it("מציג הודעת שגיאה כאשר יש בעיה ביצירת הפוסט", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to create post"));

    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את הפוסט. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      expect(titleInput).toHaveValue("Test Title");
      expect(contentInput).toHaveValue("Test Content");
    });
  });

  it("מטפל בתגובת שרת לא תקינה", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    });

    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את הפוסט. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      expect(titleInput).toHaveValue("Test Title");
      expect(contentInput).toHaveValue("Test Content");
    });
  });

  it("מטפל בשגיאת שרת עם הודעה ספציפית", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "כותרת הפוסט חייבת להכיל לפחות 3 תווים" }),
    });

    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "שגיאה",
        description: "כותרת הפוסט חייבת להכיל לפחות 3 תווים",
        variant: "destructive",
      });
      expect(titleInput).toHaveValue("Test Title");
      expect(contentInput).toHaveValue("Test Content");
    });
  });

  it("מטפל בשגיאת אימות משתמש", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "יש להתחבר כדי ליצור פוסט" }),
    });

    const user = userEvent.setup();
    render(<CreatePost />);

    const { titleInput, contentInput } = await fillForm(user);
    const submitButton = screen.getByRole("button", { name: /פרסם פוסט/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "שגיאה",
        description: "יש להתחבר כדי ליצור פוסט",
        variant: "destructive",
      });
      expect(titleInput).toHaveValue("Test Title");
      expect(contentInput).toHaveValue("Test Content");
    });
  });

  it("מציג טופס יצירת פוסט", () => {
    render(<CreatePost />);

    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByTestId("title-input")).toBeInTheDocument();
    expect(screen.getByTestId("content-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("מציג הודעות שגיאה כאשר הטופס לא תקין", async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByTestId("error-message");
      expect(errorMessages).toHaveLength(2);
      expect(errorMessages[0]).toHaveTextContent(/הכותרת חייבת להכיל/);
      expect(errorMessages[1]).toHaveTextContent(/התוכן חייב להכיל/);
    });
  });

  it("משנה את טקסט הכפתור ומנטרל אותו בזמן טעינה", () => {
    render(<CreatePost isLoading={true} />);

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toHaveTextContent("יוצר פוסט...");
    expect(submitButton).toBeDisabled();
  });

  it("מנטרל את השדות בזמן טעינה", () => {
    render(<CreatePost isLoading={true} />);

    const titleInput = screen.getByTestId("title-input");
    const contentInput = screen.getByTestId("content-input");

    expect(titleInput).toBeDisabled();
    expect(contentInput).toBeDisabled();
  });

  it("קורא לפונקציית onSubmit עם הנתונים הנכונים", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreatePost onSubmit={onSubmit} />);

    const titleInput = screen.getByTestId("title-input");
    const contentInput = screen.getByTestId("content-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(titleInput, "Test Title");
    await user.type(contentInput, "Test content that is long enough");
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Test Title",
        content: "Test content that is long enough",
      });
    });
  });
});
