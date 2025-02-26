import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorDisplay } from "../ErrorDisplay";

describe("ErrorDisplay", () => {
  it("מציג את הודעת השגיאה", () => {
    render(<ErrorDisplay error="שגיאת בדיקה" />);
    expect(screen.getByText("שגיאת בדיקה")).toBeInTheDocument();
  });

  it("מציג כפתור נסה שוב כשמועבר onRetry", () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error="שגיאה" onRetry={mockRetry} />);
    expect(screen.getByText("נסה שוב")).toBeInTheDocument();
  });

  it("לא מציג כפתור נסה שוב כשלא מועבר onRetry", () => {
    render(<ErrorDisplay error="שגיאה" />);
    expect(screen.queryByText("נסה שוב")).not.toBeInTheDocument();
  });

  it("קורא ל-onRetry בלחיצה על הכפתור", () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error="שגיאה" onRetry={mockRetry} />);

    fireEvent.click(screen.getByText("נסה שוב"));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("מחיל את ה-className שהועבר", () => {
    const { container } = render(
      <ErrorDisplay error="שגיאה" className="test-class" />
    );
    expect(container.firstChild).toHaveClass("test-class");
  });
});
