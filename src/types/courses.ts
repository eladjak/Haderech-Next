export type CourseLevel = "beginner" | "intermediate" | "advanced"

export interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  content: string
  duration: number
  order: number
  courseId: string
  completed?: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  level: CourseLevel
  lessons: Lesson[]
  createdAt: string
  updatedAt: string
  authorId: string
  published: boolean
  price: number
  rating: number
  studentsCount: number
  tags: string[]
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