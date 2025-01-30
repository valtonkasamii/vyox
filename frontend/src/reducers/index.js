import { combineReducers } from 'redux';
import postsReducer from './postsReducer';

const rootReducer = combineReducers({
  posts: postsReducer,
  // Add other reducers here
});

export default rootReducer;