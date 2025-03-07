export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: number;
  total_students: number;
  created_at: string;
  updated_at: string;
}
export interface CourseLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  created_at: string;
  updated_at: string;
  is_free: boolean;
}
export interface CourseProgress {
  id: string;
  course_id: string;
  lesson_id: string;
  user_id: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
export interface CourseRating {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  review?: string;
}

export interface CourseComment {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar_url?: string;
  };
}

export interface CourseWithRelations extends Course {
  thumbnail?: string;
  lessons: (CourseLesson & {
    progress?: CourseProgress[];
  })[];
  ratings: CourseRating[];
  comments: CourseComment[];
  instructor: {
    name: string;
    avatar_url?: string;
  };
  _count?: {
    students: number;
  };
}

export interface LessonWithProgress extends CourseLesson {
  progress?: CourseProgress[];
  completionRate: number;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  lastAccessedAt: string;
  timeSpent: number;
}
export interface CourseFilters {
  search?: string;
  level?: string;
  category?: string;
  price?: {
    min?: number;
    max?: number;
  };
  duration?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  sortBy?: "price" | "rating" | "students" | "date";
  sortOrder?: "asc" | "desc";
}

export interface CourseStats {
  totalStudents: number;
  averageRating: number;
  totalLessons: number;
  totalDuration: number;
  completionRate: number;
}
