"use client";

import { ChatHeader, describe, expect, it, render, screen } from "@/lib/utils";
import type { SimulatorScenario } from "@/types/simulator";

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
    maxDuration: 900,
  },
  created_at: new Date.toISOString(),
  updated_at: new Date.toISOString(),
};

describe("ChatHeader", () => {
  it("should render scenario title", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(mockScenario.title)).toBeInTheDocument();
  });

  it("should render scenario description", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(mockScenario.description)).toBeInTheDocument();
  });

  it("should render scenario difficulty", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(/מתחיל/i)).toBeInTheDocument();
  });

  it("should render scenario category", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(mockScenario.category)).toBeInTheDocument();
  });

  it("should render scenario tags", () => {
    render(<ChatHeader scenario={mockScenario} />);
    mockScenario.tags?.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("applies correct styles", () => {
    const { container } = render(<ChatHeader scenario={mockScenario} />);
    expect(container.firstChild).toHaveClass("border-b");
  });
});
