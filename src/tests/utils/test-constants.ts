// קבועי זמן
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

// קבועי תצוגה
export const DISPLAY_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  LARGE_DESKTOP_BREAKPOINT: 1440,
};

// קבועי טפסים
export const FORM_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 5000,
};

// קבועי פורום
export const FORUM_CONSTANTS = {
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  MAX_TAGS_PER_POST: 5,
  MAX_PINNED_POSTS: 3,
  MAX_TRENDING_TAGS: 10,
  MAX_TOP_CONTRIBUTORS: 5,
};

// קבועי הרשאות
export const PERMISSION_CONSTANTS = {
  ROLES: {
    ADMIN: "admin",
    INSTRUCTOR: "instructor",
    USER: "user",
    GUEST: "guest",
  },
  LEVELS: {
    BEGINNER: 1,
    INTERMEDIATE: 5,
    ADVANCED: 10,
    EXPERT: 20,
  },
};

// קבועי שגיאות
export const ERROR_CONSTANTS = {
  MESSAGES: {
    UNAUTHORIZED: "אין לך הרשאה לבצע פעולה זו",
    NOT_FOUND: "המשאב המבוקש לא נמצא",
    BAD_REQUEST: "הבקשה אינה תקינה",
    SERVER_ERROR: "אירעה שגיאה בשרת",
    VALIDATION_ERROR: "אחד או יותר מהשדות אינם תקינים",
  },
  CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500,
  },
};

// קבועי בדיקות
export const TEST_CONSTANTS = {
  TIMEOUT: {
    UNIT: 1000,
    INTEGRATION: 5000,
    E2E: 30000,
  },
  RETRIES: {
    UNIT: 0,
    INTEGRATION: 1,
    E2E: 2,
  },
  VIEWPORT: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1280, height: 800 },
  },
};

// קבועי נגישות
export const ACCESSIBILITY_CONSTANTS = {
  ROLES: {
    BUTTON: "button",
    LINK: "link",
    HEADING: "heading",
    NAVIGATION: "navigation",
    MAIN: "main",
    ARTICLE: "article",
    SECTION: "section",
    LIST: "list",
    LISTITEM: "listitem",
    DIALOG: "dialog",
    ALERT: "alert",
    STATUS: "status",
  },
  LABELS: {
    CLOSE: "סגור",
    MENU: "תפריט",
    SEARCH: "חיפוש",
    SUBMIT: "שלח",
    CANCEL: "בטל",
    BACK: "חזור",
    NEXT: "הבא",
    PREVIOUS: "הקודם",
  },
};

// קבועי אנימציה
export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    LINEAR: "linear",
    EASE: "ease",
    EASE_IN: "ease-in",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
  },
};

// ייצוא ברירת מחדל
export default {
  TIME_CONSTANTS,
  DISPLAY_CONSTANTS,
  FORM_CONSTANTS,
  FORUM_CONSTANTS,
  PERMISSION_CONSTANTS,
  ERROR_CONSTANTS,
  TEST_CONSTANTS,
  ACCESSIBILITY_CONSTANTS,
  ANIMATION_CONSTANTS,
};
