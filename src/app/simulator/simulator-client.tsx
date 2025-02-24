"use client";

import React, { useState } from "react";

import { ChatSimulator } from "@/components/simulator/ChatSimulator";
import { ScenarioSelector } from "@/components/simulator/ScenarioSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { EXAMPLE_SCENARIOS } from "@/constants/simulator";
import type { SimulatorScenario, SimulatorState } from "@/types/simulator";

interface SimulatorClientProps {
  initialScenario?: SimulatorScenario;
}

export default function SimulatorClient({
  initialScenario,
}: SimulatorClientProps): React.ReactElement {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<
    SimulatorScenario | undefined
  >(initialScenario);
  const [simulationState, setSimulationState] = useState<
    SimulatorState | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const handleScenarioSelect = (scenario: SimulatorScenario): void => {
    setSelectedScenario(scenario);
    setSimulationState(undefined);
  };

  const handleStartSimulation = async (): Promise<void> => {
    if (!selectedScenario) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/simulator/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start simulation");
      }

      const state = await response.json();
      setSimulationState(state);
    } catch (error) {
      console.error("Error starting simulation:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהתחלת הסימולציה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!simulationState) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/simulator/message", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: simulationState,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process message");
      }

      const newState = await response.json();
      setSimulationState(newState);
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעיבוד ההודעה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSimulation = async (): Promise<void> => {
    if (!simulationState) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/simulator/save", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: simulationState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save simulation");
      }

      setSimulationState(undefined);
      setSelectedScenario(undefined);
      toast({
        title: "הצלחה",
        description: "הסימולציה הסתיימה ונשמרה בהצלחה.",
      });
    } catch (error) {
      console.error("Error saving simulation:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הסימולציה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (): void => {
    setSimulationState(undefined);
  };

  return (
    <div className="space-y-8">
      {!simulationState && (
        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-semibold">בחר תרחיש</h2>
          <ScenarioSelector
            scenarios={EXAMPLE_SCENARIOS}
            selectedScenario={selectedScenario}
            onSelect={handleScenarioSelect}
          />
          {selectedScenario && (
            <div className="mt-4">
              <Button
                onClick={handleStartSimulation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "מתחיל..." : "התחל סימולציה"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {simulationState && (
        <div className="space-y-4">
          <ChatSimulator
            state={simulationState}
            onSendMessage={handleSendMessage}
            onReset={handleReset}
            isLoading={isLoading}
            showFeedback={true}
          />
          <Button
            onClick={handleEndSimulation}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            סיים סימולציה
          </Button>
        </div>
      )}
    </div>
  );
}
