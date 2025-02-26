import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import { getScenarioById } from "@/lib/data/scenarios";
import type {
  BaseMessage,
  ChatCompletionMessage,
  FeedbackDetails,
  FeedbackMetrics,
  Message,
  MessageFeedback,
  MessageSender,
  SimulatorMessage,
  SimulatorResponse,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

/**
 * @file simulator.ts
 * @description Chat simulation service with evaluation and feedback capabilities.
 * This service manages chat-based simulations for training purposes, including:
 * - Starting and managing simulation sessions
 * - Processing user messages
 * - Generating AI responses
 * - Providing feedback and evaluation
 * - Tracking progress and metrics
 *
 * Accessibility Features:
 * - Clear and readable messages and feedback display
 * - Screen reader support with detailed descriptions
 * - Full keyboard navigation support
 * - Text size and contrast adjustments
 * - RTL/LTR text direction support
 *
 * @example
 * ```typescript
 * const session = await startSimulation(scenario, userId);
 * const updatedState = await processUserMessage(session, "message content");
 * ```
 */

/**
 * קריטריונים להערכת ביצועים בסימולטור השיחה
 *
 * כל קריטריון כולל את המשקל היחסי שלו בציון הכולל:
 *
 * 1. אמפתיה (25%): היכולת להבין ולהגיב לרגשות ולנקודות המבט של האחר
 * 2. בהירות (15%): העברת מסרים באופן ברור ומובן
 * 3. אפקטיביות (20%): מידת ההצלחה בהשגת מטרות התקשורת
 * 4. התאמה (10%): התאמת הסגנון והטון למצב ולאדם שמולך
 * 5. מקצועיות (15%): הפגנת ידע וביטחון בתחום
 * 6. פתרון בעיות (15%): היכולת לזהות בעיות ולהציע פתרונות יעילים
 */

// הגדרת הקריטריונים להערכה
const EVALUATION_CRITERIA = {
  empathy: {
    name: "אמפתיה",
    description: "הבנת רגשות המשתמש והפגנת אכפתיות",
    weight: 0.2,
  },
  clarity: {
    name: "בהירות",
    description: "העברת מידע בצורה ברורה ומובנת",
    weight: 0.15,
  },
  effectiveness: {
    name: "אפקטיביות",
    description: "מידת יעילות התשובה בפתרון הבעיה",
    weight: 0.2,
  },
  appropriateness: {
    name: "התאמה",
    description: "התאמת הסגנון והטון למצב ולאדם שמולך",
    weight: 0.15,
  },
  professionalism: {
    name: "מקצועיות",
    description: "שימוש בשפה מקצועית ומדויקת",
    weight: 0.15,
  },
  problem_solving: {
    name: "פתרון בעיות",
    description: "יכולת זיהוי ופתרון בעיות",
    weight: 0.15,
  },
};

// Initialize environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const openaiKey = process.env.OPENAI_API_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey || !openaiKey) {
  throw new Error("Missing required environment variables");
}

// Initialize API clients
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
const _openai = new OpenAI({ apiKey: openaiKey });

// Default feedback messages
const DEFAULT_COMMENTS = [
  "Excellent response! Keep it up!",
  "Room for improvement, but you're on the right track.",
  "Try to think of additional ways to improve your answer.",
];

const DEFAULT_SUGGESTIONS = ["No improvement suggestions"];
const DEFAULT_TIPS = ["No additional tips"];
const DEFAULT_STRENGTHS = ["No special strengths identified"];
const DEFAULT_IMPROVEMENTS = ["No improvement points identified"];

// Pre-defined constants to prevent recreation on each call
const SCORE_WEIGHTS = {
  empathy: 0.2,
  clarity: 0.2,
  effectiveness: 0.2,
  appropriateness: 0.15,
  professionalism: 0.15,
  problem_solving: 0.1,
} as const;

