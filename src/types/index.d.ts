import { Database } from './supabase'

declare global {
  type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
  
  interface Database extends Database {}

  type UserRole = 'user' | 'moderator' | 'admin'

  interface UserProfile {
    id: string
    created_at: string
    updated_at: string
    name: string | null
    avatar_url: string | null
    bio: string | null
    expertise: string[] | null
    website: string | null
    social_links: {
      twitter?: string
      linkedin?: string
      facebook?: string
      instagram?: string
    } | null
    preferences: UserPreferences | null
    role: UserRole
    points: number
    level: number
    badges: string[]
    completed_courses: string[]
    forum_posts: number
    login_streak: number
    helpful_count: number
    content_helped_count: number
  }

  interface UserPreferences {
    notifications: {
      email: boolean
      push: boolean
      recommendations: boolean
      forum: boolean
      courses: boolean
    }
    email_frequency: 'daily' | 'weekly' | 'monthly' | 'never'
    theme: 'light' | 'dark' | 'system'
    language: 'he' | 'en'
  }

  interface Course {
    id: string
    title: string
    description: string
    image_url: string
    duration: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    author: Author
    price: number
    rating: number
    reviews_count: number
    lessons: Lesson[]
    created_at: string
    updated_at: string
  }

  interface Lesson {
    id: string
    title: string
    description: string
    content: string
    duration: number
    order: number
    course_id: string
    created_at: string
    updated_at: string
  }

  interface Author {
    id: string
    name: string
    avatar_url: string
    bio: string
    expertise: string[]
    courses_count: number
    average_rating: number
    created_at: string
    updated_at: string
  }

  interface ForumPost {
    id: string
    title: string
    content: string
    author: UserProfile
    tags: string[]
    likes_count: number
    comments_count: number
    views_count: number
    created_at: string
    updated_at: string
  }

  interface Comment {
    id: string
    content: string
    author: UserProfile
    likes_count: number
    post_id: string
    parent_id: string | null
    created_at: string
    updated_at: string
  }

  interface SimulationScenario {
    id: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    initial_state: Record<string, any>
    success_criteria: Record<string, any>
    created_at: string
    updated_at: string
  }

  interface ChatMessage {
    id: string
    content: string
    sender_id: string
    room_id: string
    attachments?: {
      type: 'image' | 'video' | 'document'
      url: string
      name: string
    }[]
    read: boolean
    created_at: string
    updated_at: string
  }

  interface ChatRoom {
    id: string
    name: string
    type: 'private' | 'group'
    participants: UserProfile[]
    last_message: ChatMessage | null
    created_at: string
    updated_at: string
  }

  interface SocialGroup {
    id: string
    name: string
    description: string
    image_url: string
    members: UserProfile[]
    activities: Activity[]
    created_at: string
    updated_at: string
  }

  interface Activity {
    id: string
    title: string
    description: string
    type: 'meetup' | 'workshop' | 'discussion' | 'exercise'
    date: string
    location: string
    max_participants: number
    participants: UserProfile[]
    group_id: string
    created_at: string
    updated_at: string
  }
}

export {} 