import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

export interface ProfileWithStats extends Profile {
  stats: {
    posts_count: number;
    comments_count: number;
    courses_completed: number;
    total_points: number;
    achievements_count: number;
    rank?: string;
  };
  achievements?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }[];
  recent_activity?: {
    type: "post" | "comment" | "course" | "achievement";
    title: string;
    link: string;
    timestamp: string;
  }[];
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
