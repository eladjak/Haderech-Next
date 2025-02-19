import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Course, Lesson } from "@/types/models";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  currentLesson: null,
  loading: false,
  error: null,
};

export const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
    },
    updateCourse: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(
        (course) => course.id === action.payload.id
      );
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?.id === action.payload.id) {
        state.currentCourse = action.payload;
      }
    },
    incrementStudents: (state, action: PayloadAction<string>) => {
      const course = state.courses.find(
        (course) => course.id === action.payload
      );
      if (course) {
        course.total_students += 1;
      }
      if (state.currentCourse?.id === action.payload) {
        state.currentCourse.total_students += 1;
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
  setCourses,
  setCurrentCourse,
  setCurrentLesson,
  updateCourse,
  incrementStudents,
  setLoading,
  setError,
} = courseSlice.actions;

export default courseSlice.reducer;
