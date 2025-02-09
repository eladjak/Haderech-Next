"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SimulationScenario } from "@/types/simulator";

interface ScenarioSelectorProps {
  scenarios: SimulationScenario[];
  selectedScenario: SimulationScenario | undefined;
  onSelect: (scenario: SimulationScenario) => void;
}

export function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelect,
}: ScenarioSelectorProps): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">בחר תרחיש לתרגול</h2>
        <p className="text-muted-foreground">
          בחר את התרחיש שברצונך לתרגל מתוך האפשרויות הבאות
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
              selectedScenario?.id === scenario.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelect(scenario)}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{scenario.title}</h3>
              <Badge variant="outline">{scenario.difficulty}</Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {scenario.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{scenario.category}</Badge>
              <Badge variant="secondary">
                {scenario.learningObjectives.length} מטרות למידה
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {selectedScenario && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => onSelect(selectedScenario)}
          >
            התחל תרגול
          </Button>
        </div>
      )}
    </div>
  );
}

export type { ScenarioSelectorProps };
