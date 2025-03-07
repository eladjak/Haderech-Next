import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, UserPreferences } from "@/types/models";

// הגדרת טיפוס UserProgress מקומית כיוון שהוא לא קיים בקובץ models.ts
interface UserProgress {
  id: string;
  user_id: string;
  points: number;
  level: number;
  xp: number;
  next_level_xp: number;
  badges: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
  completedLessons: string[];
  courseProgress: Record<string, number>;
  courses: {
    completed: string[];
    in_progress: string[];
    bookmarked: string[];
  };
  lessons: {
    completed: string[];
    in_progress: string[];
  };
  simulator: {
    completed_scenarios: string[];
    results: any[];
    stats: {
      total_sessions: number;
      average_score: number;
      time_spent: number;
    };
  };
  forum: {
    posts: string[];
    comments: string[];
    likes: string[];
    bookmarks: string[];
  };
}

// הרחבת טיפוס העדפות המשתמש
interface ExtendedUserPreferences extends UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  simulator: {
    difficulty: string;
    language: string;
    feedback_frequency: string;
    auto_suggestions: boolean;
    theme: string;
  };
}

interface UserState {
  user: User | null;
  preferences: ExtendedUserPreferences;
  progress: UserProgress;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  preferences: {
    email_notifications: true,
    theme: "system",
    language: "he",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
    simulator: {
      difficulty: "beginner",
      language: "he",
      feedback_frequency: "high",
      auto_suggestions: true,
      theme: "system",
    },
  },
  progress: {
    id: "1",
    user_id: "1",
    points: 0,
    level: 1,
    xp: 0,
    next_level_xp: 1000,
    badges: [],
    achievements: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completedLessons: [],
    courseProgress: {},
    courses: {
      completed: [],
      in_progress: [],
      bookmarked: [],
    },
    lessons: {
      completed: [],
      in_progress: [],
    },
    simulator: {
      completed_scenarios: [],
      results: [],
      stats: {
        total_sessions: 0,
        average_score: 0,
        time_spent: 0,
      },
    },
    forum: {
      posts: [],
      comments: [],
      likes: [],
      bookmarks: [],
    },
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<ExtendedUserPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateProgress: (state, action: PayloadAction<Partial<UserProgress>>) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    completeLesson: (state, action: PayloadAction<string>) => {
      if (!state.progress.completedLessons.includes(action.payload)) {
        state.progress.completedLessons.push(action.payload);
      }
    },
    updateCourseProgress: (
      state,
      action: PayloadAction<{ courseId: string; progress: number }>
    ) => {
      const { courseId, progress } = action.payload;
      state.progress.courseProgress[courseId] = progress;
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      state.progress.points = action.payload;
    },
    updateLevel: (state, action: PayloadAction<number>) => {
      state.progress.level = action.payload;
    },
    addBadge: (state, action: PayloadAction<string>) => {
      if (!state.progress.badges.includes(action.payload)) {
        state.progress.badges.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  updatePreferences,
  updateProgress,
  completeLesson,
  updateCourseProgress,
  updatePoints,
  updateLevel,
  addBadge,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;

export { userSlice };