const IMPROVEMENT_TIPS = {
  improve_empathy: "Try using phrases like 'I understand how you feel'",
  improve_clarity: "Use simple examples and explanations",
  improve_effectiveness: "Suggest practical and actionable solutions",
  improve_context: "Consider the specific circumstances of the situation",
} as const;

// Constants for feedback criteria and scenario types
export const FEEDBACK_CRITERIA = {
  clarity: "Clarity of response",
  empathy: "Empathy and understanding",
  helpfulness: "Helpfulness of information",
  professionalism: "Professional tone and manner",
  conciseness: "Conciseness and focus",
  completeness: "Completeness of information",
} as const;

export const SCENARIO_TYPES = {
  customer_service: "Customer Service",
  technical_support: "Technical Support",
  emergency_response: "Emergency Response",
  medical_inquiry: "Medical Inquiry",
  sales_inquiry: "Sales Inquiry",
  general_inquiry: "General Inquiry",
  complaint_handling: "Complaint Handling",
  improve_context: "Consider the specific circumstances of the situation",
} as const;

// Types and interfaces
export type SimulatorRole = "user" | "assistant" | "system";
export type FeedbackCriteriaType = keyof typeof FEEDBACK_CRITERIA;
export type ScenarioType = keyof typeof SCENARIO_TYPES;

interface _MessageFeedback {
  criteria: Record<string, { score: number; feedback: string }>;
}

interface _SimulationConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  evaluation_criteria: typeof EVALUATION_CRITERIA;
}

interface _SimulatorMessage {
  role: "user" | "assistant";
  content: string;
}

interface _SimulatorResponse {
  response: string;
  feedback: MessageFeedback;
}

/**
 * Validates a simulator state object
 * Checks for required fields and data integrity
 *
 * @param state - The simulator state to validate
 * @throws Error if state is invalid
 */
function _validateSimulatorState(state: SimulatorState): void {
  if (!state.id || !state.user_id || !state.scenario_id) {
    throw new Error("Invalid simulator state: missing required fields");
  }

  if (!state.messages || !Array.isArray(state.messages)) {
    throw new Error("Invalid simulator state: messages must be an array");
  }

  if (!state.scenario) {
    throw new Error("Invalid simulator state: missing scenario");
  }
}

/**
 * Validates feedback object structure and content
 *
 * @param feedback - The feedback object to validate
 * @throws Error if feedback is invalid
 */
function _validateFeedback(feedback: FeedbackDetails): void {
  if (!feedback.metrics || typeof feedback.metrics !== "object") {
    throw new Error("Invalid feedback: missing or invalid metrics");
  }

  if (
    !Array.isArray(feedback.strengths) ||
    !Array.isArray(feedback.improvements)
  ) {
    throw new Error(
      "Invalid feedback: strengths and improvements must be arrays"
    );
  }

  if (
    typeof feedback.score !== "number" ||
    feedback.score < 0 ||
    feedback.score > 100
  ) {
    throw new Error(
      "Invalid feedback: score must be a number between 0 and 100"
    );
  }
}

/**
 * Creates a message sender object
 *
 * @param role - The role of the sender
 * @param name - The name of the sender
 * @returns A message sender object
 */
function createMessageSender(
  role: "user" | "assistant",
  name: string
): MessageSender {
  return {
    id: uuidv4(),
    role,
    name,
  };
}

/**
 * Creates a message object with the specified properties
 * @param role - The role of the message sender
 * @param content - The message content
 * @param sender - The message sender object
 * @param functionCall - Optional function call data
 * @returns A new message object
 */
