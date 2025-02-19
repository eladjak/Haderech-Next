import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { FeedbackDetails } from "@/types/simulator";

import { FeedbackDisplay } from "../FeedbackDisplay";

describe("FeedbackDisplay", () => {
  const mockFeedback = {
    score: 85,
    message: "תגובה טובה מאוד!",
    details: {
      empathy: 90,
      clarity: 85,
      effectiveness: 80,
      appropriateness: 85,
      strengths: ["אמפתיה טובה"],
      improvements: ["שיפור בהירות"],
      tips: ["נסה להיות יותר ברור"],
      comments: "עבודה טובה",
      suggestions: ["המשך לתרגל"],
      overallProgress: {
        empathy: 90,
        clarity: 85,
        effectiveness: 80,
        appropriateness: 85,
      },
    },
  };

  it("renders feedback message and score", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("תגובה טובה מאוד!")).toBeInTheDocument();
    expect(screen.getByText("ציון: 85")).toBeInTheDocument();
  });

  it("shows detailed feedback when expanded", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("אמפתיה")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("אמפתיה טובה")).toBeInTheDocument();
    expect(screen.getByText("שיפור בהירות")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole("alert"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("applies correct color based on score", () => {
    const { rerender } = render(
      <FeedbackDisplay
        feedback={{ ...mockFeedback, score: 85 }}
        messageId="1"
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole("alert")).toHaveClass("border-green-500");

    rerender(
      <FeedbackDisplay
        feedback={{ ...mockFeedback, score: 65 }}
        messageId="1"
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole("alert")).toHaveClass("border-yellow-500");

    rerender(
      <FeedbackDisplay
        feedback={{ ...mockFeedback, score: 45 }}
        messageId="1"
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole("alert")).toHaveClass("border-red-500");
  });

  it("shows/hides chevron based on expanded state", () => {
    const { rerender } = render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();

    rerender(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
  });
});
