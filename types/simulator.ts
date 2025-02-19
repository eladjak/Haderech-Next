import type { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface SimulatorSession {
  id: string;
  user_id: string;
  scenario_id: string;
  status: "active" | "completed" | "failed";
  messages: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    sender: {
      role: "user" | "assistant" | "system";
      name?: string;
      avatar?: string;
    };
    feedback?: {
      score: number;
      message: string;
      details?: {
        empathy: number;
        clarity: number;
        effectiveness: number;
        appropriateness: number;
        strengths: string[];
        areas_for_improvement: string[];
        recommendations: string[];
      };
    };
  }[];
  feedback?: {
    score: number;
    message: string;
    details?: {
      empathy: number;
      clarity: number;
      effectiveness: number;
      appropriateness: number;
      strengths: string[];
      areas_for_improvement: string[];
      recommendations: string[];
    };
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
  duration?: number;
}

export interface SimulatorResult {
  id: string;
  session_id: string;
  scenario_id: string;
  score: number;
  feedback: {
    score: number;
    message: string;
    details?: {
      empathy: number;
      clarity: number;
      effectiveness: number;
      appropriateness: number;
      strengths: string[];
      areas_for_improvement: string[];
      recommendations: string[];
    };
  };
  duration: number;
  details: {
    messages_count: number;
    scenario_difficulty: string;
    scenario_category: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SimulatorUserStats {
  id: string;
  user_id: string;
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  total_duration: number;
  skills_progress: {
    [key: string]: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SimulatorUserSettings {
  id: string;
  user_id: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  feedback_frequency: "always" | "end" | "never";
  auto_suggestions: boolean;
  timer: boolean;
  feedback_detail: "basic" | "detailed" | "comprehensive";
  emotional_tracking: boolean;
  learning_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface SimulatorFeedback {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  metrics: FeedbackMetrics;
  details: FeedbackDetails;
}

export interface SimulatorState {
  id: string;
  user_id: string;
  scenario_id: string;
  messages: Message[];
  status: "active" | "completed" | "failed";
  feedback: SimulatorFeedback | null;
  created_at: string;
  updated_at: string;
  registers?: Record<string, any>;
}

export interface Message {
  id: string;
  role: "user" | "system" | "assistant";
  content: string;
  timestamp: string;
  sender: {
    id?: string;
    name: string;
    role: string;
    avatar?: string;
  };
  feedback?: MessageFeedback;
  created_at?: string;
}

export interface MessageFeedback {
  score: number;
  message: string;
  comments: string[];
  suggestions: string[];
  details: FeedbackDetails;
}

export interface FeedbackMetrics {
  clarity: number;
  professionalism: number;
  empathy: number;
  problem_solving: number;
  effectiveness: number;
  appropriateness: number;
}

export interface FeedbackDetails {
  message_scores: number[];
  key_moments: {
    timestamp: string;
    description: string;
    impact: number;
  }[];
  learning_points: string[];
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  suggestions: string[];
  comments: string[];
  score: number;
  overallProgress: {
    empathy: number;
    clarity: number;
    effectiveness: number;
    appropriateness: number;
  };
}

export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  initial_message: string;
  suggested_responses: string[];
  learning_objectives: string[];
  success_criteria: {
    type: string;
    value: any;
    minScore?: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface SimulationResponse {
  message: Message;
  feedback?: MessageFeedback;
  state: SimulatorState;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SimulatorAction =
  | { type: "START_SCENARIO"; scenario: SimulatorScenario }
  | { type: "SEND_MESSAGE"; message: string }
  | { type: "RECEIVE_MESSAGE"; message: string }
  | { type: "SUBMIT_FEEDBACK"; rating: number; comment?: string }
  | { type: "RESET" };
