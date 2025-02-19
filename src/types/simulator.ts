/**
 * טיפוסים עבור מערכת הסימולציה
 */

import type { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Message = {
  id: string;
  content: string;
  timestamp: string;
  role: "user" | "admin" | "instructor" | "assistant";
  sender: {
    id: string;
    role: "user" | "admin" | "instructor" | "assistant";
    name: string;
    avatar?: string;
  };
  feedback?: MessageFeedback;
};

export interface MessageFeedback {
  score: number;
  message: string;
  details: FeedbackDetails;
  comments: string[];
  suggestions: string[];
}

export interface FeedbackMetrics {
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  professionalism: number;
  problem_solving: number;
}

export interface FeedbackDetails {
  metrics: FeedbackMetrics;
  score: number;
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  professionalism: number;
  problem_solving: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  comments: string[];
  suggestions: string[];
  overallProgress: {
    score: number;
    level: string;
    nextLevel: string;
    requiredScore: number;
    progress: number;
  };
}

export type SimulatorScenario = {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  initial_message: string;
  learning_objectives: string[];
  success_criteria: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
};

export type SimulatorState = {
  scenario: SimulatorScenario;
  messages: Message[];
  status: "idle" | "active" | "completed" | "failed";
  feedback?: {
    score: number;
    message: string;
    details: {
      metrics: {
        empathy: number;
        clarity: number;
        effectiveness: number;
        appropriateness: number;
        professionalism: number;
        problem_solving: number;
      };
      strengths: string[];
      improvements: string[];
      tips: string[];
      comments: string;
      suggestions: string[];
      overallProgress: {
        score: number;
        level: string;
        nextLevel: string;
        requiredScore: number;
      };
    };
    comments: string[];
    suggestions: string[];
  };
  settings: {
    difficulty: "beginner" | "intermediate" | "advanced";
    language: string;
    feedback_frequency: "always" | "end" | "never";
    auto_suggestions: boolean;
  };
  stats: {
    total_scenarios: number;
    completed_scenarios: number;
    average_score: number;
    total_messages: number;
    practice_time: number;
    strengths: string[];
    areas_for_improvement: string[];
  };
};

export type SimulatorUserStats = {
  total_scenarios: number;
  completed_scenarios: number;
  average_score: number;
  total_messages: number;
  practice_time: number;
  strengths: string[];
  areas_for_improvement: string[];
};

export type SimulatorUserSettings = {
  difficulty: "beginner" | "intermediate" | "advanced";
  language: "he" | "en";
  feedback_frequency: "always" | "end" | "never";
  auto_suggestions: boolean;
};

export type SimulatorSession = {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "active" | "completed" | "failed";
  messages: Message[];
  feedback?: {
    score: number;
    message: string;
    details: {
      metrics: {
        empathy: number;
        clarity: number;
        effectiveness: number;
        appropriateness: number;
        professionalism: number;
        problem_solving: number;
      };
      strengths: string[];
      improvements: string[];
      tips: string[];
      comments: string;
      suggestions: string[];
      overallProgress: {
        score: number;
        level: string;
        nextLevel: string;
        requiredScore: number;
      };
    };
    comments: string[];
    suggestions: string[];
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
  duration?: number;
};

export type SimulatorResult = {
  id: string;
  session_id: string;
  scenario_id: string;
  score: number;
  feedback: {
    score: number;
    message: string;
    details: {
      metrics: {
        empathy: number;
        clarity: number;
        effectiveness: number;
        appropriateness: number;
        professionalism: number;
        problem_solving: number;
      };
      strengths: string[];
      improvements: string[];
      tips: string[];
      comments: string;
      suggestions: string[];
      overallProgress: {
        score: number;
        level: string;
        nextLevel: string;
        requiredScore: number;
      };
    };
    comments: string[];
    suggestions: string[];
  };
  duration: number;
  details: {
    messages_count: number;
    scenario_difficulty: string;
    scenario_category: string;
  };
  created_at: string;
  updated_at: string;
};

export type SimulatorResponse = {
  success: boolean;
  message: string;
  state?: SimulatorState;
  error?: string;
};

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

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface FeedbackResponse {
  metrics: FeedbackMetrics;
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  comments: string;
  suggestions: string[];
  overallProgress: {
    level: string;
    progress: number;
    nextLevel: string;
  };
}

export type SimulatorEvent = {
  type: string;
  data: {
    [key: string]: any;
  };
  timestamp: string;
};
