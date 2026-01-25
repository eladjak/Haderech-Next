import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ForumCategory,
  ForumFilters,
  ForumPost,
  ForumTag,
} from "@/types/forum";

interface ForumState {
  posts: ForumPost[];
  categories: ForumCategory[];
  tags: ForumTag[];
  filters: ForumFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: ForumState = {
  posts: [],
  categories: [],
  tags: [],
  filters: {
    sort: "latest",
    search: "",
    category: undefined,
    tag: undefined,
    timeframe: "all",
    status: "all",
  },
  isLoading: false,
  error: null,
};

export const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<ForumPost[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<ForumPost>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<ForumPost>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    setCategories: (state, action: PayloadAction<ForumCategory[]>) => {
      state.categories = action.payload;
    },
    setTags: (state, action: PayloadAction<ForumTag[]>) => {
      state.tags = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ForumFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setCategories,
  setTags,
  setFilters,
  setLoading,
  setError,
} = forumSlice.actions;

export default forumSlice.reducer;
