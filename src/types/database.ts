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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          level: string;
          price: number;
          duration: number;
          total_students: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          level: string;
          price: number;
          duration: number;
          total_students?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          level?: string;
          price?: number;
          duration?: number;
          total_students?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          duration: number;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          duration: number;
          order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          content?: string;
          duration?: number;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
          replies_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
          replies_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
          replies_count?: number;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          content: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
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
