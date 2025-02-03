import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise: string[] | null;
  website: string | null;
  social_links: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  } | null;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: "light" | "dark";
    language: "he" | "en";
  } | null;
  role: "user" | "moderator" | "admin";
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: AuthState, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, clearError, logout } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
