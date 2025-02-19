import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { Message } from "@/types/simulator";

import { MessageItem } from "../MessageItem";

describe("MessageItem", () => {
  const mockMessage: Message = {
    id: "1",
    role: "user",
    content: "שלום, אני צריך עזרה",
    timestamp: new Date().toISOString(),
    sender: {
      role: "user",
      name: "משתמש",
    },
  };

  it("renders message content correctly", () => {
    render(<MessageItem message={mockMessage} />);
    expect(screen.getByText(mockMessage.content)).toBeInTheDocument();
  });

  it("renders sender name correctly", () => {
    render(<MessageItem message={mockMessage} />);
    expect(screen.getByText(mockMessage.sender.name!)).toBeInTheDocument();
  });

  it("renders avatar fallback when no avatar is provided", () => {
    render(<MessageItem message={mockMessage} />);
    expect(screen.getByText("מ")).toBeInTheDocument();
  });

  it("applies correct classes for user message", () => {
    const { container } = render(<MessageItem message={mockMessage} />);
    expect(container.firstChild).toHaveClass("justify-end");
  });

  it("applies correct classes for assistant message", () => {
    const assistantMessage: Message = {
      ...mockMessage,
      role: "assistant",
      sender: {
        role: "assistant",
        name: "מערכת",
      },
    };
    const { container } = render(<MessageItem message={assistantMessage} />);
    expect(container.firstChild).toHaveClass("justify-start");
  });

  it("applies custom className", () => {
    const { container } = render(
      <MessageItem message={mockMessage} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
