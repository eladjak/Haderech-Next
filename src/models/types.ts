export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  points: number;
  level: string;
  badges: string[];
  completed_courses: string[];
  forum_posts: number;
  login_streak: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessons: Lesson[];
  price: number;
  average_rating: number;
  total_students: number;
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
  type: 'video' | 'text' | 'quiz' | 'exercise';
  resources?: Resource[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  category: string;
  tags: string[];
  likes: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  initial_state: any;
  success_conditions: any[];
  feedback_rules: any[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  condition: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'achievement' | 'course' | 'forum' | 'system';
  read: boolean;
  data?: any;
  created_at: string;
} 