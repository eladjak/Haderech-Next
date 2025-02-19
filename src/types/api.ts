/**
 * API Types
 *
 * טיפוסים עבור ה-API של המערכת
 */

import type { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type User = Tables<"users"> & {
  points: number;
  level: number;
  badges: string[];
  total_students?: number;
  is_online?: boolean;
  settings?: {
    notifications: boolean;
    theme: "light" | "dark" | "system";
    language: string;
  };
};

export type Course = Tables<"courses"> & {
  total_students?: number;
  students_count?: number;
  instructor: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  ratings?: CourseRating[];
  lessons?: CourseLesson[];
  sections?: Section[];
  progress?: {
    completed: boolean;
    score: number;
    last_activity: string;
  };
};

export type CourseRating = Tables<"course_ratings">;
export type CourseLesson = Tables<"lessons">;
export type Notification = Tables<"notifications">;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface ExtendedProfile extends Omit<User, "achievements"> {
  stats: {
    total_courses: number;
    completed_courses: number;
    total_lessons: number;
    completed_lessons: number;
    total_points: number;
    streak_days: number;
    active_days: number;
  };
  achievements: Achievement[];
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  is_free: boolean;
  isCompleted?: boolean;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export type APIResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SearchResults {
  courses: Course[];
  instructors: User[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  initial_state: {
    emotional: {
      anger: number;
      happiness: number;
      sadness: number;
      fear: number;
      trust: number;
    };
    context: Record<string, string | number | boolean | null>;
  };
  success_conditions: Array<{
    type: "emotional" | "action" | "context";
    target: string;
    operator: ">" | "<" | "=" | ">=" | "<=" | "includes" | "excludes";
    value: string | number | boolean | null;
  }>;
  feedback_rules: Array<{
    condition: {
      type: "emotional" | "action" | "context";
      target: string;
      operator: ">" | "<" | "=" | ">=" | "<=" | "includes" | "excludes";
      value: string | number | boolean | null;
    };
    message: string;
    suggestions?: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface SimulationState {
  id: string;
  user_id: string;
  scenario_id: string;
  emotional_state: {
    anger: number;
    happiness: number;
    sadness: number;
    fear: number;
    trust: number;
  };
  context: Record<string, string | number | boolean | null>;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  created_at: string;
  updated_at: string;
}
