/**
 * English Translations
 *
 * Contains all English translations used throughout the application.
 * Organized by feature/component for easy maintenance.
 */

export const en = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    all: "All",
    submit: "Submit",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    more: "More",
    less: "Less",
  },
  auth: {
    login: "Login",
    register: "Register",
    logout: "Logout",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Full Name",
    username: "Username",
    rememberMe: "Remember Me",
    errors: {
      invalidEmail: "Invalid email address",
      invalidPassword: "Invalid password",
      passwordMismatch: "Passwords do not match",
      required: "Required field",
    },
  },
  courses: {
    title: "Courses",
    all: "All Courses",
    my: "My Courses",
    recommended: "Recommended Courses",
    popular: "Popular Courses",
    new: "New Courses",
    free: "Free Courses",
    premium: "Premium Courses",
    levels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    status: {
      notStarted: "Not Started",
      inProgress: "In Progress",
      completed: "Completed",
    },
    details: {
      duration: "Course Duration",
      lessons: "Lessons",
      students: "Students",
      rating: "Rating",
      instructor: "Instructor",
      price: "Price",
      level: "Level",
      requirements: "Prerequisites",
      description: "Course Description",
    },
  },
  forum: {
    title: "Forum",
    categories: "Categories",
    topics: "Topics",
    posts: "Posts",
    replies: "Replies",
    latestPosts: "Latest Posts",
    popularTopics: "Popular Topics",
    createPost: "Create New Post",
    createTopic: "Create New Topic",
    search: "Search Forum",
    sort: {
      latest: "Latest",
      popular: "Popular",
      unanswered: "Unanswered",
    },
  },
  profile: {
    title: "Profile",
    edit: "Edit Profile",
    settings: "Settings",
    preferences: "Preferences",
    notifications: "Notifications",
    security: "Security",
    privacy: "Privacy",
    activity: "Activity",
    progress: "Progress",
    achievements: "Achievements",
    stats: {
      coursesCompleted: "Courses Completed",
      hoursLearned: "Hours Learned",
      points: "Points",
      rank: "Rank",
    },
  },
  simulator: {
    title: "Simulator",
    start: "Start Simulation",
    stop: "Stop Simulation",
    reset: "Reset Simulation",
    scenarios: "Scenarios",
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
    feedback: {
      positive: "Positive Feedback",
      negative: "Negative Feedback",
      neutral: "Neutral Feedback",
    },
  },
} as const;

export type Translations = typeof en;
