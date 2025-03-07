import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Course, CourseWithRelations } from "@/types/courses";
import type { Lesson } from "@/types/models";

interface CourseState {
  courses: Course[];
  currentCourse: CourseWithRelations | null;
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

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    setCurrentCourse: (
      state,
      action: PayloadAction<CourseWithRelations | null>
    ) => {
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
        state.currentCourse = { ...state.currentCourse, ...action.payload };
      }
    },
    incrementStudents: (state) => {
      if (state.currentCourse && state.currentCourse._count) {
        state.currentCourse._count.students += 1;
      }
    },
    updateProgress: (
      state,
      action: PayloadAction<{ lessonId: string; progress: number }>
    ) => {
      if (state.currentCourse && state.currentCourse.lessons) {
        const lessonIndex = state.currentCourse.lessons.findIndex(
          (l) => l.id === action.payload.lessonId
        );
        if (lessonIndex !== -1) {
          // Update progress in the lesson
          const lesson = state.currentCourse.lessons[lessonIndex];
          if (!lesson.progress) {
            lesson.progress = [];
          }
          // Set progress, in a real implementation this would add/update a progress record
        }
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
  updateProgress,
  setLoading,
  setError,
} = courseSlice.actions;

export default courseSlice.reducer;
