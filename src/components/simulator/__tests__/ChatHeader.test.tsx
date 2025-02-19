import { render, screen } from "@testing-library/react";

import type { SimulatorScenario } from "@/types/simulator";

import { ChatHeader } from "../ChatHeader";

describe("ChatHeader", () => {
  const mockScenario: SimulatorScenario = {
    id: "1",
    title: "תרחיש בדיקה",
    description: "תרחיש לבדיקת הצ'אט",
    difficulty: "beginner",
    category: "כללי",
    initial_message: "שלום, במה אוכל לעזור?",
    suggested_responses: ["תודה", "אני מבין", "אוכל לעזור?"],
    learning_objectives: ["אמפתיה", "הקשבה"],
    success_criteria: {
      minScore: 70,
      requiredSkills: ["אמפתיה", "הקשבה"],
      minDuration: 60,
      maxDuration: 300,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("renders scenario title", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(mockScenario.title)).toBeInTheDocument();
  });

  it("renders scenario description", () => {
    render(<ChatHeader scenario={mockScenario} />);
    expect(screen.getByText(mockScenario.description)).toBeInTheDocument();
  });

  it("applies correct styles", () => {
    const { container } = render(<ChatHeader scenario={mockScenario} />);
    expect(container.firstChild).toHaveClass("border-b");
  });
});
