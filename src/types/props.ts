import { Tables } from "@/types/supabase";

import { UserStats } from "./profile";

import type { ForumComment } from "./forum";
import type {
  Course,
  CourseComment,
  CourseProgress,
  CourseRating,
  ForumPost,
  Lesson,
  Notification,
  SimulatorResult,
  SimulatorScenario,
  SimulatorSession,
  SimulatorUserSettings,
  SimulatorUserStats,
  User,
} from "./models";

export interface UserStatsProps {
  stats: UserStats;
  className?: string;
}

export interface CourseCardProps {
  course: Tables<"courses"> & {
    author: Tables<"users">;
    lessons: { count: number }[];
  };
  className?: string;
}

export interface LessonCardProps {
  lesson: Tables<"lessons">;
  progress?: {
    completed: boolean;
    last_position?: number;
    notes?: string;
  };
  className?: string;
}

export interface CommentProps {
  comment: {
    id: string;
    content: string;
    lesson_id: string;
    course_id: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    author: Tables<"users">;
  };
  className?: string;
}

export interface ForumPostProps {
  post: Tables<"forum_posts"> & {
    author: Tables<"users">;
    comments: {
      id: string;
      content: string;
      post_id: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      author: Tables<"users">;
    }[];
  };
  className?: string;
}

export interface CourseCommentsProps {
  comments: ForumComment[];
  onAddComment?: (comment: string) => Promise<void>;
  onAddReply?: (commentId: string, reply: string) => Promise<void>;
  isLoading?: boolean;
}

export interface CourseContentProps {
  course: Course;
  lessons: Lesson[];
  isEnrolled?: boolean;
  onLessonClick?: (lessonId: string) => void;
  isLoading?: boolean;
}

export interface CourseHeaderProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: () => Promise<void>;
  onUnenroll?: () => Promise<void>;
  isLoading?: boolean;
}

export interface CourseProgressProps {
  course: Course;
  isEnrolled: boolean;
}

export interface CourseRatingsProps {
  ratings: CourseRating[];
  onAddRating?: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export interface CourseSidebarProps {
  course: Course;
  lessons: Lesson[];
  currentLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
  isLoading?: boolean;
}

export interface ProfileProps {
  user: User;
  isCurrentUser: boolean;
}

export interface ProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
}

export interface ProfileStatsProps {
  stats: {
    coursesCompleted: number;
    totalCourses: number;
    averageScore: number;
    totalTime: number;
    achievements: number;
    certificatesEarned: number;
  };
}

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
}

export interface UserProfileProps {
  user: User;
  isCurrentUser?: boolean;
  onFollow?: () => Promise<void>;
  onUnfollow?: () => Promise<void>;
  isLoading?: boolean;
}

export interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  isLoading?: boolean;
}

export interface ForumCommentProps {
  comment: ForumComment;
  onLike?: () => Promise<void>;
  onReply?: (reply: string) => Promise<void>;
  isLoading?: boolean;
}

export interface NotificationProps {
  notification: Notification;
  onRead: () => Promise<void>;
}

export interface SimulatorScenarioProps {
  scenario: SimulatorScenario;
  onStart: () => Promise<void>;
}

export interface SimulatorSessionProps {
  session: SimulatorSession;
  onMessage: (content: string) => Promise<void>;
}

export interface SimulatorResultProps {
  result: SimulatorResult;
}

export interface SimulatorStatsProps {
  stats: SimulatorUserStats;
}

export interface SimulatorSettingsProps {
  settings: SimulatorUserSettings;
  onUpdate: (settings: Partial<SimulatorUserSettings>) => Promise<void>;
}
