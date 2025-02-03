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
          name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          role: "admin" | "user";
          settings: {
            notifications: boolean;
            language: string;
            theme: "light" | "dark" | "system";
          };
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          settings: {
            notifications: boolean;
            language: string;
            theme: "light" | "dark" | "system";
          };
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          thumbnail: string | null;
          instructor_id: string;
          price: number | null;
          duration: number | null;
          level: "beginner" | "intermediate" | "advanced";
          tags: string[];
          requirements: string[] | null;
          what_youll_learn: string[] | null;
          average_rating: number | null;
          total_students: number | null;
          created_at: string;
          updated_at: string | null;
          published: boolean;
          featured: boolean | null;
          category: string;
          subcategory: string | null;
          language: string;
          certificate: boolean | null;
          status: "draft" | "published" | "archived";
        };
        Insert: Omit<
          Database["public"]["Tables"]["courses"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          order: number;
          duration: number;
          video_url: string | null;
          attachments: string[] | null;
          is_free: boolean | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["lessons"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["lesson_progress"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          last_accessed: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["course_enrollments"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["course_enrollments"]["Row"]
        >;
      };
      course_ratings: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          review: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["course_ratings"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["course_ratings"]["Row"]>;
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string | null;
          likes: number;
          comments_count: number;
          tags: string[];
        };
        Insert: Omit<
          Database["public"]["Tables"]["forum_posts"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["forum_posts"]["Row"]>;
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_id: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string | null;
          likes: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["forum_comments"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["forum_comments"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "course" | "forum" | "system";
          title: string;
          message: string;
          link_url: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["achievements"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
      };
      lesson_content: {
        Row: {
          id: string;
          lesson_id: string;
          content: string;
          type: "text" | "video" | "quiz";
          order: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["lesson_content"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["lesson_content"]["Row"]>;
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          filename: string;
          size: number;
          type: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["uploads"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["uploads"]["Row"]>;
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
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T];
