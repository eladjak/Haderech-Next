"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulatorScenario } from "@/types/simulator";

interface ScenarioSelectorProps {
  scenarios: SimulatorScenario[];
  selectedScenario: SimulatorScenario | undefined;
  onSelect: (scenario: SimulatorScenario) => void;
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
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground">
                {scenario.description}
              </p>
              {scenario.learning_objectives &&
                scenario.learning_objectives.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scenario.learning_objectives.map((objective, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {objective}
                      </span>
                    ))}
                  </div>
                )}
              {/* אם אין learning_objectives אבל יש objectives רגילים, נציג אותם במקום */}
              {(!scenario.learning_objectives ||
                scenario.learning_objectives.length === 0) &&
                scenario.objectives &&
                scenario.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scenario.objectives.map((objective, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {objective}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </Card>
        ))}
      </div>

      {selectedScenario && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => onSelect(selectedScenario)}>
            התחל תרגול
          </Button>
        </div>
      )}
    </div>
  );
}
