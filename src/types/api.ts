import type { Database } from './supabase'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
  role: 'admin' | 'user'
  settings: {
    notifications: boolean
    language: string
    theme: 'light' | 'dark' | 'system'
  }
  points?: number
  level?: string
  badges?: string[]
  completed_courses?: string[]
  forum_posts?: number
  login_streak?: number
}

export interface Course {
  id: string
  title: string
  description: string
  image_url: string | null
  status: 'draft' | 'published' | 'archived'
  author_id: string
  created_at: string
  updated_at: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  price?: number
  tags: string[]
  author?: User
  lessons?: Lesson[]
  ratings?: CourseRating[]
  average_rating?: number
  total_students?: number
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'open_ended'
  text: string
  options?: string[]
  correctAnswer?: string | boolean
  explanation?: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  content: string
  order: number
  duration?: number
  type?: 'video' | 'text' | 'quiz'
  status: 'draft' | 'published'
  questions?: Question[]
  resources?: Resource[]
  progress?: LessonProgress[]
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  last_accessed: string
  last_position?: number
  created_at: string
  updated_at: string
}

export interface CourseRating {
  id: string
  course_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  enrolled_at: string
  status: 'active' | 'completed' | 'dropped'
  progress: number
  last_accessed: string | null
  course?: Course
  user?: User
}

export interface ForumPost {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  likes: number
  views: number
  category?: string
  author?: User
  comments?: ForumComment[]
}

export interface ForumComment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  likes: number
  author?: User
  replies?: ForumComment[]
}

export interface Notification {
  id: string
  user_id: string
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'course' | 'forum' | 'system'
  read_at: string | null
  created_at: string
  updated_at: string
  data?: Record<string, string | number | boolean | null>
  user?: User
}

export interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  type: string
  earned_at: string
  icon_url: string | null
  points?: number
  condition?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code: string
    details?: Record<string, string | number | boolean | null>
  }
}

export interface SearchResults {
  courses: Course[]
  instructors: User[]
}

export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  initial_state: {
    emotional: {
      anger: number
      happiness: number
      sadness: number
      fear: number
      trust: number
    }
    context: Record<string, string | number | boolean | null>
  }
  success_conditions: Array<{
    type: 'emotional' | 'action' | 'context'
    target: string
    operator: '>' | '<' | '=' | '>=' | '<=' | 'includes' | 'excludes'
    value: string | number | boolean | null
  }>
  feedback_rules: Array<{
    condition: {
      type: 'emotional' | 'action' | 'context'
      target: string
      operator: '>' | '<' | '=' | '>=' | '<=' | 'includes' | 'excludes'
      value: string | number | boolean | null
    }
    message: string
    suggestions?: string[]
  }>
  created_at: string
  updated_at: string
}

export interface SimulationState {
  id: string
  user_id: string
  scenario_id: string
  emotional_state: {
    anger: number
    happiness: number
    sadness: number
    fear: number
    trust: number
  }
  context: Record<string, string | number | boolean | null>
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export interface SimulationResult {
  id: string
  user_id: string
  scenario_id: string
  success: boolean
  duration: number
  messages_count: number
  emotional_changes: Array<{
    type: 'anger' | 'happiness' | 'sadness' | 'fear' | 'trust'
    from: number
    to: number
    timestamp: string
  }>
  feedback: string[]
  created_at: string
} 