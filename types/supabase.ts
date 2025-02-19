export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          image: string | null;
          bio: string | null;
          role: string;
          created_at: string;
          updated_at: string;
          level: string;
          points: number;
          badges: string[];
          completed_courses: string[];
          forum_posts: number;
          login_streak: number;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          instructor_id: string;
          price: number;
          duration: number;
          level: string;
          category: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          total_students: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          duration: number;
          order: number;
          is_free: boolean;
          video_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          completed: boolean;
          progress: number;
          created_at: string;
          updated_at: string;
        };
      };
      course_ratings: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          category: string;
          tags: string[];
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          likes: number;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          data: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
      };
      simulator_sessions: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          status: "active" | "completed" | "failed";
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          duration: number | null;
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
      };
      simulator_results: {
        Row: {
          id: string;
          session_id: string;
          scenario_id: string;
          score: number;
          duration: number;
          details: {
            messages_count: number;
            scenario_difficulty: string;
            scenario_category: string;
          };
          created_at: string;
          updated_at: string;
        };
      };
      simulator_user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_sessions: number;
          completed_sessions: number;
          average_score: number;
          total_duration: number;
          skills_progress: Record<string, number>;
          created_at: string;
          updated_at: string;
        };
      };
      simulator_user_settings: {
        Row: {
          id: string;
          user_id: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          language: string;
          feedback_frequency: "always" | "end" | "never";
          auto_suggestions: boolean;
          timer: boolean;
          feedback_detail: "basic" | "detailed" | "comprehensive";
          emotional_tracking: boolean;
          learning_goals: string[];
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type ExtendedForumPost = Tables<"forum_posts"> & {
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    image: string | null;
    role: string;
  };
  comments: (Tables<"forum_comments"> & {
    author: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string | null;
      image: string | null;
      role: string;
    };
    replies: Tables<"forum_comments">[];
  })[];
};
