import { Tables } from './supabase'

export interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  comments?: CourseComment[];
  lessons?: {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    isFree?: boolean;
    progress?: {
      completed: boolean;
      user_id: string;
    }[];
  }[];
  ratings?: {
    id: string;
    rating: number;
    review?: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }[];
  studentsCount?: number;
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  thumbnail?: string;
}

export interface CourseWithRelations extends Tables<'courses'> {
  instructor: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  lessons: CourseLesson[];
  ratings: CourseRating[] | null;
  comments: CourseComment[] | null;
  progress?: number;
}

export interface CourseComment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  created_at: string;
  updated_at: string | null;
  likes: number | null;
  replies: CourseComment[] | null;
}

export interface CourseRating {
  id: string;
  rating: number;
  review: string | null;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  created_at: string;
  updated_at: string | null;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_lessons: string[];
  last_accessed: string;
  created_at: string;
  updated_at: string | null;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  completed: boolean | null;
  video_url: string | null;
  attachments: string[] | null;
  progress: {
    completed: boolean;
    user_id: string;
  }[] | null;
  is_free: boolean | null;
}

export interface CourseFilter {
  search?: string;
  category?: string;
  level?: CourseWithRelations['level'];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  language?: string;
  featured?: boolean;
  sort?: 'price' | 'rating' | 'students' | 'newest';
  page?: number;
  limit?: number;
}

export interface CourseSearchResults {
  courses: CourseWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export type Lesson = CourseLesson;
export type LessonProgress = {
  completed: boolean;
  user_id: string;
}; 