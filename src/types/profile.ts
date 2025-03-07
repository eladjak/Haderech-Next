import { Tables } from "@/types/supabase";

export type User = Tables<"users">;

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: "he" | "en";
  accessibility: {
    fontSize: "small" | "medium" | "large";
    contrast: "normal" | "high";
  };
}

export interface UserStats {
  points: number;
  level: number;
  badges: string[];
  completedCourses: number;
  forumPosts: number;
  loginStreak: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}
export interface UserWithStats extends Omit<User, "achievements"> {
  achievements: Achievement[];
  stats: {
    posts_count: number;
    comments_count: number;
    courses_completed: number;
    total_points: number;
    current_streak: number;
    longest_streak: number;
  };
}

export interface ProfileSettings {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    replies: boolean;
    likes: boolean;
    newsletter: boolean;
  };
  privacy: {
    show_email: boolean;
    show_activity: boolean;
    show_achievements: boolean;
  };
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  updatedAt: string;
}

export interface ProfileProgress {
  level: number;
  current_points: number;
  points_to_next_level: number;
  progress_percentage: number;
  recent_points: {
    amount: number;
    reason: string;
    timestamp: string;
  }[];
}

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at?: string;
  requirements: {
    type: string;
    value: number;
  }[];
}
