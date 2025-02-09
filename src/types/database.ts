export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      simulator_scenarios: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          category: string;
          initial_message: string;
          suggested_responses: string[];
          learning_objectives: string[];
          success_criteria: {
            minScore: number;
            requiredSkills: string[];
            minDuration: number;
            maxDuration: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          category: string;
          initial_message: string;
          suggested_responses?: string[];
          learning_objectives?: string[];
          success_criteria?: {
            minScore: number;
            requiredSkills: string[];
            minDuration: number;
            maxDuration: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          category?: string;
          initial_message?: string;
          suggested_responses?: string[];
          learning_objectives?: string[];
          success_criteria?: {
            minScore: number;
            requiredSkills: string[];
            minDuration: number;
            maxDuration: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      simulator_sessions: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          status: "active" | "completed" | "failed";
          messages: Json[];
          feedback?: Json;
          created_at: string;
          updated_at: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scenario_id: string;
          status: "active" | "completed" | "failed";
          messages?: Json[];
          feedback?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scenario_id?: string;
          status?: "active" | "completed" | "failed";
          messages?: Json[];
          feedback?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string;
        };
      };
      simulator_results: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          scenario_id: string;
          score: number;
          feedback: string[];
          duration: number;
          details: {
            messagesCount: number;
            averageResponseTime: number;
            emotionalStates: {
              mood: "positive" | "neutral" | "negative";
              interest: number;
              comfort: number;
              engagement: number;
              confidence: number;
            }[];
            learningPoints: string[];
            skillsImproved: string[];
            overallProgress: {
              empathy: number;
              clarity: number;
              effectiveness: number;
              appropriateness: number;
            };
          };
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          scenario_id: string;
          score: number;
          feedback?: string[];
          duration: number;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          scenario_id?: string;
          score?: number;
          feedback?: string[];
          duration?: number;
          details?: Json;
          created_at?: string;
        };
      };
      simulator_user_stats: {
        Row: {
          user_id: string;
          total_sessions: number;
          average_score: number;
          completed_scenarios: number;
          time_spent: number;
          strongest_category?: string;
          weakest_category?: string;
          skills_progress: Record<string, number>;
          learning_path: {
            completedLevels: number;
            nextScenarios: string[];
            recommendedSkills: string[];
          };
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_sessions?: number;
          average_score?: number;
          completed_scenarios?: number;
          time_spent?: number;
          strongest_category?: string;
          weakest_category?: string;
          skills_progress?: Record<string, number>;
          learning_path?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_sessions?: number;
          average_score?: number;
          completed_scenarios?: number;
          time_spent?: number;
          strongest_category?: string;
          weakest_category?: string;
          skills_progress?: Record<string, number>;
          learning_path?: Json;
          updated_at?: string;
        };
      };
      simulator_user_settings: {
        Row: {
          user_id: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          language: string;
          feedback_frequency: "always" | "end" | "never";
          auto_suggestions: boolean;
          timer: boolean;
          feedback_detail: "basic" | "detailed" | "comprehensive";
          emotional_tracking: boolean;
          learning_goals: string[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          language?: string;
          feedback_frequency?: "always" | "end" | "never";
          auto_suggestions?: boolean;
          timer?: boolean;
          feedback_detail?: "basic" | "detailed" | "comprehensive";
          emotional_tracking?: boolean;
          learning_goals?: string[];
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          language?: string;
          feedback_frequency?: "always" | "end" | "never";
          auto_suggestions?: boolean;
          timer?: boolean;
          feedback_detail?: "basic" | "detailed" | "comprehensive";
          emotional_tracking?: boolean;
          learning_goals?: string[];
          updated_at?: string;
        };
      };
    };
  };
}
