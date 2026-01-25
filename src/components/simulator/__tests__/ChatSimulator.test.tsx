import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSimulator } from "../ChatSimulator";
import type {
  Message,
  SimulatorScenario,
  SimulatorState,
} from "@/types/simulator";


const mockScenario: SimulatorScenario = {
  id: "1",
  title: "תרחיש בדיקה",
  description: "תרחיש לבדיקת המערכת",
  difficulty: "beginner",
  category: "תקשורת",
  tags: ["תקשורת", "אמפתיה"],
  initial_message: "שלום, איך אני יכול לעזור?",
  learning_objectives: ["שיפור תקשורת", "הבנת צרכי המשתמש"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["תקשורת", "אמפתיה"],
    minDuration: 300,
    maxDuration: 900,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMessage: Message = {
  id: "1",
  role: "user",
  content: "שלום, אני צריך עזרה",
  timestamp: new Date().toISOString(),
  sender: {
    id: "1",
    name: "משתמש",
    role: "user",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockState: SimulatorState = {
  id: "1",
  user_id: "1",
  scenario_id: "1",
  scenario: mockScenario,
  status: "idle",
  state: "initial",
  messages: [mockMessage],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("ChatSimulator", () => {
  const mockSendMessage = vi
    .fn()
    .mockImplementation(async (message: string) => {
      console.log("Message sent:", message);
    });

  const mockReset = vi.fn().mockImplementation(() => {
    console.log("Simulator reset");
  });

  it("renders correctly", () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockSendMessage}
        onReset={mockReset}
        isLoading={false}
        showFeedback={true}
      />
    );

    expect(screen.getByText("שלום, אני צריך עזרה")).toBeInTheDocument();
  });

  it("handles message input correctly", () => {
    const handleSendMessage = vi.fn();
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={handleSendMessage}
        onReset={mockReset}
        isLoading={false}
        showFeedback={true}
      />
    );

    const input = screen.getByPlaceholderText("הקלד הודעה...");
    expect(input).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockSendMessage}
        onReset={mockReset}
        isLoading={true}
        showFeedback={true}
      />
    );

    const input = screen.getByPlaceholderText("הקלד הודעה...");
    expect(input).toBeDisabled();
  });
});
