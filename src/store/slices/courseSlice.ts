import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '@/models/types';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  userProgress: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  userProgress: {},
  isLoading: false,
  error: null,
};

export const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.error = null;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
      state.error = null;
    },
    updateProgress: (state, action: PayloadAction<{ courseId: string; progress: number }>) => {
      const { courseId, progress } = action.payload;
      state.userProgress[courseId] = progress;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateCourseRating: (state, action: PayloadAction<{ courseId: string; rating: number }>) => {
      const { courseId, rating } = action.payload;
      const course = state.courses.find(c => c.id === courseId);
      if (course) {
        course.average_rating = rating;
      }
      if (state.currentCourse?.id === courseId) {
        state.currentCourse.average_rating = rating;
      }
    },
    incrementStudentCount: (state, action: PayloadAction<string>) => {
      const courseId = action.payload;
      const course = state.courses.find(c => c.id === courseId);
      if (course) {
        course.total_students += 1;
      }
      if (state.currentCourse?.id === courseId) {
        state.currentCourse.total_students += 1;
      }
    },
  },
});

export const {
  setCourses,
  setCurrentCourse,
  updateProgress,
  setLoading,
  setError,
  updateCourseRating,
  incrementStudentCount,
} = courseSlice.actions;

export default courseSlice.reducer; 