"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { SimulatorScenario, SimulatorState } from "@/types/simulator";

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

// הרכיב הראשי
export interface SimulatorClientProps {
  initialScenario?: SimulatorScenario;
}

export function SimulatorClient({ initialScenario }: SimulatorClientProps) {
  const [selectedScenario, setSelectedScenario] = useState<
    SimulatorScenario | undefined
  >(initialScenario);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulatorState | null>(
    null
  );

  // דוגמאות לתרחישים - בהמשך יבואו מ-API
  const scenarios: SimulatorScenario[] = [
    {
      id: "js-basics",
      title: "יסודות JavaScript",
      description: "התמודדות עם טיפוסי משתנים, לולאות ופונקציות בסיסיות",
      steps: [
        {
          prompt: "מהו הפלט של הקוד הבא: console.log(2 + '2');",
          options: ["4", "'22'", "22", "TypeError"],
          correctResponses: ["22"],
        },
        {
          prompt: "איזו שיטה משמשת להוספת פריט לסוף מערך?",
          options: [
            "array.push()",
            "array.pop()",
            "array.unshift()",
            "array.shift()",
          ],
          correctResponses: ["array.push()"],
        },
        {
          prompt: "מהו ערך המשתנה x בסוף הקוד הבא: let x = 5; x += 3; x *= 2;",
          options: ["5", "8", "16", "10"],
          correctResponses: ["16"],
        },
      ],
    },
    {
      id: "react-basics",
      title: "יסודות React",
      description: "עבודה עם קומפוננטות, hooks ותכונות בסיסיות",
      steps: [
        {
          prompt: "איזה hook משמש לניהול מצב (state) בקומפוננטת פונקציה?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctResponses: ["useState"],
        },
        {
          prompt: "מהי הדרך הנכונה לעדכן state שתלוי בערך הקודם?",
          options: [
            "setState(state + 1)",
            "setState(state)",
            "setState(prevState => prevState + 1)",
            "setState(function() { return state + 1 })",
          ],
          correctResponses: ["setState(prevState => prevState + 1)"],
        },
        {
          prompt: "מתי useEffect עם מערך dependencies ריק ([]) ירוץ?",
          options: [
            "בכל רינדור של הקומפוננטה",
            "רק בפעם הראשונה שהקומפוננטה עולה",
            "אף פעם",
            "רק כאשר הקומפוננטה מתעדכנת",
          ],
          correctResponses: ["רק בפעם הראשונה שהקומפוננטה עולה"],
        },
      ],
    },
  ];

  const handleStartSimulation = () => {
    if (selectedScenario) {
      setSimulationStarted(true);
    }
  };

  const handleCompleteSimulation = (state: SimulatorState) => {
    setSimulationState(state);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">מדמה תרחישי קוד</h1>

      {!simulationStarted ? (
        <>
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelect={setSelectedScenario}
          />
          <Button
            onClick={handleStartSimulation}
            disabled={!selectedScenario}
            size="lg"
          >
            התחל סימולציה
          </Button>
        </>
      ) : (
        selectedScenario && (
          <ChatSimulator
            scenario={selectedScenario}
            onComplete={handleCompleteSimulation}
          />
        )
      )}
    </div>
  );
}
