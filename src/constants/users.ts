import type { Author } from "@/types/forum";
import type { User } from "@/types/models";
import type { SimulatorUserSettings } from "@/types/simulator";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    full_name: "John Doe",
    username: "johndoe",
    bio: "מפתח Full Stack עם 5 שנות ניסיון",
    image: "/images/avatars/john.jpg",
    avatar_url: "/images/avatars/john.jpg",
    role: "user",
    points: 1000,
    level: 5,
    badges: ["מפתח מצטיין", "מנטור"],
    achievements: ["first_login", "complete_profile"],
    preferences: {
      theme: "light",
      language: "he",
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
      simulator: {
        difficulty: "intermediate",
        language: "he",
        feedback_frequency: "high",
        auto_suggestions: true,
        theme: "light",
      },
    },
    progress: {
      id: "1",
      user_id: "1",
      points: 1000,
      level: 5,
      xp: 2500,
      next_level_xp: 3000,
      badges: ["מפתח מצטיין", "מנטור"],
      achievements: ["first_login", "complete_profile"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completedLessons: ["lesson1", "lesson2"],
      courseProgress: {
        course1: 100,
        course2: 100,
        course3: 50,
      },
      courses: {
        completed: ["course1", "course2"],
        in_progress: ["course3"],
        bookmarked: ["course4", "course5"],
      },
      lessons: {
        completed: ["lesson1", "lesson2"],
        in_progress: ["lesson3"],
      },
      simulator: {
        completed_scenarios: ["scenario1", "scenario2"],
        results: [],
        stats: {
          total_sessions: 5,
          average_score: 85,
          time_spent: 7200,
        },
      },
      forum: {
        posts: ["post1", "post2"],
        comments: ["comment1"],
        likes: ["like1", "like2"],
        bookmarks: ["bookmark1"],
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "jane@example.com",
    name: "Jane Smith",
    full_name: "Jane Smith",
    username: "janesmith",
    bio: "מפתחת Frontend עם התמחות ב-React",
    image: "/images/avatars/jane.jpg",
    avatar_url: "/images/avatars/jane.jpg",
    role: "user",
    points: 750,
    level: 3,
    badges: ["מפתחת מצטיינת"],
    achievements: ["first_login"],
    preferences: {
      theme: "dark",
      language: "he",
      notifications: {
        email: false,
        push: true,
        desktop: false,
      },
      simulator: {
        difficulty: "beginner",
        language: "he",
        feedback_frequency: "medium",
        auto_suggestions: true,
        theme: "dark",
      },
    },
    progress: {
      id: "2",
      user_id: "2",
      points: 750,
      level: 3,
      xp: 1500,
      next_level_xp: 2000,
      badges: ["מפתחת מצטיינת"],
      achievements: ["first_login"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completedLessons: ["lesson1"],
      courseProgress: {
        course1: 100,
        course2: 50,
        course3: 25,
      },
      courses: {
        completed: ["course1"],
        in_progress: ["course2", "course3"],
        bookmarked: ["course4"],
      },
      lessons: {
        completed: ["lesson1"],
        in_progress: ["lesson2"],
      },
      simulator: {
        completed_scenarios: ["scenario1"],
        results: [],
        stats: {
          total_sessions: 3,
          average_score: 75,
          time_spent: 3600,
        },
      },
      forum: {
        posts: ["post1"],
        comments: [],
        likes: ["like1"],
        bookmarks: [],
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const users: Author[] = [
  {
    id: "1",
    name: "ישראל ישראלי",
    email: "israel@example.com",
    username: "israel",
    role: "user",
    points: 100,
    level: 1,
    badges: ["משתתף פעיל"],
    achievements: ["10 פוסטים"],
    full_name: "ישראל ישראלי",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    posts_count: 10,
    likes_received: 20,
  },
];
