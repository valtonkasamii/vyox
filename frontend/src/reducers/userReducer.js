import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addToken: (state, action) => {
        state.token = action.payload
    },
    logout: (state) => {
      state.token = null
    }
  },
});

// Export generated action creators
export const { addToken, logout } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;