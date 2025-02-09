import { CourseWithRelations } from "./courses";
import { Tables } from "./supabase";

// טיפוסים בסיסיים למודלים
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: "user" | "admin" | "instructor";
  points: number;
  level: number;
  badges: string[];
  completed_courses: string[];
  forum_posts: number;
  login_streak: number;
}

export interface Profile extends Tables<"profiles"> {
  user?: User;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
}

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  replies_count: number;
  tags: string[];
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
}

export interface ForumReply extends Tables<"forum_comments"> {
  author: User;
  post: ForumPost;
  parent_id: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface Achievement extends Tables<"achievements"> {
  user: User;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  initial_context: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  created_at: string;
  updated_at?: string;
}

// טיפוסים נוספים שהיו חסרים
export interface CourseEnrollment extends Tables<"course_enrollments"> {
  user: User;
  course: CourseWithRelations;
}

// Re-export טיפוסים מקובץ הקורסים
export type { CourseComment, CourseRating, CourseLesson } from "./courses";

export interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  language: "he" | "en";
}

export interface UserProgress {
  completedLessons: string[];
  courseProgress: Record<string, number>;
  achievements: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  total_students: number;
  rating: number;
  lessons_count: number;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export interface CourseProgress {
  course_id: string;
  user_id: string;
  completed_lessons: string[];
  last_accessed: string;
  progress: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface SimulatorState {
  registers: Record<string, number>;
  memory: Record<string, number>;
  flags: Record<string, boolean>;
  programCounter: number;
}

export interface SimulatorAction {
  type: "mov" | "add" | "sub" | "mul" | "div" | "jmp" | "cmp";
  source?: string;
  destination?: string;
  value?: number;
  label?: string;
}
