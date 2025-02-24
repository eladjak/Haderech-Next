export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          image: string | null;
          bio: string | null;
          role: string;
          created_at: string;
          updated_at: string;
          last_seen: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          image?: string | null;
          bio?: string | null;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          image?: string | null;
          bio?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image: string;
          price: number;
          duration: number;
          level: string;
          category: string;
          tags: string[];
          instructor_id: string;
          created_at: string;
          updated_at: string;
          published: boolean;
          featured: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image: string;
          price: number;
          duration: number;
          level: string;
          category: string;
          tags?: string[];
          instructor_id: string;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          featured?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image?: string;
          price?: number;
          duration?: number;
          level?: string;
          category?: string;
          tags?: string[];
          instructor_id?: string;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          featured?: boolean;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: string;
          order: number;
          duration: number;
          course_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          content: string;
          order: number;
          duration: number;
          course_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content?: string;
          order?: number;
          duration?: number;
          course_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          completed: boolean;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress?: number;
          completed?: boolean;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress?: number;
          completed?: boolean;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_ratings: {
        Row: {
          id: string;
          rating: number;
          review: string;
          user_id: string;
          course_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rating: number;
          review: string;
          user_id: string;
          course_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rating?: number;
          review?: string;
          user_id?: string;
          course_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_comments: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          course_id: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          user_id: string;
          course_id: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string;
          course_id?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          tags: string[];
          pinned: boolean;
          solved: boolean;
          likes: number;
          views: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          tags?: string[];
          pinned?: boolean;
          solved?: boolean;
          likes?: number;
          views?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          category_id?: string;
          tags?: string[];
          pinned?: boolean;
          solved?: boolean;
          likes?: number;
          views?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          post_id: string;
          parent_id: string | null;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          post_id: string;
          parent_id?: string | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          post_id?: string;
          parent_id?: string | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          color: string;
          posts_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          color: string;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          color?: string;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_tags: {
        Row: {
          id: string;
          name: string;
          description: string;
          color: string;
          posts_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          color: string;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          color?: string;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulator_scenarios: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          category: string;
          initial_message: string;
          suggested_responses: string[];
          learning_objectives: string[];
          success_criteria: {
            type: string;
            value: any;
          }[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          category: string;
          initial_message: string;
          suggested_responses: string[];
          learning_objectives: string[];
          success_criteria: {
            type: string;
            value: any;
          }[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          category?: string;
          initial_message?: string;
          suggested_responses?: string[];
          learning_objectives?: string[];
          success_criteria?: {
            type: string;
            value: any;
          }[];
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          read: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description: string;
          read?: boolean;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string;
          read?: boolean;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: "active" | "completed" | "dropped";
          enrolled_at: string;
          completed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: "active" | "completed" | "dropped";
          enrolled_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          status?: "active" | "completed" | "dropped";
          enrolled_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          image: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image: string;
          points: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          image: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string;
          avatar_url: string;
          social_links: {
            twitter?: string;
            github?: string;
            linkedin?: string;
            website?: string;
          };
          preferences: {
            email_notifications: boolean;
            push_notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio: string;
          avatar_url: string;
          social_links: {
            twitter?: string;
            github?: string;
            linkedin?: string;
            website?: string;
          };
          preferences: {
            email_notifications: boolean;
            push_notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          avatar_url?: string;
          social_links?: {
            twitter?: string;
            github?: string;
            linkedin?: string;
            website?: string;
          };
          preferences?: {
            email_notifications: boolean;
            push_notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
