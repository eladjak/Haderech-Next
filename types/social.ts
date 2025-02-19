export interface Activity {
  id: string;
  user_id: string;
  type:
    | "course_completed"
    | "achievement_earned"
    | "forum_post"
    | "forum_comment"
    | "course_rating";
  data: Record<string, any>;
  created_at: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  members: string[];
  created_at: string;
  updated_at: string;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface SocialRecommendation {
  id: string;
  user_id: string;
  recommended_user_id: string;
  score: number;
  reason: string;
  created_at: string;
}

export interface SocialStats {
  connections_count: number;
  mutual_connections_count: number;
  shared_courses_count: number;
  shared_achievements_count: number;
  interaction_score: number;
}
