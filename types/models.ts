import type { Author } from "./api";
import type { Database } from "./database";
import type { ForumComment, ForumPost, ForumStats } from "./forum";
import type {
  FeedbackDetails,
  Message,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "./simulator";

export interface User extends Author {
  full_name: string;
  completed_courses: string[];
  forum_posts: number;
  login_streak: number;
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

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  completed: boolean;
  progress: number;
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

export type Profile = User;

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin" | "instructor" | null;
  points: number;
  level: string;
  badges: string[];
  achievements: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface CourseState {
  id: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  price: number | null;
  duration: number | null;
  level: string | null;
  category: string | null;
  tags: string[];
  instructor_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  published: boolean;
  featured: boolean;
  lessons_count: number;
  students_count: number;
  ratings_count: number;
  average_rating: number;
  instructor: User | null;
  lessons: CourseLesson[];
  ratings: CourseRating[];
  comments: CourseComment[];
}

export interface ForumState {
  posts: ForumPost[];
  stats: ForumStats;
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export interface CourseWithRelations extends Omit<Course, "instructor"> {
  lessons: CourseLesson[];
  ratings: CourseRating[];
  comments: CourseComment[];
  instructor: Author;
}

export interface SimulatorStateModel {
  scenario: SimulatorScenario | null;
  messages: Message[];
  current_step: number;
  total_steps: number;
  score: number;
  feedback: FeedbackDetails | null;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

export interface AppState {
  user: UserState;
  course: CourseState;
  forum: ForumState;
  simulator: SimulatorStateModel;
  theme: "light" | "dark" | "system";
  language: string;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export type { Author } from "./api";
export type { ForumPost, ForumComment } from "./forum";
export type { Message, FeedbackDetails, SimulatorState } from "./simulator";
