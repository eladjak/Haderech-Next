import type {
  Lesson as ApiLesson,
  User as ApiUser,
  Author,
  Course,
  CourseComment,
  CourseProgress,
  CourseRating,
  ForumComment,
  ForumPost,
  ForumStats,
  ForumTag,
} from "./api";
import type { Database } from "./database";
import type { ForumCategory } from "./forum";
import type {
  FeedbackDetails,
  Message,
  SimulatorAction,
  SimulatorMessage,
  SimulatorResult,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
  SimulatorUserSettings,
  SimulatorUserStats,
} from "./simulator";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type {
  Course,
  CourseProgress,
  CourseRating,
  CourseComment,
  ForumPost,
  ForumComment,
  ForumTag,
  ForumStats,
  ForumCategory,
  Message,
  SimulatorMessage,
  SimulatorScenario,
  SimulatorState,
  SimulatorUserSettings,
  SimulatorUserStats,
  SimulatorResult,
  SimulatorSession,
  SimulatorAction,
};

export interface CourseWithRelations extends Omit<Course, "lessons"> {
  lessons: CourseLesson[];
  ratings: CourseRating[];
  comments: CourseComment[];
  instructor: Author;
}

export interface CourseState {
  currentCourse: Course | null;
  currentLesson: ApiLesson | null;
  userProgress: {
    completed_lessons: string[];
    progress: number;
  };
}

export type Notification = Tables<"notifications">;

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "he" | "en";
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  simulator: SimulatorUserSettings;
}

export interface UserProgress {
  id: string;
  user_id: string;
  points: number;
  level: number;
  xp: number;
  next_level_xp: number;
  badges: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
  completedLessons: string[];
  courseProgress: Record<string, number>;
  courses: {
    completed: string[];
    in_progress: string[];
    bookmarked: string[];
  };
  lessons: {
    completed: string[];
    in_progress: string[];
  };
  simulator: {
    completed_scenarios: string[];
    results: SimulatorResult[];
    stats: {
      total_sessions: number;
      average_score: number;
      time_spent: number;
    };
  };
  forum: {
    posts: string[];
    comments: string[];
    likes: string[];
    bookmarks: string[];
  };
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatar_url?: string | null;
  bio?: string;
  username?: string;
  full_name?: string;
  role: "user" | "admin" | "instructor";
  points: number;
  level: number;
  badges: string[];
  achievements: string[];
  preferences: UserPreferences;
  progress: UserProgress;
  created_at: string;
  updated_at: string;
}

export type User = BaseUser;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  created_at: string;
  updated_at: string;
  earned_at?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  requirements: {
    type: string;
    value: number;
  }[];
  created_at: string;
  updated_at: string;
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

export interface CourseLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  video_url?: string;
  created_at: string;
  updated_at: string;
  progress?: CourseProgress[];
}

export type { CourseLesson as Lesson };

export type ExtendedCourseLesson = CourseLesson & {
  progress?: CourseProgress[];
};
