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

export interface CourseComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: number;
  replies?: CourseComment[];
}

export interface CourseRating {
  id: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  completed?: boolean;
  videoUrl?: string;
  attachments?: string[];
}

export interface CourseFilter {
  search?: string;
  category?: string;
  level?: Course['level'];
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
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
} 