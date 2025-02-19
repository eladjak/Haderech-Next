import type { SimulatorScenario as SimulatorScenarioType } from "./simulator";

export interface User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  level: number;
  points: number;
  badges: string[];
  completed_courses: string[];
  forum_posts: number;
  login_streak: number;
  achievements?: string[];
  courseProgress?: Record<string, number>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  instructor_id: string;
  instructor: User;
  price: number;
  duration: number;
  level: string;
  category: string;
  tags: string[];
  lessons: CourseLesson[];
  ratings: CourseRating[];
  created_at: string;
  updated_at: string;
  total_students: number;
}

export interface CourseLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  is_free: boolean;
  video_url: string | null;
  progress: LessonProgress[];
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  course_id: string;
  user_id: string;
  completed: boolean;
  progress: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRating {
  id: string;
  course_id: string;
  user_id: string;
  user: User;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CourseComment {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  user: User;
  replies?: CourseComment[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  room_id?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface UserPreferences {
  theme: string;
  notifications: boolean;
  language: string;
  emailNotifications: boolean;
}

export interface UserProgress {
  completedLessons: string[];
  completedCourses: string[];
  points: number;
  level: number;
  badges: string[];
  achievements?: string[];
}

export interface SimulatorState {
  messages: ChatMessage[];
  scenario: SimulatorScenarioType | null;
  feedback: {
    rating: number | null;
    comment: string | null;
  };
}

export type SimulatorAction =
  | { type: "START_SCENARIO"; scenario: SimulatorScenarioType }
  | { type: "SEND_MESSAGE"; message: ChatMessage }
  | { type: "RECEIVE_MESSAGE"; message: ChatMessage }
  | { type: "SUBMIT_FEEDBACK"; rating: number; comment?: string }
  | { type: "RESET" };

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  completed: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: User;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: ForumComment[];
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  author: User;
  content: string;
  likes: number;
  parent_id: string | null;
  replies: ForumComment[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  user: User;
  type: string;
  title: string;
  content: string;
  message: string;
  read: boolean;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile extends User {}

export interface UserState {
  user: User | null;
  preferences: UserPreferences;
  progress: UserProgress;
  loading: boolean;
  error: string | null;
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

export interface ForumState {
  posts: ForumPost[];
  currentPost: ForumPost | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}
