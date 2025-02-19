import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import {
  Message,
  MessageFeedback,
  SimulatorScenario,
  SimulatorState,
} from "@/types/simulator";

import { ChatSimulator } from "../ChatSimulator";

// Mock the scrollIntoView function
const mockScrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe("ChatSimulator", () => {
  const mockScenario: SimulatorScenario = {
    id: "1",
    title: "Test Scenario",
    description: "Test Description",
    difficulty: "beginner",
    category: "test",
    initial_message: "Initial message",
    learning_objectives: ["test"],
    success_criteria: {
      minScore: 80,
      requiredSkills: ["test"],
      minDuration: 300,
      maxDuration: 900,
    },
  };

  const mockMessage: Message = {
    id: "1",
    role: "user",
    content: "Test message",
    timestamp: new Date().toISOString(),
    sender: {
      id: "1",
      role: "user",
      name: "Test User",
    },
  };

  const mockFeedback: MessageFeedback = {
    score: 80,
    message: "Good job!",
    details: {
      metrics: {
        empathy: 80,
        clarity: 80,
        effectiveness: 80,
        appropriateness: 80,
        professionalism: 80,
        problem_solving: 80,
      },
      score: 80,
      empathy: 80,
      clarity: 80,
      effectiveness: 80,
      appropriateness: 80,
      professionalism: 80,
      problem_solving: 80,
      strengths: ["test"],
      improvements: ["test"],
      tips: ["test"],
      comments: ["test comment"],
      suggestions: ["test"],
      overallProgress: {
        score: 80,
        level: "beginner",
        progress: 50,
        nextLevel: "intermediate",
        requiredScore: 100,
      },
    },
    comments: ["test"],
    suggestions: ["test"],
  };

  const mockState: SimulatorState = {
    scenario: mockScenario,
    messages: [mockMessage],
    status: "active",
    feedback: {
      score: 80,
      message: "Good job!",
      details: {
        metrics: {
          empathy: 80,
          clarity: 80,
          effectiveness: 80,
          appropriateness: 80,
          professionalism: 80,
          problem_solving: 80,
        },
        strengths: ["test"],
        improvements: ["test"],
        tips: ["test"],
        comments: "test comment",
        suggestions: ["test"],
        overallProgress: {
          score: 80,
          level: "beginner",
          nextLevel: "intermediate",
          requiredScore: 100,
        },
      },
      comments: ["test"],
      suggestions: ["test"],
    },
    settings: {
      difficulty: "beginner",
      language: "he",
      feedback_frequency: "always",
      auto_suggestions: true,
    },
    stats: {
      total_scenarios: 1,
      completed_scenarios: 0,
      average_score: 0,
      total_messages: 1,
      practice_time: 0,
      strengths: ["test"],
      areas_for_improvement: ["test"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("מציג את פרטי התרחיש", () => {
    render(
      <ChatSimulator
        state={mockState}
        onMessage={async () => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText(mockScenario.title)).toBeInTheDocument();
    expect(screen.getByText(mockScenario.description)).toBeInTheDocument();
  });

  it("מציג את ההודעות", () => {
    render(
      <ChatSimulator
        state={mockState}
        onMessage={async () => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText(mockMessage.content)).toBeInTheDocument();
  });

  it("שולח הודעה בעת שליחת הטופס", async () => {
    const onMessage = vi.fn().mockImplementation(async () => {});
    render(
      <ChatSimulator
        state={mockState}
        onMessage={onMessage}
        isLoading={false}
      />
    );

    const input = screen.getByRole("textbox");
    const form = screen.getByRole("form");

    fireEvent.change(input, { target: { value: "הודעה חדשה" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith("הודעה חדשה");
    });
  });

  it("מנטרל את הקלט ואת כפתור השליחה בזמן טעינה", () => {
    render(
      <ChatSimulator
        state={mockState}
        onMessage={async () => {}}
        isLoading={true}
      />
    );

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button", { name: /שלח/i });

    expect(input).toHaveAttribute("disabled");
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("מגביל את אורך ההודעה ל-1000 תווים", async () => {
    const onMessage = vi.fn().mockImplementation(async () => {});
    render(
      <ChatSimulator
        state={mockState}
        onMessage={onMessage}
        isLoading={false}
      />
    );

    const input = screen.getByRole("textbox");
    const form = screen.getByRole("form");
    const longMessage = "א".repeat(1001);

    fireEvent.change(input, { target: { value: longMessage } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onMessage).not.toHaveBeenCalled();
    });
  });
});
