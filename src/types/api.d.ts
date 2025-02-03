// Bot API types
export interface BotResponse {
  message: string;
}

// Simulator API types
export interface SimulationState {
  context: string;
  messages: Message[];
  currentSpeaker: "user" | "partner";
  emotionalState: EmotionalState;
}

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

// API Request types
export interface StartSimulationRequest {
  context: string;
}

export interface ProcessMessageRequest {
  state: SimulationState;
  message: string;
}

export interface SaveSimulationRequest {
  state: SimulationState;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface StartSimulationResponse extends ApiResponse<SimulationState> {}
export interface ProcessMessageResponse extends ApiResponse<SimulationState> {}
export interface SaveSimulationResponse
  extends ApiResponse<{ success: boolean }> {}
