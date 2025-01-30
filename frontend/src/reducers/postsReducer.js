import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  refresh: 20,
  maxId: null,
  sinceId: null 
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPosts: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.posts = [...state.posts, ...action.payload]
      }
    },
    deletePost: (state) => {
      state.posts = state.posts.slice(state.refresh)
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },
    addRefresh: (state, action) => {
        state.refresh = action.payload
    }
  },
});

// Export generated action creators
export const { addPosts, deletePost, updatePost, addRefresh } = postsSlice.actions;

// Export the reducer
export default postsSlice.reducer;