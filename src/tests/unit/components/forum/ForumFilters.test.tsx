import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ForumFilters } from "@/components/forum/ForumFilters";

// מוסיף מוקים לפונקציות החסרות
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.scrollIntoView = vi.fn();
});

describe("ForumFilters", () => {
  it("מציג את כל אפשרויות הסינון", () => {
    render(<ForumFilters />);

    // בודק שדה חיפוש
    expect(screen.getByPlaceholderText("חיפוש בפורום...")).toBeInTheDocument();

    // בודק כפתורי סינון
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
    expect(screen.getByTestId("category-select")).toBeInTheDocument();
    expect(screen.getByTestId("tag-select")).toBeInTheDocument();
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("מפעיל את onFilter כאשר משנים את החיפוש", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    const searchInput = screen.getByPlaceholderText("חיפוש בפורום...");
    await userEvent.type(searchInput, "test");

    expect(onFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "test",
      })
    );
  });

  it("מפעיל את onFilter כאשר בוחרים קטגוריה", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    const categoryButton = screen.getByTestId("category-select");
    await userEvent.click(categoryButton);
    await userEvent.click(screen.getByTestId("category-option-general"));

    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith(
        expect.objectContaining({ category: "general" })
      );
    });
  });

  it("מפעיל את onFilter כאשר בוחרים תגית", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    const tagButton = screen.getByTestId("tag-select");
    await userEvent.click(tagButton);
    await userEvent.click(screen.getByTestId("tag-option-javascript"));

    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith(
        expect.objectContaining({ tag: "javascript" })
      );
    });
  });

  it("מפעיל את onFilter כאשר משנים את המיון", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    const sortButton = screen.getByTestId("sort-select");
    await userEvent.click(sortButton);
    await userEvent.click(screen.getByTestId("sort-option-popular"));

    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith(
        expect.objectContaining({ sort: "popular" })
      );
    });
  });

  it("מפעיל את onFilter כאשר משנים את הסטטוס", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    const statusButton = screen.getByTestId("status-select");
    await userEvent.click(statusButton);
    await userEvent.click(screen.getByTestId("status-option-solved"));

    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith(
        expect.objectContaining({ status: "solved" })
      );
    });
  });

  it("מאפס את כל הפילטרים בלחיצה על כפתור האיפוס", async () => {
    const onFilter = vi.fn();
    render(<ForumFilters onFilter={onFilter} />);

    // מדמה בחירת פילטרים
    const searchInput = screen.getByPlaceholderText("חיפוש בפורום...");
    await userEvent.type(searchInput, "test");

    const resetButton = screen.getByTestId("reset-filters");
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(onFilter).toHaveBeenLastCalledWith({
        sort: "latest",
        search: "",
        category: undefined,
        tag: undefined,
        timeframe: "all",
        status: "all",
      });
    });
  });

  it("מספק תיאורים נגישים", () => {
    render(<ForumFilters />);

    expect(screen.getByLabelText("חיפוש בפורום")).toBeInTheDocument();
    expect(screen.getByLabelText("מיין תוצאות")).toBeInTheDocument();
    expect(screen.getByLabelText("סנן לפי קטגוריה")).toBeInTheDocument();
    expect(screen.getByLabelText("סנן לפי תגיות")).toBeInTheDocument();
    expect(screen.getByLabelText("סנן לפי סטטוס")).toBeInTheDocument();
  });
});
