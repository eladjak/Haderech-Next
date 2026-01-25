import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import courseReducer from "./slices/courseSlice";
import forumReducer from "./slices/forumSlice";
import notificationReducer from "./slices/notificationSlice";
import simulatorReducer from "./slices/simulator";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    forum: forumReducer,
    simulator: simulatorReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActionPaths: ["payload.timestamp", "meta.arg"],
        ignoredPaths: ["ui.modalContent"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
