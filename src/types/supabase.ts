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
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      courses: {
        Row: {
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
          tags: string[]
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          order: number
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      lesson_content: {
        Row: {
          id: string
          lesson_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_content']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_content']['Insert']>
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          last_accessed: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>
      }
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          user_id: string
          enrolled_at: string
          status: 'active' | 'completed' | 'dropped'
          progress: number
          last_accessed: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_enrollments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_enrollments']['Insert']>
      }
      course_ratings: {
        Row: {
          id: string
          course_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_ratings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_ratings']['Insert']>
      }
      forum_posts: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['forum_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['forum_posts']['Insert']>
      }
      forum_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
          likes: number
        }
        Insert: Omit<Database['public']['Tables']['forum_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['forum_comments']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: 'info' | 'success' | 'warning' | 'error'
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: string
          earned_at: string
          icon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T] 