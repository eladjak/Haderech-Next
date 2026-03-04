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
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    estimatedHours: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_order", ["order"])
    .index("by_category", ["category"]),

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
    watchTimeSeconds: v.optional(v.number()), // סך זמן צפייה בשניות
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

  // התראות למשתמשים
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("achievement"),
      v.literal("comment_reply"),
      v.literal("course_update"),
      v.literal("certificate"),
      v.literal("quiz_result")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()), // URL לניווט
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  // הערות פרטיות של סטודנטים בשיעורים
  notes: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user", ["userId"]),

  // תגובות / דיונים בשיעורים
  comments: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // לתגובות תשובה (thread)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

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

  // סשנים של צ'אט עם המאמן AI
  chatSessions: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.optional(v.string()),
    mode: v.union(
      v.literal("coach"),
      v.literal("practice"),
      v.literal("analysis")
    ),
    messageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  // הודעות בצ'אט
  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_created", ["sessionId", "createdAt"]),

  // סימולטור דייטינג - תרחישים
  simulatorScenarios: defineTable({
    title: v.string(),
    description: v.string(),
    personaName: v.string(),
    personaAge: v.number(),
    personaGender: v.union(v.literal("male"), v.literal("female")),
    personaBackground: v.string(),
    personaPersonality: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    category: v.string(),
    scenarioContext: v.string(),
    published: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_order", ["order"])
    .index("by_difficulty", ["difficulty"]),

  // סימולטור דייטינג - סשנים
  simulatorSessions: defineTable({
    userId: v.string(),
    scenarioId: v.id("simulatorScenarios"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    messageCount: v.number(),
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    strengths: v.optional(v.array(v.string())),
    improvements: v.optional(v.array(v.string())),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_user_status", ["userId", "status"]),

  // סימולטור דייטינג - הודעות
  simulatorMessages: defineTable({
    sessionId: v.id("simulatorSessions"),
    role: v.union(
      v.literal("user"),
      v.literal("persona"),
      v.literal("narrator")
    ),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // קהילה - נושאים/פוסטים
  communityTopics: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("dating-tips"),
      v.literal("success-stories"),
      v.literal("questions"),
      v.literal("advice")
    ),
    pinned: v.boolean(),
    likesCount: v.number(),
    repliesCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // קהילה - תגובות לנושאים
  communityReplies: defineTable({
    topicId: v.id("communityTopics"),
    userId: v.id("users"),
    content: v.string(),
    likesCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_user", ["userId"]),

  // לייקים לנושאים בקהילה
  communityTopicLikes: defineTable({
    topicId: v.id("communityTopics"),
    userId: v.id("users"),
  })
    .index("by_topic", ["topicId"])
    .index("by_user_topic", ["userId", "topicId"]),

  // לייקים לתגובות בקהילה
  communityReplyLikes: defineTable({
    replyId: v.id("communityReplies"),
    userId: v.id("users"),
  })
    .index("by_reply", ["replyId"])
    .index("by_user_reply", ["userId", "replyId"]),
});
