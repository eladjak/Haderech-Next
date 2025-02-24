import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "@/types/simulator";

import { MessageList } from "../MessageList";

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "שלום, אני צריך עזרה",
    timestamp: new Date().toISOString(),
    sender: {
      id: "1",
      name: "משתמש",
      role: "user" as const,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    role: "assistant",
    content: "כיצד אוכל לעזור?",
    timestamp: new Date().toISOString(),
    sender: {
      id: "2",
      name: "עוזר",
      role: "assistant" as const,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("MessageList", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders all messages", () => {
    render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("שלום, אני צריך עזרה")).toBeInTheDocument();
    expect(screen.getByText("כיצד אוכל לעזור?")).toBeInTheDocument();
  });

  it("renders sender names", () => {
    render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("משתמש")).toBeInTheDocument();
    expect(screen.getByText("עוזר")).toBeInTheDocument();
  });

  it("handles empty messages array", () => {
    render(
      <MessageList
        messages={[]}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );
    expect(screen.getByText("אין הודעות עדיין")).toBeInTheDocument();
  });

  it("updates view when new messages arrive", () => {
    const { rerender } = render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    const newMessage: Message = {
      id: "3",
      role: "user",
      content: "הודעה חדשה",
      timestamp: new Date().toISOString(),
      sender: {
        id: "1",
        name: "משתמש",
        role: "user" as const,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    rerender(
      <MessageList
        messages={[...mockMessages, newMessage]}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("הודעה חדשה")).toBeInTheDocument();
  });

  it("calls scrollIntoView when new message is added", () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <MessageList
        messages={mockMessages}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    const newMessage: Message = {
      id: "3",
      role: "user",
      content: "הודעה חדשה",
      timestamp: new Date().toISOString(),
      sender: {
        id: "1",
        name: "משתמש",
        role: "user" as const,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    rerender(
      <MessageList
        messages={[...mockMessages, newMessage]}
        expandedFeedback={[]}
        onToggleFeedback={() => undefined}
      />
    );

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("displays feedback when available", () => {
    const messageWithFeedback: Message = {
      id: "1",
      role: "user",
      content: "שלום",
      timestamp: new Date().toISOString(),
      sender: {
        id: "1",
        name: "משתמש",
        role: "user" as const,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      feedback: {
        metrics: {
          empathy: 4,
          clarity: 4,
          effectiveness: 4,
          appropriateness: 4,
          professionalism: 4,
          problem_solving: 4,
          overall: 4,
        },
        strengths: ["תקשורת טובה"],
        improvements: ["יכול להיות יותר ממוקד"],
        tips: ["נסה להיות יותר קצר"],
        comments: "תגובה טובה באופן כללי",
        suggestions: ["המשך לתרגל"],
        score: 85,
        overallProgress: {
          score: 85,
          level: "מתקדם",
          nextLevel: "מומחה",
          requiredScore: 90,
        },
      },
    };

    render(
      <MessageList
        messages={[messageWithFeedback]}
        expandedFeedback={[messageWithFeedback.id]}
        onToggleFeedback={() => undefined}
      />
    );

    expect(screen.getByText("תגובה טובה באופן כללי")).toBeInTheDocument();
  });
});
