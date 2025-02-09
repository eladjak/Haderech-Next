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
          success_criteria: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          category: string;
          initial_message: string;
          suggested_responses?: string[];
          learning_objectives?: string[];
          success_criteria?: Json;
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
          success_criteria?: Json;
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
          feedback: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          scenario_id: string;
          status?: "active" | "completed" | "failed";
          messages?: Json[];
          feedback?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
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
          completed_at?: string | null;
        };
      };
      simulator_results: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          scenario_id: string;
          score: number;
          feedback: Json;
          duration: number;
          details: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          session_id: string;
          user_id: string;
          scenario_id: string;
          score: number;
          feedback?: Json;
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
          feedback?: Json;
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
          completed_scenarios: string[];
          time_spent: number;
          strongest_category: string;
          weakest_category: string;
          skills_progress: Json;
          learning_path: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_sessions?: number;
          average_score?: number;
          completed_scenarios?: string[];
          time_spent?: number;
          strongest_category?: string;
          weakest_category?: string;
          skills_progress?: Json;
          learning_path?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_sessions?: number;
          average_score?: number;
          completed_scenarios?: string[];
          time_spent?: number;
          strongest_category?: string;
          weakest_category?: string;
          skills_progress?: Json;
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
          feedback_detail: "basic" | "detailed";
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
          feedback_detail?: "basic" | "detailed";
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
          feedback_detail?: "basic" | "detailed";
          emotional_tracking?: boolean;
          learning_goals?: string[];
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T];
