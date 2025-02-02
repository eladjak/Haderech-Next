/**
 * @file courses.ts
 * @description Type definitions for course-related data
 */

export type CourseLevel = "beginner" | "intermediate" | "advanced"

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  duration: number
  order: number
  isFree: boolean
  content?: {
    type: 'video' | 'text' | 'quiz'
    url?: string
    text?: string
    questions?: any[]
  }
  progress?: LessonProgress[]
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  instructor: {
    id: string
    name: string
    avatar_url?: string
    bio?: string
  }
  studentsCount: number
  lessons: Lesson[]
  ratings: CourseRating[]
  comments: CourseComment[]
  progress?: number
  created_at: string
  updated_at: string
}

export interface CourseProgress {
  userId: string
  courseId: string
  completedLessons: string[]
  lastAccessedAt: string
  completedAt?: string
  progress: number
}

export interface CourseReview {
  id: string
  userId: string
  courseId: string
  rating: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface LessonProgress {
  id: string
  userId: string
  lessonId: string
  completed: boolean
  lastPosition: number
  created_at: string
  updated_at: string
}

export interface CourseRating {
  id: string
  courseId: string
  userId: string
  rating: number
  review?: string
  user: {
    id: string
    name: string
    avatar_url?: string
  }
  created_at: string
}

export interface CourseComment {
  id: string
  courseId: string
  userId: string
  content: string
  user: {
    id: string
    name: string
    avatar_url?: string
  }
  replies?: CourseComment[]
  created_at: string
  updated_at: string
} 