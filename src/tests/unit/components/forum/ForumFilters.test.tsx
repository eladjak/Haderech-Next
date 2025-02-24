import { fireEvent, render, screen } from "@testing-library/react";

import { ForumFilters } from "@/components/forum/ForumFilters";
import type { ForumFilters as ForumFiltersType } from "@/types/forum";

const mockOnFilter = vi.fn();

const defaultFilters: ForumFiltersType = {
  search: "",
  sort: "latest",
  category: undefined,
  status: "all",
  timeframe: "all",
};

describe("ForumFilters Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all filter options", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    expect(screen.getByPlaceholderText(/חיפוש/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /מיון/i })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /קטגוריה/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /סטטוס/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /טווח זמן/i })
    ).toBeInTheDocument();
  });

  it("calls onFilter when search input changes", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    const searchInput = screen.getByPlaceholderText(/חיפוש/i);
    fireEvent.change(searchInput, { target: { value: "test" } });

    expect(mockOnFilter).toHaveBeenCalledWith({
      ...defaultFilters,
      search: "test",
    });
  });

  it("calls onFilter when sort changes", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    const sortSelect = screen.getByRole("combobox", { name: /מיון/i });
    fireEvent.change(sortSelect, { target: { value: "popular" } });

    expect(mockOnFilter).toHaveBeenCalledWith({
      ...defaultFilters,
      sort: "popular",
    });
  });

  it("calls onFilter when category changes", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    const categorySelect = screen.getByRole("combobox", { name: /קטגוריה/i });
    fireEvent.change(categorySelect, { target: { value: "general" } });

    expect(mockOnFilter).toHaveBeenCalledWith({
      ...defaultFilters,
      category: "general",
    });
  });

  it("calls onFilter when status changes", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    const statusSelect = screen.getByRole("combobox", { name: /סטטוס/i });
    fireEvent.change(statusSelect, { target: { value: "solved" } });

    expect(mockOnFilter).toHaveBeenCalledWith({
      ...defaultFilters,
      status: "solved",
    });
  });

  it("calls onFilter when timeframe changes", () => {
    render(<ForumFilters filters={defaultFilters} onFilter={mockOnFilter} />);

    const timeframeSelect = screen.getByRole("combobox", { name: /טווח זמן/i });
    fireEvent.change(timeframeSelect, { target: { value: "week" } });

    expect(mockOnFilter).toHaveBeenCalledWith({
      ...defaultFilters,
      timeframe: "week",
    });
  });

  it("resets all filters when reset button is clicked", () => {
    const currentFilters: ForumFiltersType = {
      search: "test",
      sort: "popular",
      category: "general",
      status: "solved",
      timeframe: "week",
    };

    render(<ForumFilters filters={currentFilters} onFilter={mockOnFilter} />);

    const resetButton = screen.getByRole("button", { name: /איפוס/i });
    fireEvent.click(resetButton);

    expect(mockOnFilter).toHaveBeenCalledWith(defaultFilters);
  });
});