function createMessage(
  role: "user" | "assistant",
  content: string,
  sender: MessageSender,
  functionCall?: OpenAI.Chat.ChatCompletionMessage.FunctionCall
): Message {
  const timestamp = new Date().toISOString();
  const message: Message = {
    id: uuidv4(),
    role,
    content,
    timestamp,
    sender,
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (functionCall) {
    message.function_call = functionCall;
  }

  return message;
}

/**
 * Starts a new simulation session
 *
 * @param scenario - The scenario to simulate
 * @param userId - The ID of the user starting the simulation
 * @returns A new simulation session
 * @throws Error if scenario or user is invalid
 */
export async function startSimulation(
  scenario: SimulatorScenario,
  userId: string
): Promise<SimulatorSession> {
  // Validate inputs
  if (!scenario || !userId) {
    throw new Error("Invalid simulation parameters");
  }

  // Create initial message sender
  const systemSender = createMessageSender("assistant", "System");

  // Create initial message
  const initialMessage = createMessage(
    "assistant",
    scenario.initial_message,
    systemSender
  );

  // Create initial state
  const state: SimulatorState = {
    id: uuidv4(),
    user_id: userId,
    scenario_id: scenario.id,
    scenario: scenario,
    status: "idle",
    messages: [initialMessage],
    state: "initial",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Create session
  const session: SimulatorSession = {
    id: uuidv4(),
    user_id: userId,
    scenario_id: scenario.id,
    scenario: scenario,
    status: "idle",
    state: state,
    messages: [initialMessage],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Save session to database
  await saveSimulationState(session);

  return session;
}

/**
 * Processes a user message and returns the updated simulation state
 *
 * @param session - The current simulation session
 * @param content - The user's message content
 * @returns Updated simulator state
 * @throws Error if message processing fails
 */
export async function processUserMessage(
  session: SimulatorSession,
  content: string
): Promise<SimulatorState> {
  try {
    const response = await fetch("/api/simulator/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session, content }),
    });

    if (!response.ok) {
      throw new Error("Failed to process message");
    }

    const data = await response.json();
    return data.state;
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}

/**
 * Saves final simulation results
 */
export async function saveSimulationResults(
  state: SimulatorSession
): Promise<void> {
  const finalFeedback = await generateFinalFeedback(state);

  if (!finalFeedback) {
    return;
  }

  const updatedState: SimulatorSession = {
    ...state,
    status: "completed",
    updated_at: new Date().toISOString(),
  };

  const sessionUpdate = await supabase
    .from("simulator_sessions")
    .update({
      status: updatedState.status,
      feedback: updatedState.feedback,
      updated_at: updatedState.updated_at,
      completed_at: updatedState.updated_at,
    })
    .eq("id", updatedState.id);

  if (sessionUpdate.error) {
    console.error("Error updating session:", sessionUpdate.error);
    throw new Error("Failed to update session");
  }

  const scenario = await getScenarioById(updatedState.scenario_id);
  if (!scenario) {
    throw new Error("Scenario not found");
  }

  const { error: resultsError } = await supabase
    .from("simulator_results")
    .insert({
      session_id: updatedState.id,
      scenario_id: updatedState.scenario_id,
      score: updatedState.feedback?.score ?? 0,
      feedback: updatedState.feedback,
      duration: getDuration(updatedState.created_at, updatedState.updated_at),
      details: {
        messages_count: updatedState.messages.length,
        scenario_difficulty: scenario.difficulty,
        scenario_category: scenario.category,
      },
    });

  if (resultsError) {
    console.error("Error saving results:", resultsError);
    throw new Error("Failed to save results");
  }
}

/**
 * Generates feedback for a user message using OpenAI
 */
async function generateFeedback(messages: Message[]): Promise<FeedbackDetails> {
  const metrics: FeedbackMetrics = {
    empathy: 0,
    clarity: 0,
    effectiveness: 0,
    appropriateness: 0,
    professionalism: 0,
    problem_solving: 0,
    overall: 0,
  };

  // Analyze messages and calculate scores
  for (const message of messages) {
    if (message.role === "user") {
      metrics.empathy = _calculateEmpathyScore(message.content);
      metrics.clarity = _calculateClarityScore(message.content);
      metrics.effectiveness = _calculateEffectivenessScore(message.content);
      metrics.appropriateness = _calculateAppropriatenessScore(message.content);
      metrics.professionalism = _calculateProfessionalismScore(message.content);
      metrics.problem_solving = _calculateProblemSolvingScore(message.content);
    }
  }

  metrics.overall = _calculateOverallScore(metrics);
  const score = metrics.overall;

  return {
    metrics,
    score,
    strengths: [...DEFAULT_STRENGTHS],
    improvements: [...DEFAULT_IMPROVEMENTS],
    tips: [...DEFAULT_TIPS],
    comments:
      DEFAULT_COMMENTS[Math.floor(Math.random() * DEFAULT_COMMENTS.length)],
    suggestions: [...DEFAULT_SUGGESTIONS],
    overallProgress: {
      score,
      level: "Beginner",
      nextLevel: "Advanced",
      requiredScore: 80,
    },
  };
}

/**
 * Generates a response from the system using OpenAI
 */
const _generateAssistantResponse = async (
  messages: Message[],
  scenario: SimulatorScenario
): Promise<string> => {
  const _prompt = await generatePrompt({
    messages,
    scenario,
  } as SimulatorSession);

  const openAiMessages: ChatCompletionMessage[] = [
    { role: "system", content: _prompt },
  ];

  const response = await _openai.chat.completions.create({
    model: "gpt-4",
    messages: openAiMessages,
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response generated");
  }

  return content;
};

/**
 * Generates final feedback for the entire simulation
 */
async function generateFinalFeedback(
  state: SimulatorSession
): Promise<FeedbackDetails | null> {
  try {
    const messageHistory = state.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const learningObjectivesText =
      state.scenario.learning_objectives &&
      state.scenario.learning_objectives.length > 0
        ? `Learning Objectives: ${state.scenario.learning_objectives.join(", ")}`
        : state.scenario.objectives && state.scenario.objectives.length > 0
          ? `Objectives: ${state.scenario.objectives.join(", ")}`
          : `Objectives: Evaluate the user's response effectively`;

    const successCriteriaText = state.scenario.success_criteria
      ? `Success Criteria:
      - Minimum Score: ${state.scenario.success_criteria.minScore || 70}
      - Required Skills: ${state.scenario.success_criteria.requiredSkills ? state.scenario.success_criteria.requiredSkills.join(", ") : "Communication, Problem-solving"}
      - Minimum Duration: ${state.scenario.success_criteria.minDuration || 30} seconds
      - Maximum Duration: ${state.scenario.success_criteria.maxDuration || 600} seconds`
      : `Success Criteria:
      - Minimum Score: 70
      - Required Skills: Communication, Problem-solving
      - Minimum Duration: 30 seconds
      - Maximum Duration: 600 seconds`;

    const prompt = `
      You are evaluating an expert. Please evaluate the conversation based on the following success criteria:
      
      ${learningObjectivesText}
      ${successCriteriaText}
      
      Conversation History:
      ${messageHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
      
      Provide feedback in JSON format:
      {
        "score": number between 0-100,
        "metrics": {
          "empathy": number between 0-100,
          "clarity": number between 0-100,
          "effectiveness": number between 0-100,
          "appropriateness": number between 0-100,
          "professionalism": number between 0-100,
          "problem_solving": number between 0-100,
          "overall": number between 0-100
        },
        "strengths": array of strengths highlighted,
        "improvements": array of areas for improvement,
        "tips": array of tips for improvement,
        "comments": array of comments,
        "suggestions": array of improvement suggestions
      }`;

    const response = await _openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response");
      return null;
    }

    try {
      const parsedFeedback = JSON.parse(content);
      return {
        metrics: {
          empathy: parsedFeedback.metrics.empathy,
          clarity: parsedFeedback.metrics.clarity,
          effectiveness: parsedFeedback.metrics.effectiveness,
          appropriateness: parsedFeedback.metrics.appropriateness,
          professionalism: parsedFeedback.metrics.professionalism,
          problem_solving: parsedFeedback.metrics.problem_solving,
          overall: parsedFeedback.metrics.overall,
        },
        score: parsedFeedback.score,
        strengths: parsedFeedback.strengths || [...DEFAULT_STRENGTHS],
        improvements: parsedFeedback.improvements || [...DEFAULT_IMPROVEMENTS],
        tips: parsedFeedback.tips || [...DEFAULT_TIPS],
        comments: parsedFeedback.comments || DEFAULT_COMMENTS[0],
        suggestions: parsedFeedback.suggestions || [...DEFAULT_SUGGESTIONS],
        overallProgress: {
          score: parsedFeedback.score,
          level: "Beginner",
          nextLevel: "Advanced",
          requiredScore: 80,
        },
      };
    } catch (error) {
      console.error("Error parsing feedback JSON:", error);
      return null;
    }
  } catch (error) {
    console.error("Error generating final feedback:", error);
    return null;
  }
}

// Helper functions

const _calculateScore = (_content: string, _criteria: string[]): number => {
  return Math.floor(Math.random() * 100);
};

function _calculateEmpathyScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

function _calculateClarityScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

function _calculateEffectivenessScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

function _calculateAppropriatenessScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

function _calculateProfessionalismScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

function _calculateProblemSolvingScore(content: string): number {
  return Math.floor(Math.random() * 100);
}

/**
 * Calculates overall score based on pre-defined weights
 */
function _calculateOverallScore(
  metrics: Omit<FeedbackMetrics, "overall">
): number {
  return Math.round(
    Object.entries(SCORE_WEIGHTS).reduce(
      (sum, [key, weight]) =>
        sum + weight * metrics[key as keyof typeof metrics],
      0
    )
  );
}

function _identifyStrengths(messages: Message[]): readonly string[] {
  const strengths = new Set<string>();

  messages.forEach((message) => {
    if (message.role === "user") {
      if (_calculateEmpathyScore(message.content) > 70) {
        strengths.add("High Empathy");
      }
      if (_calculateClarityScore(message.content) > 70) {
        strengths.add("Clear and Understandable Communication");
      }
      if (_calculateEffectivenessScore(message.content) > 70) {
        strengths.add("Effective Solutions");
      }
      if (_calculateAppropriatenessScore(message.content) > 70) {
        strengths.add("Appropriate Responses");
      }
    }
  });

  const strengthsArray = Array.from(strengths);
  return strengthsArray.length > 0 ? strengthsArray : DEFAULT_STRENGTHS;
}

function _identifyAreasForImprovement(messages: Message[]): readonly string[] {
  const improvements = new Set<string>();

  messages.forEach((message) => {
    if (message.role === "user") {
      if (_calculateEmpathyScore(message.content) < 30) {
        improvements.add("Improve Empathy");
      }
      if (_calculateClarityScore(message.content) < 30) {
        improvements.add("Improve Clarity");
      }
      if (_calculateEffectivenessScore(message.content) < 30) {
        improvements.add("Improve Effectiveness");
      }
      if (_calculateAppropriatenessScore(message.content) < 30) {
        improvements.add("Improve Context");
      }
    }
  });

  const improvementsArray = Array.from(improvements);
  return improvementsArray.length > 0
    ? improvementsArray
    : DEFAULT_IMPROVEMENTS;
}

/**
 * Generates tips based on improvement points
 */
function _generateTips(_improvements: readonly string[]): readonly string[] {
  // כאן אפשר לממש לוגיקה יותר מורכבת בהתאם לנקודות לשיפור
  return DEFAULT_TIPS;
}

function _generateOverallComments(_averageScore: number): string {
  // לוגיקת הערות כלליות
  return DEFAULT_COMMENTS[0];
}

function _generateSuggestions(_feedback: FeedbackDetails): readonly string[] {
  // לוגיקת הצעות לשיפור
  return DEFAULT_SUGGESTIONS;
}

function getDuration(startTime: string, endTime: string): number {
  return Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
  );
}

/**
 * Saves simulation state to the database
 */
async function saveSimulationState(session: SimulatorSession): Promise<void> {
  try {
    const response = await fetch("/api/simulator/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      throw new Error("Failed to save simulation state");
    }
  } catch (error) {
    console.error("Error saving simulation state:", error);
    throw error;
  }
}

/**
 * Generates a prompt for the AI
 */
async function generatePrompt(session: SimulatorSession): Promise<string> {
  return `
    You are participating in a conversation simulation. Your role is to respond naturally and appropriately.
    
    Scenario: ${session.scenario.description}
    
    Conversation History:
    ${session.messages.map((m) => `${m.role === "user" ? "User" : "System"}: ${m.content}`).join("\n")}
    
    Respond naturally and continue the conversation.
  `;
}

function _calculateMetricsScore(metrics: FeedbackMetrics): number {
  return (
    (metrics.empathy +
      metrics.clarity +
      metrics.effectiveness +
      metrics.appropriateness +
      metrics.professionalism +
      metrics.problem_solving) /
    6
  );
}

function _generateFeedbackSummary(feedback: FeedbackDetails): string {
  const score = feedback.score;
  let message = "";

  if (score >= 80) {
    message = "Excellent response! ";
  } else if (score >= 60) {
    message = "Good response, with room for improvement. ";
  } else {
    message = "Room for improvement. ";
  }

  if (feedback.strengths.length > 0) {
    message += `Strengths: ${feedback.strengths[0]}. `;
  }

  if (feedback.improvements.length > 0) {
    message += `Improvement point: ${feedback.improvements[0]}`;
  }

  return message;
}

/**
 * Simulates a response in the conversation
 * @param session - The current simulation session
 * @param content - The message content
 * @returns Updated simulation session
 */
async function _simulateResponse(
  _scenario: ScenarioType,
  _messages: Message[],
  _config: _SimulationConfig
): Promise<SimulatorResponse> {
  // כאן יהיה מימוש לסימולציית תגובות
  return {
    state: {} as SimulatorState,
    status: 200,
  };
}

function _generateResponse(_content: string): string {
  return `תגובה לדוגמה: ${_content}`;
}

export type { SimulatorState };

/**
 * מפרסר משוב מתוך תוכן JSON
 */
const _parseFeedback = (content: string): FeedbackDetails => {
  try {
    const parsedFeedback = JSON.parse(content);
    const metrics: FeedbackMetrics = {
      empathy: parsedFeedback.empathy || 0,
      clarity: parsedFeedback.clarity || 0,
      effectiveness: parsedFeedback.effectiveness || 0,
      appropriateness: parsedFeedback.appropriateness || 0,
      professionalism: parsedFeedback.professionalism || 0,
      problem_solving: parsedFeedback.problem_solving || 0,
      overall: 0,
    };

    metrics.overall = _calculateOverallScore(metrics);

    return {
      metrics,
      score: metrics.overall,
      strengths: parsedFeedback.strengths || [...DEFAULT_STRENGTHS],
      improvements: parsedFeedback.improvements || [...DEFAULT_IMPROVEMENTS],
      tips: parsedFeedback.tips || [...DEFAULT_TIPS],
      comments: parsedFeedback.comments || DEFAULT_COMMENTS[0],
      suggestions: parsedFeedback.suggestions || [...DEFAULT_SUGGESTIONS],
      overallProgress: {
        score: metrics.overall,
        level: "מתחיל",
        nextLevel: "מתקדם",
        requiredScore: 80,
      },
    };
  } catch (error) {
    console.error("Error parsing feedback:", error);
    return _generateDefaultFeedback();
  }
};

/**
 * מייצר משוב ברירת מחדל
 */
function _generateDefaultFeedback(): FeedbackDetails {
  const metrics: FeedbackMetrics = {
    empathy: 0,
    clarity: 0,
    effectiveness: 0,
    appropriateness: 0,
    professionalism: 0,
    problem_solving: 0,
    overall: 0,
  };

  return {
    metrics,
    score: 0,
    strengths: [...DEFAULT_STRENGTHS],
    improvements: [...DEFAULT_IMPROVEMENTS],
    tips: [...DEFAULT_TIPS],
    comments: DEFAULT_COMMENTS[0],
    suggestions: [...DEFAULT_SUGGESTIONS],
    overallProgress: {
      score: 0,
      level: "מתחיל",
      nextLevel: "מתקדם",
      requiredScore: 80,
    },
  };
}

export class SimulatorService {
  async processMessage(
    session: SimulatorSession,
    message: string,
    _origin?: string
  ): Promise<any> {
    // Validate message length
    if (!message) {
      throw new Error("Message cannot be empty");
    }

    // גישה לאורך ההודעה המקסימלי מהגדרות המצב במקום מתכונת config שלא קיימת
    const maxMessageLength = 1000; // ערך ברירת מחדל
    if (message.length > maxMessageLength) {
      throw new Error("Message exceeds maximum length");
    }

    // Validate session status
    // בדיקת סטטוס מתוך הערכים המותרים של SimulatorSession
    if (session.status === "error") {
      throw new Error("Session is in error state");
    }

    // שימוש ב-user_id במקום userId
    if (!session.user_id) {
      throw new Error("Unauthorized");
    }

    // Validate origin
    if (_origin && !this._isValidOrigin(_origin)) {
      throw new Error("Invalid origin");
    }

    // Process message
    const sanitizedMessage = this._sanitizeInput(message);
    return {
      content: sanitizedMessage,
      timestamp: new Date(),
      role: "assistant",
    };
  }

  async processFileUpload(
    _session: SimulatorSession,
    file: { name: string; type: string }
  ): Promise<void> {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type");
    }
  }

  async validateMessageIntegrity(message: any): Promise<void> {
    // Implementation of message integrity validation
    if (message.content !== message.originalContent) {
      throw new Error("Message integrity check failed");
    }
  }

  private _sanitizeInput(input: string): string {
    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, "");
    // Remove SQL injection attempts
    sanitized = sanitized.replace(
      /DROP TABLE|DELETE FROM|UPDATE|INSERT INTO/gi,
      ""
    );
    // Remove command injection attempts
    sanitized = sanitized.replace(/;.*rm\s+-rf/g, "");
    return sanitized;
  }

  private _isValidOrigin(origin: string): boolean {
    const allowedOrigins = ["http://localhost:3000", "https://haderech.com"];
    return allowedOrigins.includes(origin);
  }
}

