export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          last_login: string | null
          role: string
          is_active: boolean
          settings: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
          role?: string
          is_active?: boolean
          settings?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
          role?: string
          is_active?: boolean
          settings?: Json | null
          metadata?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          website: string | null
          social_links: Json | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          website?: string | null
          social_links?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          website?: string | null
          social_links?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail: string | null
          duration: number | null
          level: string
          author_id: string
          created_at: string
          updated_at: string
          published: boolean
          price: number | null
          rating: number | null
          students_count: number
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail?: string | null
          duration?: number | null
          level: string
          author_id: string
          created_at?: string
          updated_at?: string
          published?: boolean
          price?: number | null
          rating?: number | null
          students_count?: number
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail?: string | null
          duration?: number | null
          level?: string
          author_id?: string
          created_at?: string
          updated_at?: string
          published?: boolean
          price?: number | null
          rating?: number | null
          students_count?: number
          metadata?: Json | null
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          video_url: string | null
          content: string | null
          duration: number | null
          order_index: number
          created_at: string
          updated_at: string
          is_free: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          video_url?: string | null
          content?: string | null
          duration?: number | null
          order_index: number
          created_at?: string
          updated_at?: string
          is_free?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          content?: string | null
          duration?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
          is_free?: boolean
          metadata?: Json | null
        }
      }
      forum_posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          created_at: string
          updated_at: string
          views_count: number
          likes_count: number
          comments_count: number
          tags: string[] | null
          is_pinned: boolean
          is_locked: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          created_at?: string
          updated_at?: string
          views_count?: number
          likes_count?: number
          comments_count?: number
          tags?: string[] | null
          is_pinned?: boolean
          is_locked?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          created_at?: string
          updated_at?: string
          views_count?: number
          likes_count?: number
          comments_count?: number
          tags?: string[] | null
          is_pinned?: boolean
          is_locked?: boolean
          metadata?: Json | null
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
          likes_count: number
          parent_id: string | null
          is_solution: boolean
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          parent_id?: string | null
          is_solution?: boolean
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          parent_id?: string | null
          is_solution?: boolean
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          lesson_id: string
          status: string
          progress_percent: number
          last_position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          lesson_id: string
          status?: string
          progress_percent?: number
          last_position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          lesson_id?: string
          status?: string
          progress_percent?: number
          last_position?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 