import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { User, UserPreferences, UserProgress } from "@/types/models";

interface UserState {
  user: User | null;
  preferences: UserPreferences;
  progress: UserProgress;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  preferences: {
    theme: "light",
    notifications: true,
    language: "he",
  },
  progress: {
    completedLessons: [],
    courseProgress: {},
    achievements: [],
  },
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>,
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
      action: PayloadAction<{ courseId: string; progress: number }>,
    ) => {
      const { courseId, progress } = action.payload;
      state.progress.courseProgress[courseId] = progress;
    },
    addAchievement: (state, action: PayloadAction<string>) => {
      if (!state.progress.achievements.includes(action.payload)) {
        state.progress.achievements.push(action.payload);
      }
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.points = action.payload;
      }
    },
    updateLevel: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.level = action.payload;
      }
    },
    addBadge: (state, action: PayloadAction<string>) => {
      if (state.user && !state.user.badges.includes(action.payload)) {
        state.user.badges.push(action.payload);
      }
    },
    completeCourse: (state, action: PayloadAction<string>) => {
      if (
        state.user &&
        !state.user.completed_courses.includes(action.payload)
      ) {
        state.user.completed_courses.push(action.payload);
      }
    },
    incrementForumPosts: (state) => {
      if (state.user) {
        state.user.forum_posts += 1;
      }
    },
    incrementLoginStreak: (state) => {
      if (state.user) {
        state.user.login_streak += 1;
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
  addAchievement,
  updatePoints,
  updateLevel,
  addBadge,
  completeCourse,
  incrementForumPosts,
  incrementLoginStreak,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
