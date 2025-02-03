import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { authReducer } from './slices/auth'
import { uiReducer } from './slices/ui'
import courseReducer from './slices/courseSlice'
import userReducer from './slices/userSlice'
import forumReducer from './slices/forumSlice'
import notificationReducer from './slices/notificationSlice'
import simulatorReducer from './slices/simulatorSlice'
import { socialReducer } from './slices/social'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    course: courseReducer,
    user: userReducer,
    forum: forumReducer,
    notifications: notificationReducer,
    simulator: simulatorReducer,
    social: socialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'ui.toast'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector 