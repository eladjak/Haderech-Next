import React from "react";
import type { SimulatorScenario } from "@/types/simulator";

interface ChatHeaderProps {
  scenario: SimulatorScenario;
}

export function ChatHeader({ scenario }: ChatHeaderProps): React.ReactElement {
  const hasTags = scenario.tags && scenario.tags.length > 0;

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div>
        <h2 className="text-lg font-semibold">{scenario.title}</h2>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
        <div className="mt-2">
          <span className="mr-2 text-xs font-medium text-blue-600">
            {scenario.category}
          </span>
          <span className="text-xs font-medium text-green-600">
            {scenario.difficulty === "beginner"
              ? "מתחיל"
              : scenario.difficulty === "intermediate"
                ? "בינוני"
                : scenario.difficulty === "advanced"
                  ? "מתקדם"
                  : "מומחה"}
          </span>
          {hasTags && (
            <div className="mt-1">
              {scenario.tags!.map((tag) => (
                <span
                  key={tag}
                  className="mb-1 mr-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
