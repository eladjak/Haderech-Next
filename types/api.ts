// API Response Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  level: string;
  points: number;
  badges: string[];
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
  ratings: CourseRating[];
  lessons: CourseLesson[];
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

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  completed: boolean;
  progress: number;
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
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}
