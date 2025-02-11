/**
 * Hebrew Translations
 *
 * Contains all Hebrew translations used throughout the application.
 * Organized by feature/component for easy maintenance.
 */

export const he = {
  common: {
    loading: "טוען...",
    error: "שגיאה",
    success: "הצלחה",
    save: "שמור",
    cancel: "בטל",
    delete: "מחק",
    edit: "ערוך",
    create: "צור",
    back: "חזור",
    next: "הבא",
    previous: "הקודם",
    search: "חיפוש",
    filter: "סינון",
    sort: "מיון",
    all: "הכל",
    submit: "שלח",
    close: "סגור",
    open: "פתח",
    yes: "כן",
    no: "לא",
    more: "עוד",
    less: "פחות",
  },
  auth: {
    login: "התחברות",
    register: "הרשמה",
    logout: "התנתק",
    forgotPassword: "שכחת סיסמה?",
    resetPassword: "איפוס סיסמה",
    email: "דואר אלקטרוני",
    password: "סיסמה",
    confirmPassword: "אימות סיסמה",
    name: "שם מלא",
    username: "שם משתמש",
    rememberMe: "זכור אותי",
    errors: {
      invalidEmail: "כתובת דואר אלקטרוני לא תקינה",
      invalidPassword: "סיסמה לא תקינה",
      passwordMismatch: "הסיסמאות אינן תואמות",
      required: "שדה חובה",
    },
  },
  courses: {
    title: "קורסים",
    all: "כל הקורסים",
    my: "הקורסים שלי",
    recommended: "קורסים מומלצים",
    popular: "קורסים פופולריים",
    new: "קורסים חדשים",
    free: "קורסים חינמיים",
    premium: "קורסים בתשלום",
    levels: {
      beginner: "מתחילים",
      intermediate: "מתקדמים",
      advanced: "מומחים",
    },
    status: {
      notStarted: "טרם התחלת",
      inProgress: "בתהליך",
      completed: "הושלם",
    },
    details: {
      duration: "משך הקורס",
      lessons: "שיעורים",
      students: "תלמידים",
      rating: "דירוג",
      instructor: "מדריך",
      price: "מחיר",
      level: "רמה",
      requirements: "דרישות מקדימות",
      description: "תיאור הקורס",
    },
  },
  forum: {
    title: "פורום",
    categories: "קטגוריות",
    topics: "נושאים",
    posts: "פוסטים",
    replies: "תגובות",
    latestPosts: "פוסטים אחרונים",
    popularTopics: "נושאים פופולריים",
    createPost: "צור פוסט חדש",
    createTopic: "צור נושא חדש",
    search: "חפש בפורום",
    sort: {
      latest: "חדש ביותר",
      popular: "פופולרי",
      unanswered: "ללא מענה",
    },
  },
  profile: {
    title: "פרופיל",
    edit: "ערוך פרופיל",
    settings: "הגדרות",
    preferences: "העדפות",
    notifications: "התראות",
    security: "אבטחה",
    privacy: "פרטיות",
    activity: "פעילות",
    progress: "התקדמות",
    achievements: "הישגים",
    stats: {
      coursesCompleted: "קורסים שהושלמו",
      hoursLearned: "שעות למידה",
      points: "נקודות",
      rank: "דירוג",
    },
  },
  simulator: {
    title: "סימולטור",
    start: "התחל סימולציה",
    stop: "עצור סימולציה",
    reset: "אפס סימולציה",
    scenarios: "תרחישים",
    difficulty: {
      easy: "קל",
      medium: "בינוני",
      hard: "קשה",
    },
    feedback: {
      positive: "משוב חיובי",
      negative: "משוב שלילי",
      neutral: "משוב נייטרלי",
    },
  },
} as const;

export type Translations = typeof he;
