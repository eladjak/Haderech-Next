// User related interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  social_links?: SocialLinks;
  preferences?: UserPreferences;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

// Course related interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
  instructor: User;
  lessons: Lesson[];
  enrollments: Enrollment[];
  ratings: Rating[];
}

export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  position: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  course: Course;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  course: Course;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  progress_percentage: number;
  last_position?: number; // video position in seconds
  updated_at: string;
}

export interface Rating {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  course: Course;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Forum related interfaces
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  comments: ForumComment[];
  likes: ForumLike[];
  category: ForumCategory;
  tags: ForumTag[];
}

export interface ForumComment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  post: ForumPost;
}

export interface ForumLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user: User;
  post: ForumPost;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  posts: ForumPost[];
}

export interface ForumTag {
  id: string;
  name: string;
  posts: ForumPost[];
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  userId: string;
  read: boolean;
  type: string;
  linkId: string;
  createdAt: Date;
  user: User;
}
