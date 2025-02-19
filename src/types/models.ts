import type { Course, CourseLesson, CourseRating, User } from "./api";
import type { Database } from "./database";
import type { ForumCategory, ForumComment, ForumPost, ForumTag } from "./forum";
import type {
  FeedbackDetails,
  Message,
  MessageFeedback,
  SimulatorResult,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState as SimulatorStateType,
  SimulatorUserSettings,
  SimulatorUserStats,
} from "./simulator";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type CourseProgress = Tables<"course_progress">;
export type CourseComment = Tables<"course_comments">;
export type Notification = Tables<"notifications">;

export interface UserProgress {
  completedLessons: string[];
  completedCourses: string[];
  points: number;
  level: number;
  badges: string[];
  courseProgress: Record<string, number>;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: "he" | "en";
  emailNotifications: boolean;
}

export interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  progress: UserProgress;
  preferences: UserPreferences;
}

export interface CourseState {
  currentCourse: Course | null;
  currentLesson: CourseLesson | null;
  isLoading: boolean;
  error: string | null;
}

export interface ForumState {
  posts: ForumPost[];
  categories: ForumCategory[];
  tags: ForumTag[];
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export type Profile = Omit<User, "achievements"> & {
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
  progress: {
    [key: string]: {
      completed: boolean;
      score: number;
      last_activity: string;
    };
  };
};

export type CourseWithRelations = Course & {
  lessons: CourseLesson[];
  ratings: CourseRating[];
  comments: ForumComment[];
  instructor: User;
};

export interface SimulatorAction {
  type: string;
  payload: any;
}

export type {
  Message,
  MessageFeedback,
  FeedbackDetails,
  SimulatorSession,
  SimulatorStateType as SimulatorState,
  SimulatorScenario,
  SimulatorResult,
  SimulatorUserStats,
  SimulatorUserSettings,
  User,
  Course,
  CourseRating,
  CourseLesson,
  ForumPost,
  ForumComment,
  ForumCategory,
  ForumTag,
};
