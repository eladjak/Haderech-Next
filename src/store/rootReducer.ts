import { combineReducers } from "@reduxjs/toolkit";
import courseReducer from "./slices/courseSlice";
import forumReducer from "./slices/forumSlice";
import simulatorReducer from "./slices/simulatorSlice";
import userReducer from "./slices/userSlice";

export const rootReducer = combineReducers({
  course: courseReducer,
  forum: forumReducer,
  simulator: simulatorReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
