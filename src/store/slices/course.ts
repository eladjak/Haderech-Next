import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  lessons: Lesson[];
  average_rating: number;
  total_students: number;
  is_published: boolean;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
  last_position: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  progress: Record<string, Progress>;
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  currentLesson: null,
  progress: {},
  isLoading: false,
  error: null,
};

export const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourses: (state: CourseState, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    setCurrentCourse: (
      state: CourseState,
      action: PayloadAction<Course | null>,
    ) => {
      state.currentCourse = action.payload;
    },
    setCurrentLesson: (
      state: CourseState,
      action: PayloadAction<Lesson | null>,
    ) => {
      state.currentLesson = action.payload;
    },
    updateProgress: (
      state: CourseState,
      action: PayloadAction<{ lessonId: string; progress: Progress }>,
    ) => {
      state.progress[action.payload.lessonId] = action.payload.progress;
    },
    setLoading: (state: CourseState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: CourseState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCourses,
  setCurrentCourse,
  setCurrentLesson,
  updateProgress,
  setLoading,
  setError,
} = courseSlice.actions;

export const courseReducer = courseSlice.reducer;
