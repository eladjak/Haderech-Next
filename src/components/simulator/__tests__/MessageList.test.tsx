import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { Message } from "@/types/simulator";

import { MessageList } from "../MessageList";

describe("MessageList", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      role: "user",
      content: "שלום",
      timestamp: new Date().toISOString(),
      sender: {
        role: "user",
        name: "משתמש",
      },
    },
    {
      id: "2",
      role: "assistant",
      content: "היי! איך אני יכול לעזור?",
      timestamp: new Date().toISOString(),
      sender: {
        role: "assistant",
        name: "עוזר",
      },
    },
  ];

  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("מציג את כל ההודעות", () => {
    render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => {}}
      />
    );

    expect(screen.getByText("שלום")).toBeInTheDocument();
    expect(screen.getByText("היי! איך אני יכול לעזור?")).toBeInTheDocument();
  });

  it("מוסיף class שהועבר כ-prop", () => {
    const { container } = render(
      <MessageList
        messages={mockMessages}
        className="test-class"
        expandedFeedback={[]}
        onToggleFeedback={() => {}}
      />
    );
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("קורא ל-scrollIntoView כאשר מתווספת הודעה חדשה", () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => {}}
      />
    );

    const newMessages: Message[] = [
      ...mockMessages,
      {
        id: "3",
        role: "user",
        content: "הודעה חדשה",
        timestamp: new Date().toISOString(),
        sender: {
          role: "user",
          name: "משתמש",
        },
      },
    ];

    rerender(
      <MessageList
        messages={newMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => {}}
      />
    );

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("מציג משוב כאשר קיים", () => {
    const messageWithFeedback: Message = {
      id: "1",
      role: "user",
      content: "שלום",
      timestamp: new Date().toISOString(),
      sender: {
        role: "user",
        name: "משתמש",
      },
      feedback: {
        score: 85,
        message: "תגובה טובה!",
        details: {
          empathy: 90,
          clarity: 85,
          effectiveness: 80,
          appropriateness: 85,
          strengths: ["חוזקה 1"],
          improvements: ["שיפור 1"],
          tips: ["טיפ 1"],
          comments: "הערה כללית",
          suggestions: ["הצעה 1"],
          overallProgress: {
            empathy: 90,
            clarity: 85,
            effectiveness: 80,
            appropriateness: 85,
          },
        },
      },
    };

    render(
      <MessageList
        messages={[messageWithFeedback]}
        expandedFeedback={[messageWithFeedback.id]}
        onToggleFeedback={() => {}}
      />
    );

    expect(screen.getByText("תגובה טובה!")).toBeInTheDocument();
    expect(screen.getByText("ציון: 85")).toBeInTheDocument();
  });
});
