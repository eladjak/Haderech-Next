/**
 * טיפוסים עבור מערכת הסימולציה
 */

export interface Message {
  speaker: "user" | "partner";
  content: string;
  timestamp: string;
}

export interface EmotionalState {
  mood: "positive" | "neutral" | "negative";
  interest: number; // 0-100
  comfort: number; // 0-100
}

export interface SimulationState {
  context: string;
  messages: Message[];
  currentSpeaker: "user" | "partner";
  emotionalState: EmotionalState;
}

export interface SimulationResponse {
  message?: string;
  mood?: "positive" | "neutral" | "negative";
  interest?: number;
  comfort?: number;
}

export interface SimulationResult {
  id: string;
  user_id: string;
  context: string;
  messages: Message[];
  emotional_state: EmotionalState;
  created_at: string;
  updated_at?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  initial_context: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  created_at: string;
  updated_at?: string;
}
