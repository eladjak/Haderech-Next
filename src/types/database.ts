export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          image: string | null;
          bio: string | null;
          role: "user" | "admin" | "instructor";
          created_at: string;
          updated_at: string;
          last_seen: string | null;
          points: number;
          level: number;
          badges: string[];
          achievements: string[];
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          full_name?: string;
          username: string;
          avatar_url?: string | null;
          image?: string | null;
          bio?: string | null;
          role?: "user" | "admin" | "instructor";
          created_at?: string;
          updated_at?: string;
          last_seen?: string | null;
          points?: number;
          level?: number;
          badges?: string[];
          achievements?: string[];
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          full_name?: string;
          username?: string;
          avatar_url?: string | null;
          image?: string | null;
          bio?: string | null;
          role?: "user" | "admin" | "instructor";
          created_at?: string;
          updated_at?: string;
          last_seen?: string | null;
          points?: number;
          level?: number;
          badges?: string[];
          achievements?: string[];
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          price: number;
          level: "beginner" | "intermediate" | "advanced";
          duration: number;
          status: "draft" | "published" | "archived";
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          price: number;
          level: "beginner" | "intermediate" | "advanced";
          duration: number;
          status?: "draft" | "published" | "archived";
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          price?: number;
          level?: "beginner" | "intermediate" | "advanced";
          duration?: number;
          status?: "draft" | "published" | "archived";
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          completed_lessons: string[];
          progress: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          completed_lessons?: string[];
          progress?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          completed_lessons?: string[];
          progress?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_ratings: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_comments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          content?: string;
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
          pinned: boolean;
          solved: boolean;
          likes: number;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          pinned?: boolean;
          solved?: boolean;
          likes?: number;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          category_id?: string;
          pinned?: boolean;
          solved?: boolean;
          likes?: number;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          slug: string;
          order: number;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          slug: string;
          order?: number;
          icon: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          slug?: string;
          order?: number;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_tags: {
        Row: {
          id: string;
          name: string;
          description: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          slug?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          post_id: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          post_id?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_post_tags: {
        Row: {
          id: string;
          post_id: string;
          tag_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          tag_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          tag_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          type: "info" | "success" | "warning" | "error";
          read: boolean;
          link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          type?: "info" | "success" | "warning" | "error";
          read?: boolean;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          type?: "info" | "success" | "warning" | "error";
          read?: boolean;
          link?: string | null;
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
          suggested_responses?: string[];
          learning_objectives?: string[];
          success_criteria?: {
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
      lessons: {
        Row: {
          id: string;
          title: string;
          content: string;
          course_id: string;
          order: number;
          duration: number;
          status: "draft" | "published";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          course_id: string;
          order: number;
          duration: number;
          status?: "draft" | "published";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          course_id?: string;
          order?: number;
          duration?: number;
          status?: "draft" | "published";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type DatabaseUser = Tables<"users">;
export type DatabaseCourse = Tables<"courses">;
export type DatabaseCourseProgress = Tables<"course_progress">;
export type DatabaseCourseRating = Tables<"course_ratings">;
export type DatabaseCourseComment = Tables<"course_comments">;
export type DatabaseForumPost = Tables<"forum_posts">;
export type DatabaseForumCategory = Tables<"forum_categories">;
export type DatabaseForumTag = Tables<"forum_tags">;
export type DatabaseForumComment = Tables<"forum_comments">;
export type DatabasePostTag = Tables<"forum_post_tags">;
export type DatabaseNotification = Tables<"notifications">;
export type DatabaseSimulatorScenario = Tables<"simulator_scenarios">;
export type DatabaseLesson = Tables<"lessons">;
