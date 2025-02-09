/**
 * API Types
 *
 * טיפוסים עבור ה-API של המערכת
 */

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: "draft" | "published" | "archived";
  author_id: string;
  created_at: string;
  updated_at: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  price: number;
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  };
  rating: number;
  ratings: CourseRating[];
  ratings_count: number;
  students_count: number;
  lessons_count: number;
  thumbnail_url: string;
  sections: Section[];
  comments?: Comment[];
  instructor: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
  };
  lessons: Lesson[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  isCompleted: boolean;
  content?: string;
  progress?: Array<{
    user_id: string;
    completed: boolean;
    progress: number;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  role: "user" | "admin";
  settings: {
    notifications: boolean;
    language: string;
    theme: "light" | "dark" | "system";
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
  };
  likes: number;
  likes_count: number;
  comments_count: number;
  comments: ForumComment[];
  tags: string[];
  is_liked: boolean;
}

export interface ForumComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
  };
  likes: number;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  content: string;
  user?: {
    name?: string;
    avatar_url?: string | null;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  completed: boolean;
  earned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, string | number | boolean | null>;
  };
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

export interface SimulationResult {
  id: string;
  user_id: string;
  scenario_id: string;
  success: boolean;
  duration: number;
  messages_count: number;
  emotional_changes: Array<{
    type: "anger" | "happiness" | "sadness" | "fear" | "trust";
    from: number;
    to: number;
    timestamp: string;
  }>;
  feedback: string[];
  created_at: string;
}

export interface CourseRating {
  id: string;
  rating: number;
  comment: string;
  user: User;
  created_at: string;
}
