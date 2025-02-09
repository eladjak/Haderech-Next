import type { Tables } from "@/types/database";

export type Course = Tables<"courses">;
export type Lesson = Tables<"lessons">;

export interface CourseWithRelations extends Course {
  lessons?: Lesson[];
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  _count?: {
    lessons: number;
    students: number;
  };
}

export interface LessonWithRelations extends Lesson {
  course?: Course;
  _count?: {
    completions: number;
  };
}

export interface CourseFilters {
  search?: string;
  level?: Course["level"];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "title" | "price" | "level" | "duration";
  sortOrder?: "asc" | "desc";
}

export interface CourseStats {
  totalLessons: number;
  totalDuration: number;
  averageRating: number;
  totalStudents: number;
  completionRate: number;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string;
  isCompleted: boolean;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt?: string;
  progress: number;
  timeSpent: number;
}

export interface CourseRating {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}
