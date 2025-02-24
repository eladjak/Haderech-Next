import { screen } from "@testing-library/react";

// שאילתות לפי תפקיד
export const byRole = {
  // כפתורים
  getSubmitButton: () => screen.getByRole("button", { name: /שלח|פרסם/i }),
  getCancelButton: () => screen.getByRole("button", { name: /בטל/i }),
  getCloseButton: () => screen.getByRole("button", { name: /סגור/i }),
  getMenuButton: () => screen.getByRole("button", { name: /תפריט/i }),
  getSearchButton: () => screen.getByRole("button", { name: /חיפוש/i }),

  // קישורים
  getHomeLink: () => screen.getByRole("link", { name: /דף הבית/i }),
  getProfileLink: () => screen.getByRole("link", { name: /פרופיל/i }),
  getSettingsLink: () => screen.getByRole("link", { name: /הגדרות/i }),
  getLogoutLink: () => screen.getByRole("link", { name: /התנתק/i }),

  // כותרות
  getMainHeading: () => screen.getByRole("heading", { level: 1 }),
  getSectionHeading: () => screen.getByRole("heading", { level: 2 }),
  getSubHeading: () => screen.getByRole("heading", { level: 3 }),

  // טפסים
  getForm: () => screen.getByRole("form"),
  getSearchbox: () => screen.getByRole("searchbox"),
  getCombobox: () => screen.getByRole("combobox"),
  getTextbox: () => screen.getByRole("textbox"),
  getCheckbox: () => screen.getByRole("checkbox"),
  getRadio: () => screen.getByRole("radio"),
};

// שאילתות לפי תווית
export const byLabel = {
  // שדות טופס
  getEmailInput: () => screen.getByLabelText(/אימייל/i),
  getPasswordInput: () => screen.getByLabelText(/סיסמה/i),
  getUsernameInput: () => screen.getByLabelText(/שם משתמש/i),
  getNameInput: () => screen.getByLabelText(/שם מלא/i),
  getBioInput: () => screen.getByLabelText(/אודות/i),

  // תיבות בחירה
  getCategorySelect: () => screen.getByLabelText(/קטגוריה/i),
  getTagsSelect: () => screen.getByLabelText(/תגיות/i),
  getSortSelect: () => screen.getByLabelText(/מיון/i),
  getFilterSelect: () => screen.getByLabelText(/סינון/i),

  // אפשרויות
  getRememberMeCheckbox: () => screen.getByLabelText(/זכור אותי/i),
  getAgreeTermsCheckbox: () => screen.getByLabelText(/אני מסכים/i),
  getNotificationsCheckbox: () => screen.getByLabelText(/התראות/i),
};

// שאילתות לפי מחזיק מקום
export const byPlaceholder = {
  // שדות טקסט
  getSearchInput: () => screen.getByPlaceholderText(/חיפוש/i),
  getTitleInput: () => screen.getByPlaceholderText(/כותרת/i),
  getContentInput: () => screen.getByPlaceholderText(/תוכן/i),
  getCommentInput: () => screen.getByPlaceholderText(/תגובה/i),
  getMessageInput: () => screen.getByPlaceholderText(/הודעה/i),
};

// שאילתות לפי טקסט
export const byText = {
  // כותרות
  getWelcomeText: () => screen.getByText(/ברוכים הבאים/i),
  getErrorText: () => screen.getByText(/שגיאה/i),
  getSuccessText: () => screen.getByText(/בהצלחה/i),
  getLoadingText: () => screen.getByText(/טוען/i),

  // הודעות
  getEmptyStateText: () => screen.getByText(/אין תוצאות/i),
  getValidationText: () => screen.getByText(/שדה חובה/i),
  getConfirmationText: () => screen.getByText(/האם אתה בטוח/i),
  getDeleteText: () => screen.getByText(/מחיקה/i),
};

// שאילתות לפי מזהה בדיקה
export const byTestId = {
  // אזורים
  getHeader: () => screen.getByTestId("header"),
  getFooter: () => screen.getByTestId("footer"),
  getSidebar: () => screen.getByTestId("sidebar"),
  getMain: () => screen.getByTestId("main"),

  // רכיבים
  getLoader: () => screen.getByTestId("loader"),
  getModal: () => screen.getByTestId("modal"),
  getToast: () => screen.getByTestId("toast"),
  getAlert: () => screen.getByTestId("alert"),

  // תוכן
  getPost: (id: string) => screen.getByTestId(`post-${id}`),
  getComment: (id: string) => screen.getByTestId(`comment-${id}`),
  getUser: (id: string) => screen.getByTestId(`user-${id}`),
  getTag: (id: string) => screen.getByTestId(`tag-${id}`),
};

// שאילתות לפי תמונה
export const byImage = {
  // תמונות פרופיל
  getAvatar: () => screen.getByAltText(/תמונת פרופיל/i),
  getLogo: () => screen.getByAltText(/לוגו/i),
  getBanner: () => screen.getByAltText(/באנר/i),
  getThumbnail: () => screen.getByAltText(/תמונה ממוזערת/i),
};

// שאילתות לפי כותרת
export const byTitle = {
  // כפתורים
  getEditButton: () => screen.getByTitle(/ערוך/i),
  getDeleteButton: () => screen.getByTitle(/מחק/i),
  getShareButton: () => screen.getByTitle(/שתף/i),
  getLikeButton: () => screen.getByTitle(/לייק/i),
};

// ייצוא ברירת מחדל
export default {
  byRole,
  byLabel,
  byPlaceholder,
  byText,
  byTestId,
  byImage,
  byTitle,
};
