import type { Author } from "./api";
import type { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Message interface
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
  sender: MessageSender;
  feedback?: FeedbackDetails;
  function_call?: {
    name: string;
    arguments: string;
  };
}

// Message sender interface
export interface MessageSender {
  id: string;
  role: "user" | "assistant";
  name: string;
  avatar_url?: string;
}

// Feedback metrics interface
export interface FeedbackMetrics {
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  professionalism: number;
  problem_solving: number;
  overall: number;
}

// Feedback details interface
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

// Simulator scenario interface
export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  initial_message: string;
  suggested_responses?: string[];
  learning_objectives: string[];
  success_criteria: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
  created_at: string;
  updated_at: string;
}

// Simulator state interface
export interface SimulatorState {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "active" | "completed";
  messages: Message[];
  feedback?: FeedbackDetails;
  state: "initial" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  settings?: {
    difficulty: "beginner" | "intermediate" | "advanced";
    language: "he" | "en";
    feedback_frequency: "high" | "medium" | "low";
    auto_suggestions: boolean;
  };
}

// Simulator session interface
export interface SimulatorSession {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "active" | "completed" | "failed";
  state: SimulatorState;
  messages: Message[];
  feedback?: FeedbackDetails;
  created_at: string;
  updated_at: string;
}

// Simulator user stats interface
export interface SimulatorUserStats {
  total_scenarios: number;
  completed_scenarios: number;
  average_score: number;
  total_messages: number;
  practice_time: number;
  strengths: string[];
  areas_for_improvement: string[];
}

// Simulator user settings interface
export interface SimulatorUserSettings {
  difficulty: "beginner" | "intermediate" | "advanced";
  language: "he" | "en";
  feedback_frequency: "high" | "medium" | "low";
  auto_suggestions: boolean;
  theme: "light" | "dark" | "system";
}

// Simulator action types
export type SimulatorAction =
  | { type: "START_SCENARIO"; scenario: SimulatorScenario }
  | { type: "SEND_MESSAGE"; message: string }
  | { type: "RECEIVE_MESSAGE"; message: string }
  | { type: "SUBMIT_FEEDBACK"; rating: number; comment?: string }
  | { type: "RESET" };

// Chat completion message interface
export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

// Simulator event interface
export interface SimulatorEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

// Simulator response interface
export interface SimulatorResponse {
  state: SimulatorState;
  feedback?: FeedbackDetails;
  message?: string;
  status?: number;
}

// API response interface
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  success?: boolean;
  state?: SimulatorState;
}

// Simulation state type alias
export type SimulationState = SimulatorState;
