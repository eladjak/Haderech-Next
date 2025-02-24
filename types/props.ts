import type { Course, CourseComment, CourseLesson, CourseRating } from "./api";
import type { ForumPost, ForumStats } from "./forum";
import type { SimulatorScenario, SimulatorState } from "./simulator";

export interface CourseCardProps {
  course: Course;
}

export interface CourseHeaderProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: () => void;
}

export interface CourseSidebarProps {
  course: Course;
  currentLesson?: CourseLesson;
}

export interface CourseContentProps {
  course: Course;
  currentLesson?: CourseLesson;
}

export interface CourseTabsProps {
  course: Course;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface CourseCommentsProps {
  comments: CourseComment[];
  onAddComment?: (comment: string) => void;
  onAddReply?: (commentId: string, reply: string) => void;
}

export interface LessonContentProps {
  lesson: CourseLesson;
  onComplete?: () => void;
}

export interface LessonSidebarProps {
  course: Course;
  currentLesson: CourseLesson;
  onLessonSelect: (lesson: CourseLesson) => void;
}

export interface ForumProps {
  posts: ForumPost[];
  stats: ForumStats;
}

export interface ChatSimulatorProps {
  scenario: SimulatorScenario;
  state: SimulatorState;
  onMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  showFeedback: boolean;
  onComplete?: (state: SimulatorState) => void;
}
