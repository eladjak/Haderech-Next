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
    preferences: v.optional(
      v.object({
        interests: v.optional(v.array(v.string())),
        onboardingCompleted: v.optional(v.boolean()),
        notifications: v.optional(
          v.object({
            email: v.optional(v.boolean()),
            dailyReminder: v.optional(v.boolean()),
            community: v.optional(v.boolean()),
            dailyTip: v.optional(v.boolean()),
            courseUpdates: v.optional(v.boolean()),
            promotions: v.optional(v.boolean()),
          })
        ),
        display: v.optional(
          v.object({
            theme: v.optional(
              v.union(
                v.literal("light"),
                v.literal("dark"),
                v.literal("system")
              )
            ),
            fontSize: v.optional(
              v.union(
                v.literal("small"),
                v.literal("normal"),
                v.literal("large")
              )
            ),
          })
        ),
        learning: v.optional(
          v.object({
            weeklyGoal: v.optional(v.number()),
            preferredTime: v.optional(
              v.union(
                v.literal("morning"),
                v.literal("afternoon"),
                v.literal("evening")
              )
            ),
          })
        ),
        deletionRequested: v.optional(v.boolean()),
        deletionRequestedAt: v.optional(v.number()),
      })
    ),
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

  // סימולטור - תרחישי דיאלוג מובנה (Phase 68)
  dialogueScenarios: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    category: v.string(),
    estimatedMinutes: v.number(),
    personaName: v.string(),
    personaEmoji: v.string(),
    personaDescription: v.string(),
    dialoguePoints: v.array(
      v.object({
        id: v.string(),
        situation: v.string(),
        options: v.array(
          v.object({
            text: v.string(),
            score: v.number(), // 0-3
            feedback: v.string(),
          })
        ),
        tip: v.string(),
      })
    ),
    published: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_order", ["order"])
    .index("by_difficulty", ["difficulty"]),

  // סימולטור - סשנים מובנים
  dialogueSessions: defineTable({
    userId: v.string(),
    scenarioId: v.id("dialogueScenarios"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    currentStep: v.number(), // which dialogue point
    choices: v.array(
      v.object({
        stepId: v.string(),
        choiceIndex: v.number(),
        score: v.number(),
        feedback: v.string(),
      })
    ),
    totalScore: v.optional(v.number()), // 0-100 final score
    maxPossibleScore: v.optional(v.number()),
    grade: v.optional(v.string()), // A/B/C/D
    summaryFeedback: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_user_status", ["userId", "status"]),

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

  // תוכן יומי - טיפים, ציטוטים, אתגרים
  dailyContent: defineTable({
    type: v.union(
      v.literal("tip"),
      v.literal("quote"),
      v.literal("challenge")
    ),
    content: v.string(),
    author: v.optional(v.string()),
    category: v.string(),
    dayOfYear: v.number(), // 1-365, מתחלף מדי שנה
    createdAt: v.number(),
  }).index("by_day", ["dayOfYear"]),

  // השלמת אתגרים יומיים על ידי משתמשים
  dailyChallengeCompletions: defineTable({
    userId: v.string(), // Clerk user ID
    dayOfYear: v.number(), // 1-365
    year: v.number(), // calendar year
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_day_year", ["userId", "dayOfYear", "year"]),

  // פניות יצירת קשר מהאתר
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied")
    ),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // XP אירועים
  xpEvents: defineTable({
    userId: v.id("users"),
    type: v.string(), // "lesson_complete", "quiz_pass", "streak_day", "chat_session", "simulator_complete", "community_post", "daily_login"
    points: v.number(),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),

  // תגים/הישגים
  badges: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(), // emoji
    category: v.union(
      v.literal("learning"),
      v.literal("social"),
      v.literal("streak"),
      v.literal("achievement")
    ),
    requiredXp: v.optional(v.number()),
    condition: v.string(), // e.g., "lessons_completed >= 10"
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  // תגים שהמשתמש השיג
  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_badge", ["userId", "badgeId"]),

  // ביקורות על קורסים
  courseReviews: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    rating: v.number(), // 1-5
    title: v.string(),
    content: v.string(),
    helpful: v.number(), // count of "helpful" votes
    wouldRecommend: v.optional(v.boolean()), // האם ממליץ על הקורס
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"]),

  // הצבעות "מועיל" על ביקורות
  reviewVotes: defineTable({
    reviewId: v.id("courseReviews"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_review", ["reviewId"])
    .index("by_user_review", ["userId", "reviewId"]),

  // מנטורים / מאמנים
  mentors: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.string(),
    specialties: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    pricePerSession: v.number(), // price in ILS
    sessionDuration: v.number(), // minutes (30, 45, 60)
    available: v.boolean(),
    rating: v.optional(v.number()),
    totalSessions: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_available", ["available"]),

  // הזמנות ליעוץ
  mentoringSessions: defineTable({
    mentorId: v.id("mentors"),
    studentId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    scheduledAt: v.number(), // timestamp of scheduled session
    duration: v.number(), // minutes
    notes: v.optional(v.string()), // student notes for mentor
    mentorNotes: v.optional(v.string()), // mentor's session notes
    rating: v.optional(v.number()), // student rating after session
    createdAt: v.number(),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"]),

  // בלוג - מאמרים
  blogPosts: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(), // markdown content
    coverImage: v.optional(v.string()),
    category: v.union(
      v.literal("dating-tips"),
      v.literal("relationship"),
      v.literal("self-improvement"),
      v.literal("communication"),
      v.literal("psychology")
    ),
    tags: v.array(v.string()),
    published: v.boolean(),
    readTime: v.number(), // estimated minutes
    views: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_category", ["category"])
    .index("by_created", ["createdAt"]),

  // מנויים / subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("vip")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_status", ["status"]),

  // היסטוריית תשלומים
  payments: defineTable({
    userId: v.id("users"),
    subscriptionId: v.optional(v.id("subscriptions")),
    amount: v.number(), // in agorot (ILS cents)
    currency: v.string(), // "ILS"
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_status", ["status"]),

  // סיפורי הצלחה / עדויות
  successStories: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(), // can be anonymous
    story: v.string(),
    imageUrl: v.optional(v.string()),
    rating: v.number(), // 1-5 satisfaction
    isAnonymous: v.boolean(),
    approved: v.boolean(), // admin must approve
    featured: v.boolean(), // shown on landing page
    category: v.union(
      v.literal("dating"),
      v.literal("relationship"),
      v.literal("self-growth"),
      v.literal("marriage")
    ),
    createdAt: v.number(),
  })
    .index("by_approved", ["approved"])
    .index("by_featured", ["featured"])
    .index("by_category", ["category"]),

  // אונבורדינג למשתמשים חדשים
  userOnboarding: defineTable({
    userId: v.string(),
    completed: v.boolean(),
    currentStep: v.number(),
    answers: v.object({
      goals: v.optional(v.array(v.string())),
      experience: v.optional(v.string()),
      preferredTopics: v.optional(v.array(v.string())),
      ageRange: v.optional(v.string()),
    }),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // העדפות משתמש מורחבות
  userPreferences: defineTable({
    userId: v.string(), // Clerk user ID
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    weeklyDigest: v.boolean(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    language: v.union(v.literal("he"), v.literal("en")),
    displayDensity: v.union(v.literal("comfortable"), v.literal("compact")),
    courseReminders: v.boolean(),
    achievementAlerts: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // סימניות / מועדפים
  bookmarks: defineTable({
    userId: v.string(),
    itemType: v.string(), // "course" | "lesson" | "blog"
    itemId: v.string(),
    itemTitle: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_item", ["userId", "itemType", "itemId"]),

  // משאבים - מדריכים, תרגילים, דפי עבודה
  resources: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("guides"),    // מדריכים
      v.literal("exercises"), // תרגילים
      v.literal("worksheets"), // דפי עבודה
      v.literal("summaries")  // סיכומים
    ),
    type: v.union(
      v.literal("pdf"),
      v.literal("worksheet"),
      v.literal("exercise"),
      v.literal("summary")
    ),
    estimatedTime: v.number(), // minutes
    isFree: v.boolean(),
    downloadCount: v.number(),
    content: v.string(), // markdown content
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_free", ["isFree"])
    .index("by_downloads", ["downloadCount"]),

  // סימניות למשאבים
  resourceBookmarks: defineTable({
    userId: v.string(),
    resourceId: v.id("resources"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_resource", ["userId", "resourceId"]),

  // Push notification subscriptions
  pushSubscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    endpoint: v.string(), // Push endpoint URL
    p256dh: v.string(), // Public key
    auth: v.string(), // Auth secret
    userAgent: v.optional(v.string()), // Browser/device info
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"])
    .index("by_user_active", ["userId", "active"]),

  // השלמות אתגרים שבועיים - Phase 74
  weeklyChallengCompletions: defineTable({
    userId: v.id("users"),
    challengeSlug: v.string(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_slug", ["userId", "challengeSlug"]),

  // מימוש פרסים - Phase 74
  rewardRedemptions: defineTable({
    userId: v.id("users"),
    rewardSlug: v.string(),
    rewardTitle: v.string(),
    xpSpent: v.number(),
    redeemedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_reward", ["userId", "rewardSlug"]),

  // פרופילי דייטינג - Phase 70
  datingProfiles: defineTable({
    clerkId: v.string(),
    displayName: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    lookingFor: v.optional(
      v.union(
        v.literal("relationship"),
        v.literal("casual"),
        v.literal("friendship"),
        v.literal("not-sure")
      )
    ),
    genderIdentity: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    customInterests: v.optional(v.array(v.string())),
    idealPartner: v.optional(v.string()),
    dealBreakers: v.optional(v.array(v.string())),
    relationshipValues: v.optional(v.array(v.string())),
    completenessScore: v.optional(v.number()),
    currentStep: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]),
});
