import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // קורסים
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    published: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_order", ["order"]),

  // שיעורים
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()), // משך בשניות
    order: v.number(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  // משתמשים (מסונכרן עם Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // הרשמות לקורסים
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  // התקדמות בשיעורים
  progress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    completed: v.boolean(),
    progressPercent: v.number(), // 0-100
    lastWatchedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // בחנים (quizzes) - שייכים לשיעור
  quizzes: defineTable({
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    title: v.string(),
    passingScore: v.number(), // 0-100, ציון מעבר
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_course", ["courseId"]),

  // שאלות בבוחן
  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()), // אפשרויות תשובה
    correctIndex: v.number(), // אינדקס התשובה הנכונה
    explanation: v.optional(v.string()), // הסבר לתשובה הנכונה
    order: v.number(),
  }).index("by_quiz", ["quizId"]),

  // תוצאות בוחן של משתמש
  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    answers: v.array(v.number()), // אינדקסי התשובות שנבחרו
    score: v.number(), // ציון 0-100
    passed: v.boolean(),
    attemptedAt: v.number(),
  })
    .index("by_user_quiz", ["userId", "quizId"])
    .index("by_user_course", ["userId", "courseId"]),

  // תעודות סיום
  certificates: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    userName: v.string(),
    courseName: v.string(),
    completionPercent: v.number(),
    issuedAt: v.number(),
    certificateNumber: v.string(), // מספר תעודה ייחודי
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_certificate_number", ["certificateNumber"]),
});
