import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ForumPost, ForumComment } from "@/types/models";

interface ForumState {
  posts: ForumPost[];
  replies: Record<string, ForumComment[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ForumState = {
  posts: [],
  replies: {},
  loading: false,
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
      state.posts.push(action.payload);
    },
    updatePost: (state, action: PayloadAction<ForumPost>) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
      delete state.replies[action.payload];
    },
    likePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(
        (post: ForumPost) => post.id === action.payload,
      );
      if (post) {
        post.likes += 1;
      }
    },
    unlikePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(
        (post: ForumPost) => post.id === action.payload,
      );
      if (post && post.likes > 0) {
        post.likes -= 1;
      }
    },
    addReply: (
      state,
      action: PayloadAction<{ postId: string; reply: ForumComment }>,
    ) => {
      const { postId, reply } = action.payload;
      if (!state.replies[postId]) {
        state.replies[postId] = [];
      }
      state.replies[postId].push(reply);
    },
    updateReply: (
      state,
      action: PayloadAction<{
        postId: string;
        replyId: string;
        content: string;
      }>,
    ) => {
      const { postId, replyId, content } = action.payload;
      const reply = state.replies[postId]?.find(
        (reply: ForumComment) => reply.id === replyId,
      );
      if (reply) {
        reply.content = content;
      }
    },
    deleteReply: (
      state,
      action: PayloadAction<{ postId: string; replyId: string }>,
    ) => {
      const { postId, replyId } = action.payload;
      if (state.replies[postId]) {
        state.replies[postId] = state.replies[postId].filter(
          (reply) => reply.id !== replyId,
        );
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
  setPosts,
  addPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addReply,
  updateReply,
  deleteReply,
  setLoading,
  setError,
} = forumSlice.actions;

export default forumSlice.reducer;
