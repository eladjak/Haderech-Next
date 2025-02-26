import type { OpenAI } from "openai";
import type { Database } from "./database";
import type { Author } from "./forum";

/**
 * טיפוסים עבור מערכת הסימולציה
 */

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface BaseMessage {
  id: string;
  role: "user" | "assistant" | "system" | "admin" | "instructor";
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface MessageSender {
  id: string;
  role: "user" | "assistant";
  name: string;
  avatar_url?: string;
}

export interface Message extends BaseMessage {
  role: "user" | "assistant";
  sender: MessageSender;
  feedback?: FeedbackDetails;
  function_call?: OpenAI.Chat.ChatCompletionMessage.FunctionCall;
}

export interface MessageFeedback {
  id: string;
  message_id: string;
  details: FeedbackDetails;
  created_at: string;
  updated_at: string;
}

export interface FeedbackMetrics {
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  professionalism: number;
  problem_solving: number;
  overall: number;
}

export interface FeedbackDetails {
  metrics: FeedbackMetrics;
  strengths: string[];
  improvements: string[];
  tips: string[];
  comments: string;
  suggestions: string[];
  score: number;
  overallProgress: {
    score: number;
    level: string;
    nextLevel: string;
    requiredScore: number;
  };
}

export interface SimulatorMessage extends BaseMessage {
  role: "user" | "assistant" | "system";
  sender: MessageSender;
  feedback?: FeedbackDetails;
  function_call?: OpenAI.Chat.ChatCompletionMessage.FunctionCall;
}

export interface _SimulatorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FeedbackResponse {
  score: number;
  feedback: string;
}

export interface _FeedbackResponse {
  score: number;
  feedback: string;
}

/**
 * Represents a simulation scenario with all necessary configuration
 */
export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  category: string;
  tags?: string[];
  initial_message: string;
  context?: string;
  objectives?: string[];
  expected_outcomes?: string[];
  learning_objectives?: string[];
  success_criteria?: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
  max_turns?: number;
  time_limit?: number;
  created_at: string;
  updated_at: string;
}

export interface SimulatorState {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "idle" | "running" | "completed" | "error";
  messages: Message[];
  feedback?: FeedbackDetails;
  state: "initial" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  settings?: {
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    language: "he" | "en";
    feedback_frequency: "high" | "medium" | "low";
    auto_suggestions: boolean;
  };
}

export interface ChatSimulatorProps {
  state: SimulatorState;
  onSendMessage: (message: string) => void;
  onReset: () => void;
  isLoading?: boolean;
  showFeedback?: boolean;
}

export type SimulationState = SimulatorState;

export async function completeSimulation(
  _state: SimulatorState
): Promise<void> {
  // Implementation will be added in the simulator service
}

export interface SimulatorStats {
  completed: number;
  total: number;
  percentage: number;
  score: number;
  level: number;
  nextLevel: number;
  requiredScore: number;
}

export interface SimulatorUserSettings {
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  language: "he" | "en";
  feedback_frequency: "high" | "medium" | "low";
  auto_suggestions: boolean;
  theme: "light" | "dark" | "system";
}

export interface SimulatorResult {
  scenario_id: string;
  user_id: string;
  messages: Message[];
  feedback: FeedbackDetails;
  duration: number;
  score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export type { SimulatorState as SimState };

export interface SimulatorUserStats {
  total_scenarios: number;
  completed_scenarios: number;
  average_score: number;
  total_messages: number;
  practice_time: number;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface SimulatorSession {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "idle" | "running" | "completed" | "error";
  state: SimulatorState;
  messages: Message[];
  feedback?: FeedbackDetails;
  created_at: string;
  updated_at: string;
}

export interface SimulatorResponse {
  state: SimulatorState;
  feedback?: FeedbackDetails;
  message?: string;
  status?: number;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  success?: boolean;
  state?: SimulatorState;
}

export type SimulatorAction =
  | { type: "START_SCENARIO"; scenario: SimulatorScenario }
  | { type: "SEND_MESSAGE"; message: string }
  | { type: "RECEIVE_MESSAGE"; message: string }
  | { type: "SUBMIT_FEEDBACK"; rating: number; comment?: string }
  | { type: "RESET" };

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface SimulatorEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface SimulationConfig {
  maxMessages: number;
  rateLimit: number;
  messageMaxLength: number;
  defaultScenario: string;
  feedbackFrequency: number;
}

export interface SimulationSession {
  id: string;
  userId: string;
  scenarioId: string;
  status: "active" | "blocked" | "completed";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  startTime: Date;
  lastMessageTime: Date;
  config: SimulationConfig;
}
