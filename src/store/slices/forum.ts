import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ForumPost {
  id: string
  title: string
  content: string
  author_id: string
  tags: string[]
  likes: number
  views: number
  comments: Comment[]
  created_at: string
  updated_at: string
  is_pinned: boolean
  is_locked: boolean
}

interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  likes: number
  parent_id: string | null
  created_at: string
  updated_at: string
}

interface ForumState {
  posts: ForumPost[]
  currentPost: ForumPost | null
  filters: {
    search: string
    tags: string[]
    sortBy: 'newest' | 'popular' | 'unanswered'
  }
  isLoading: boolean
  error: string | null
}

const initialState: ForumState = {
  posts: [],
  currentPost: null,
  filters: {
    search: '',
    tags: [],
    sortBy: 'newest',
  },
  isLoading: false,
  error: null,
}

export const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setPosts: (state: ForumState, action: PayloadAction<ForumPost[]>) => {
      state.posts = action.payload
    },
    setCurrentPost: (state: ForumState, action: PayloadAction<ForumPost | null>) => {
      state.currentPost = action.payload
    },
    addComment: (state: ForumState, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      const post = state.posts.find(p => p.id === action.payload.postId)
      if (post) {
        post.comments.push(action.payload.comment)
      }
      if (state.currentPost && state.currentPost.id === action.payload.postId) {
        state.currentPost.comments.push(action.payload.comment)
      }
    },
    updateFilters: (state: ForumState, action: PayloadAction<Partial<ForumState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state: ForumState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state: ForumState, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setPosts,
  setCurrentPost,
  addComment,
  updateFilters,
  setLoading,
  setError,
} = forumSlice.actions

export const forumReducer = forumSlice.reducer 