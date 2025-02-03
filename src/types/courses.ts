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
}

export interface CourseComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  courseId: string;
  parentId?: string;
  replies?: CourseComment[];
}

export interface CourseRating {
  id: string;
  rating: number;
  review?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  courseId: string;
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