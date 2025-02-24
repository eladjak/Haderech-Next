import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FeedbackDetails } from "@/types/simulator";

import { FeedbackDisplay } from "../FeedbackDisplay";

const mockFeedback: FeedbackDetails = {
  metrics: {
    empathy: 0.85,
    clarity: 0.9,
    effectiveness: 0.75,
    appropriateness: 0.8,
    professionalism: 0.95,
    problem_solving: 0.7,
    overall: 0.85,
  },
  score: 85,
  strengths: ["תקשורת טובה", "אמפתיה גבוהה"],
  improvements: ["שיפור זמני תגובה"],
  tips: ["נסה להקשיב יותר"],
  comments: "עבודה טובה בסך הכל",
  suggestions: ["התמקד בפתרון בעיות"],
  overallProgress: {
    score: 85,
    level: "מתקדם",
    nextLevel: "מומחה",
    requiredScore: 90,
  },
};

const noop = () => {
  /* no operation */
};

describe("FeedbackDisplay", () => {
  const mockToggle = vi.fn();

  it("renders no feedback message when feedback is undefined", () => {
    render(
      <FeedbackDisplay messageId="1" isExpanded={false} onToggle={mockToggle} />
    );

    expect(screen.getByText("אין משוב זמין")).toBeInTheDocument();
  });

  it("renders feedback metrics correctly", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={mockToggle}
      />
    );

    expect(screen.getByText("ציון: 85")).toBeInTheDocument();
    expect(screen.getByText("אמפתיה")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("toggles expanded state on click", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={mockToggle}
      />
    );

    fireEvent.click(screen.getByRole("alert"));
    expect(mockToggle).toHaveBeenCalledWith("1");
  });

  it("shows strengths when expanded", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={mockToggle}
      />
    );

    expect(screen.getByText("חוזקות")).toBeInTheDocument();
    expect(screen.getByText("תקשורת טובה")).toBeInTheDocument();
  });

  it("shows improvements when expanded", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={mockToggle}
      />
    );

    expect(screen.getByText("נקודות לשיפור")).toBeInTheDocument();
    expect(screen.getByText("שיפור זמני תגובה")).toBeInTheDocument();
  });

  it("shows suggestions when expanded", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={mockToggle}
      />
    );

    expect(screen.getByText("הצעות לשיפור")).toBeInTheDocument();
    expect(screen.getByText("התמקד בפתרון בעיות")).toBeInTheDocument();
  });

  it("shows overall progress when expanded", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={true}
        onToggle={mockToggle}
      />
    );

    expect(screen.getByText("התקדמות כללית")).toBeInTheDocument();
    expect(screen.getByText("רמה נוכחית: מתקדם")).toBeInTheDocument();
    expect(screen.getByText("הרמה הבאה: מומחה")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={mockToggle}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles click on expand/collapse button", () => {
    render(
      <FeedbackDisplay
        feedback={mockFeedback}
        messageId="1"
        isExpanded={false}
        onToggle={mockToggle}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledWith("1");
  });
});
