import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/models/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.points = action.payload;
      }
    },
    updateLevel: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.level = action.payload;
      }
    },
    addBadge: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.badges.push(action.payload);
      }
    },
    addCompletedCourse: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.completed_courses.push(action.payload);
      }
    },
    incrementForumPosts: (state) => {
      if (state.user) {
        state.user.forum_posts += 1;
      }
    },
    updateLoginStreak: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.login_streak = action.payload;
      }
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  updatePoints,
  updateLevel,
  addBadge,
  addCompletedCourse,
  incrementForumPosts,
  updateLoginStreak,
} = userSlice.actions;

export default userSlice.reducer; 