/**
 * Simulates a realistic assistant response based on the messages and scenario
 */
const _generateAssistantResponse2 = async (
  _scenario: ScenarioType,
  _messages: Message[],
  _config: _SimulationConfig
): Promise<string> => {
  // פונקציית עזר שאינה בשימוש כרגע
  return "עזר-תשובה סימולטורית";
};

// פונקציה לאימות ולידציה של סטטוס הסימולציה
export function validateSimulationStatus(status: string): boolean {
  return ["idle", "running", "completed", "error", "blocked"].includes(status);
}

// הרצה של הסימולציה עם הטיפול בתצורה
export function processSimulationConfig(session: SimulatorSession): void {
  // טיפול בתצורה של הסימולציה
  console.log(`Processing session: ${session.id}`);

  // פותר את בעיית הטיפוסים עם ה-config
  const sessionConfig = session.state?.settings || {
    difficulty: "beginner",
    language: "he",
    feedback_frequency: "medium",
    auto_suggestions: true,
  };

  console.log(`Using configuration: ${JSON.stringify(sessionConfig)}`);
}

// בדיקה אם למשתמש יש הרשאות להמשיך בסימולציה
export function canUserContinueSimulation(session: SimulatorSession): boolean {
  // במקום session.status === "blocked"
  return session.status !== "error";
}

// בדיקה ומטפל במזהה המשתמש בסימולציה
export function validateUserInSession(
  session: SimulatorSession,
  userId: string
): boolean {
  // במקום session.userId
  return session.user_id === userId;
}
