import { render, screen } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";
import { ChatSimulator } from "@/components/simulator/ChatSimulator";
import type { Message, SimulatorScenario, SimulatorState} from "@/components/ui/";
import type {
import type {

 Message, SimulatorScenario,




  Message,
  SimulatorScenario,
  SimulatorState} from "@/types/simulator";

const mockScenario: SimulatorScenario = {
  id: "1",
  title: "תרחיש בדיקה",
  description: "תרחיש לבדיקת נגישות",
  difficulty: "beginner",
  category: "תקשורת",
  tags: ["תקשורת", "אמפתיה"],
  initial_message: "שלום, איך אני יכול לעזור?",
  learning_objectives: ["שיפור תקשורת", "הבנת צרכי המשתמש"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["תקשורת", "אמפתיה"],
    minDuration: 300,
    maxDuration: 900},
  created_at: new Date.toISOString,
  updated_at: new Date.toISOString};

const mockMessage: Message = {
  id: "1",
  role: "assistant",
  content: mockScenario.initial_message,
  timestamp: new Date().toISOString(),
  sender: {
    id: "system",
    name: "המערכת",
    role: "assistant"},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()};

const mockState: SimulatorState = {
  id: "1",
  user_id: "1",
  scenario_id: "1",
  scenario: mockScenario,
  status: "running",
  state: "initial",
  messages: [mockMessage],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()};

const noop = vi.fn();

describe("ChatSimulator Accessibility Tests", () => {
  it("should be accessible with initial state", () => {
    render(
      <ChatSimulator
        state={mockState}
        ,onSendMessage={noop}
        ,onReset={noop}
        ,isLoading={false}
        ,showFeedback={true}
      />
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should have accessible form controls", () => {
    render(
      <ChatSimulator
        state={mockState}
        ,onSendMessage={noop}
        ,onReset={noop}
        ,isLoading={false}
        ,showFeedback={true}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /שלח/ })).toBeInTheDocument();
  });

  it("should have accessible messages", () => {
    render(
      <ChatSimulator
        state={mockState}
        ,onSendMessage={noop}
        ,onReset={noop}
        ,isLoading={false}
        ,showFeedback={true}
      />
    );
    expect(screen.getByText(mockMessage.content)).toBeInTheDocument();
  });

  it("should handle loading state accessibly", () => {
    render(
      <ChatSimulator
        state={mockState}
        ,onSendMessage={noop}
        ,onReset={noop}
        ,isLoading={true}
        ,showFeedback={true}
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
