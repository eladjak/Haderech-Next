export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructor_id: string;
          created_at: string;
          updated_at: string;
          thumbnail_url?: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          duration: number;
          price: number;
          category: string;
          tags: string[];
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          instructor_id: string;
          created_at?: string;
          updated_at?: string;
          thumbnail_url?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          duration?: number;
          price?: number;
          category?: string;
          tags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructor_id?: string;
          created_at?: string;
          updated_at?: string;
          thumbnail_url?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          duration?: number;
          price?: number;
          category?: string;
          tags?: string[];
        };
      };
      course_lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string;
          order: number;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          content: string;
          order: number;
          duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          content?: string;
          order?: number;
          duration?: number;
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
          user_id: string;
          course_id: string;
          rating: number;
          review: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          rating: number;
          review: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          rating?: number;
          review?: string;
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
          parent_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          content: string;
          parent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          content?: string;
          parent_id?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_id: string;
          parent_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          content: string;
          author_id: string;
          parent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          content?: string;
          author_id?: string;
          parent_id?: string;
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
          user_id: string;
          type: string;
          title: string;
          content: string;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string;
          read?: boolean;
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
    };
  };
}
