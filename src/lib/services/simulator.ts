import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from "@/types/api";
import {
  Message,
  SimulatorResponse,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

export interface SimulatorService {
  sendMessage: (
    message: string,
    scenarioId: string
  ) => Promise<ApiResponse<Message>>;
  getScenarios: () => Promise<ApiResponse<SimulatorScenario[]>>;
  resetChat: (scenarioId: string) => Promise<ApiResponse<boolean>>;
}

// פונקציות הדמה לסימולטור - למטרות בנייה בלבד
export async function getScenarioById(
  id: string
): Promise<SimulatorScenario | null> {
  console.log("Mock getScenarioById called with ID:", id);
  // גרסה מדומה שמחזירה אובייקט קבוע
  return {
    id,
    title: "תרחיש לדוגמה",
    description: "זהו תרחיש הדגמה למטרות בדיקה",
    difficulty: "קל",
    category: "כללי",
    initialMessage: "שלום! זהו תרחיש הדגמה. כיצד אני יכול לעזור לך?",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getScenarios(): Promise<
  ApiResponse<SimulatorScenario[]>
> {
  const mockScenarios: SimulatorScenario[] = [
    {
      id: "1",
      title: "תרחיש 1",
      description: "תיאור של תרחיש 1",
      difficulty: "קל",
      category: "קבלת החלטות",
      initialMessage: "ברוכים הבאים לתרחיש 1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "תרחיש 2",
      description: "תיאור של תרחיש 2",
      difficulty: "בינוני",
      category: "ניהול משברים",
      initialMessage: "ברוכים הבאים לתרחיש 2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    data: mockScenarios,
    status: "success",
    message: "תרחישים נטענו בהצלחה",
  };
}

export async function sendMessage(
  message: string,
  scenarioId: string
): Promise<ApiResponse<Message>> {
  console.log(
    `Mock sendMessage called with: "${message}" for scenario: ${scenarioId}`
  );

  // הדמיית תגובה מהשרת
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockResponse: Message = {
    id: uuidv4(),
    content: `זוהי תשובה מדומה להודעה: "${message}"`,
    role: "assistant",
    scenarioId,
    createdAt: new Date().toISOString(),
  };

  return {
    data: mockResponse,
    status: "success",
    message: "הודעה נשלחה בהצלחה",
  };
}

export async function resetChat(
  scenarioId: string
): Promise<ApiResponse<boolean>> {
  console.log(`Mock resetChat called for scenario: ${scenarioId}`);

  // הדמיית איפוס השיחה
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: true,
    status: "success",
    message: "השיחה אופסה בהצלחה",
  };
}

// יוצר אובייקט שירות עם כל הפונקציות
export const simulatorService: SimulatorService = {
  sendMessage,
  getScenarios,
  resetChat,
};
