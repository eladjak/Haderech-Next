/**
 * טיפוסים עבור מערכת הסימולציה
 */

import type { Tables } from "@/types/database";

export type SimulatorScenario = Tables<"simulator_scenarios">;
export type SimulatorSession = Tables<"simulator_sessions">;
export type SimulatorResult = Tables<"simulator_results">;
export type SimulatorUserStats = Tables<"simulator_user_stats">;
export type SimulatorUserSettings = Tables<"simulator_user_settings">;

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  feedback?: {
    score: number;
    message: string;
    details?: FeedbackDetails;
  };
}

export interface FeedbackDetails {
  empathy: number;
  clarity: number;
  effectiveness: number;
  appropriateness: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

export interface EmotionalState {
  mood: "positive" | "neutral" | "negative";
  interest: number; // 0-100
  comfort: number; // 0-100
  engagement: number; // 0-100 - רמת המעורבות
  confidence: number; // 0-100 - רמת הביטחון
}

export interface SimulationState {
  id: string;
  scenario: SimulatorScenario;
  messages: Message[];
  status: "active" | "completed" | "failed";
  feedback?: {
    score: number;
    comments: string[];
    suggestions: string[];
    details: FeedbackDetails;
    overallProgress: {
      empathy: number;
      clarity: number;
      effectiveness: number;
      appropriateness: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResponse {
  state: SimulationState;
  message: string;
  feedback?: {
    score: number;
    message: string;
    details?: FeedbackDetails;
  };
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  userId: string;
  score: number;
  feedback: string[];
  duration: number;
  createdAt: string;
  details: {
    messagesCount: number;
    averageResponseTime: number;
    emotionalStates: EmotionalState[];
    learningPoints: string[];
    skillsImproved: string[];
    overallProgress: {
      empathy: number;
      clarity: number;
      effectiveness: number;
      appropriateness: number;
    };
  };
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  initialMessage: string;
  suggestedResponses: string[];
  learningObjectives: string[];
  successCriteria: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
}

export interface SimulationStats {
  totalSessions: number;
  averageScore: number;
  completedScenarios: number;
  timeSpent: number;
  strongestCategory: string;
  weakestCategory: string;
  recentResults: SimulatorResult[];
  skillsProgress: {
    [key: string]: number; // שם המיומנות -> ציון (0-100)
  };
  learningPath: {
    completedLevels: number;
    nextScenarios: string[];
    recommendedSkills: string[];
  };
}

export interface SimulationSettings {
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  feedbackFrequency: "always" | "end" | "never";
  autoSuggestions: boolean;
  timer: boolean;
  feedbackDetail: "basic" | "detailed" | "comprehensive";
  emotionalTracking: boolean;
  learningGoals: string[];
}
