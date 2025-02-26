import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Message } from "@/types/simulator";
import { MessageItem } from "../MessageItem";

const mockMessage: Message = {
  id: "1",
  role: "user",
  content: "הודעת בדיקה",
  timestamp: new Date().toISOString(),
  sender: {
    id: "1",
    name: "משתמש",
    role: "user" as const,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("MessageItem", () => {
  it("renders message content", () => {
    render(
      <MessageItem
        message={mockMessage}
        isExpanded={false}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("הודעת בדיקה")).toBeInTheDocument();
  });

  it("renders sender name", () => {
    render(
      <MessageItem
        message={mockMessage}
        isExpanded={false}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("משתמש")).toBeInTheDocument();
  });

  it("handles feedback toggle", () => {
    const mockToggle = vi.fn();
    render(
      <MessageItem
        message={mockMessage}
        isExpanded={false}
        onToggleFeedback={mockToggle}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalled();
  });
});
