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
    deletePosts: (state) => {
      state.posts = state.posts.slice(state.refresh)
    },
    addRefresh: (state, action) => {
        state.refresh = action.payload
    },
    addId: (state, action) => {
      state.maxId = action.payload.max
      state.sinceId = action.payload.since
    },
    hide: (state, action) => {
      state.posts = state.posts.filter(post => post.id != action.payload)
    },
    addLike: (state, action) => {
      state.posts = state.posts.map((post) => 
          post.id === action.payload ? { ...post, favourited: true, favourites_count: post.favourites_count + 1 } : post
      );
  },
  addUnlike: (state, action) => {
    state.posts = state.posts.map((post) => 
        post.id === action.payload ? { ...post, favourited: false, favourites_count: post.favourites_count - 1 } : post
    );
}
  },
});

// Export generated action creators
export const { addPosts, deletePosts, addRefresh, addId, hide, addLike, addUnlike } = postsSlice.actions;

// Export the reducer
export default postsSlice.reducer;