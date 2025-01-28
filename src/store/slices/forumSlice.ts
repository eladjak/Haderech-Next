import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForumPost, ForumReply } from '@/models/types';

interface ForumState {
  posts: ForumPost[];
  currentPost: ForumPost | null;
  replies: Record<string, ForumReply[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ForumState = {
  posts: [],
  currentPost: null,
  replies: {},
  isLoading: false,
  error: null,
};

export const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<ForumPost[]>) => {
      state.posts = action.payload;
      state.error = null;
    },
    setCurrentPost: (state, action: PayloadAction<ForumPost | null>) => {
      state.currentPost = action.payload;
      state.error = null;
    },
    setReplies: (state, action: PayloadAction<{ postId: string; replies: ForumReply[] }>) => {
      const { postId, replies } = action.payload;
      state.replies[postId] = replies;
    },
    addReply: (state, action: PayloadAction<{ postId: string; reply: ForumReply }>) => {
      const { postId, reply } = action.payload;
      if (!state.replies[postId]) {
        state.replies[postId] = [];
      }
      state.replies[postId].push(reply);
      
      // Update replies count in posts
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.replies_count += 1;
      }
      if (state.currentPost?.id === postId) {
        state.currentPost.replies_count += 1;
      }
    },
    updateLikes: (state, action: PayloadAction<{ postId: string; likes: number }>) => {
      const { postId, likes } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.likes = likes;
      }
      if (state.currentPost?.id === postId) {
        state.currentPost.likes = likes;
      }
    },
    updateReplyLikes: (state, action: PayloadAction<{ postId: string; replyId: string; likes: number }>) => {
      const { postId, replyId, likes } = action.payload;
      const reply = state.replies[postId]?.find(r => r.id === replyId);
      if (reply) {
        reply.likes = likes;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPosts,
  setCurrentPost,
  setReplies,
  addReply,
  updateLikes,
  updateReplyLikes,
  setLoading,
  setError,
} = forumSlice.actions;

export default forumSlice.reducer; 