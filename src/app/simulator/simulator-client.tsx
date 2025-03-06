"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { SimulatorScenario, SimulatorState } from "@/types/simulator";

export {};

// פשוט נכתוב את הרכיבים ישירות בקובץ זה עד שנצליח לבנות
function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelect,
}: {
  scenarios: SimulatorScenario[];
  selectedScenario?: SimulatorScenario;
  onSelect: (scenario: SimulatorScenario) => void;
}) {
  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-xl font-bold">בחר תרחיש סימולציה</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer p-4 transition-all hover:shadow-md ${
              selectedScenario?.id === scenario.id
                ? "border-primary bg-primary/5"
                : ""
            }`}
            onClick={() => onSelect(scenario)}
          >
            <h3 className="mb-2 font-semibold">{scenario.title}</h3>
            <p className="text-sm text-muted-foreground">
              {scenario.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChatSimulator({
  scenario,
  onComplete,
}: {
  scenario: SimulatorScenario;
  onComplete: (state: SimulatorState) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [simulationState, setSimulationState] = useState<SimulatorState>({
    scenarioId: scenario.id,
    completed: false,
    score: 0,
    feedback: "",
    userResponses: [],
  });
  const { toast } = useToast();

  const currentQuestion =
    currentStep < scenario.steps.length ? scenario.steps[currentStep] : null;

  const handleContinue = () => {
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // סיום הסימולציה
      const finalState: SimulatorState = {
        ...simulationState,
        completed: true,
        score: calculateScore(),
        feedback: generateFeedback(),
      };

      setSimulationState(finalState);
      onComplete(finalState);

      toast({
        title: "הסימולציה הסתיימה",
        description: `השגת ניקוד של ${finalState.score}%.`,
      });
    }
  };

  const handleOptionSelect = (option: string) => {
    const newResponses = [...userResponses];
    newResponses[currentStep] = option;
    setUserResponses(newResponses);

    setSimulationState({
      ...simulationState,
      userResponses: newResponses,
    });
  };

  const calculateScore = () => {
    // אלגוריתם פשוט לחישוב ציון
    let correctAnswers = 0;

    scenario.steps.forEach((step, index) => {
      const userResponse = userResponses[index];
      if (
        userResponse &&
        step.correctResponses &&
        step.correctResponses.includes(userResponse)
      ) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / scenario.steps.length) * 100);
  };

  const generateFeedback = () => {
    const score = calculateScore();
    if (score >= 90) {
      return "מצוין! הראית מיומנות גבוהה בפתרון האתגר.";
    } else if (score >= 70) {
      return "טוב מאוד! יש לך הבנה טובה של החומר, עם מעט מקום לשיפור.";
    } else if (score >= 50) {
      return "טוב. כדאי לחזור על חלק מהחומר כדי לשפר את הידע שלך.";
    } else {
      return "יש מקום לשיפור. מומלץ לחזור על החומר ולנסות שוב.";
    }
  };

  if (simulationState.completed) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">סיכום הסימולציה</h2>
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            ציון: {simulationState.score}%
          </h3>
          <p className="mb-6">{simulationState.feedback}</p>
          <Button onClick={() => window.location.reload()}>התחל מחדש</Button>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Error: No question available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{scenario.title}</h2>
        <span className="text-muted-foreground">
          שלב {currentStep + 1} מתוך {scenario.steps.length}
        </span>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">{currentQuestion.prompt}</h3>

        {currentQuestion.options && (
          <div className="mb-6 space-y-2">
            {currentQuestion.options.map((option) => (
              <div
                key={option}
                className={`cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent ${
                  userResponses[currentStep] === option
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!userResponses[currentStep]}
          className="mt-4"
        >
          {currentStep < scenario.steps.length - 1 ? "המשך" : "סיים סימולציה"}
        </Button>
      </Card>
    </div>
  );
}

// דוגמאות לתרחישי סימולציה
const EXAMPLE_SCENARIOS: SimulatorScenario[] = [
  {
    id: "1",
    title: "שיחה עם לקוח כועס",
    description: "תרגול טיפול בלקוח לא מרוצה",
    difficulty: "intermediate",
    category: "שירות לקוחות",
    initial_message: "שלום, אני מאוד מאוכזב מהמוצר שקיבלתי אתמול.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "ראיון עבודה",
    description: "תרגול ראיון למשרת פיתוח",
    difficulty: "advanced",
    category: "קריירה",
    initial_message: "שלום, אני שמח לראיין אותך היום. ספר לי קצת על עצמך.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
            scenario={selectedScenario!}
            onComplete={handleEndSimulation}
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
