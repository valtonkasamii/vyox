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
    addRefresh: (state, action) => {
        state.refresh = action.payload
    },
    addId: (state, action) => {
      state.maxId = action.payload.max
      state.sinceId = action.payload.since
    }
  },
});

// Export generated action creators
export const { addPosts, deletePost, addRefresh, addId } = postsSlice.actions;

// Export the reducer
export default postsSlice.reducer;