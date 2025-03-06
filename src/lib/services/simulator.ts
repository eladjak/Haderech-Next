import { v4 as uuidv4 } from "uuid";
import { FEEDBACK_CRITERIA, SCENARIO_TYPES } from "@/constants/simulator";
import { config } from "@/lib/config";
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

/**
 * Start a new simulation session
 * @param scenario The scenario to start
 * @param userId The user ID
 * @returns A new simulation session
 */
export async function startSimulation(
  scenario: SimulatorScenario,
  userId: string
): Promise<SimulatorSession> {
  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  const initialMessage: Message = {
    id: uuidv4(),
    role: "assistant",
    content: scenario.initial_message || "ברוך הבא לסימולציה!",
    timestamp,
    sender: {
      id: "system",
      role: "assistant",
      name: "מנחה הסימולציה",
    },
    created_at: timestamp,
    updated_at: timestamp,
  };

  const session: SimulatorSession = {
    id: sessionId,
    user_id: userId,
    scenario_id: scenario.id,
    scenario,
    status: "running",
    state: {
      id: sessionId,
      user_id: userId,
      scenario_id: scenario.id,
      scenario,
      status: "running",
      state: "initial",
      messages: [initialMessage],
      created_at: timestamp,
      updated_at: timestamp,
    },
    messages: [initialMessage],
    created_at: timestamp,
    updated_at: timestamp,
  };

  // כאן ניתן להוסיף לוגיקה לשמירת הסשן בדאטאבייס
  console.log("Starting simulation:", sessionId);

  return session;
}

/**
 * Process a user message in a simulation
 * @param session The current simulation session
 * @param message The user message
 * @returns Updated simulation session
 */
export async function processUserMessage(
  session: SimulatorSession,
  message: string
): Promise<SimulatorSession> {
  const timestamp = new Date().toISOString();

  // יצירת הודעת משתמש חדשה
  const userMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: message,
    timestamp,
    sender: {
      id: session.user_id,
      role: "user",
      name: "משתמש",
    },
    created_at: timestamp,
    updated_at: timestamp,
  };

  // הוספת ההודעה לסשן
  const updatedSession = {
    ...session,
    messages: [...session.messages, userMessage],
    state: {
      ...session.state,
      messages: [...session.state.messages, userMessage],
      updated_at: timestamp,
    },
    updated_at: timestamp,
  };

  // כאן ניתן להוסיף לוגיקה לתגובת המערכת להודעה
  console.log("Processing message for session:", session.id);

  return updatedSession;
}

/**
 * Save simulation results
 * @param session The simulation session to save
 * @returns Success status
 */
export async function saveSimulationResults(
  session: SimulatorSession
): Promise<boolean> {
  // כאן ניתן להוסיף לוגיקה לשמירת תוצאות הסימולציה בדאטאבייס
  console.log("Saving simulation results for session:", session.id);

  return true;
}

// יוצר אובייקט שירות עם כל הפונקציות
export const simulatorService: SimulatorService = {
  sendMessage,
  getScenarios,
  resetChat,
};
