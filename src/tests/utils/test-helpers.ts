import { act } from "@testing-library/react";
import { vi } from "vitest";

// פונקציות עזר לטסטים
export const testHelpers = {
  // פונקציות עזר לזמן
  time: {
    // המתנה למספר מילישניות
    async wait(ms: number) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, ms));
      });
    },

    // המתנה לטיק הבא
    async nextTick() {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    },

    // המתנה למספר טיקים
    async waitTicks(ticks: number) {
      for (let i = 0; i < ticks; i++) {
        await this.nextTick();
      }
    },

    // המתנה לאנימציה
    async waitForAnimation() {
      await this.wait(300); // זמן ברירת מחדל לאנימציה
    },

    // המתנה לטרנזיציה
    async waitForTransition() {
      await this.wait(150); // זמן ברירת מחדל לטרנזיציה
    },
  },

  // פונקציות עזר לאירועים
  events: {
    // הדמיית אירוע מקלדת
    simulateKeyPress(key: string, options?: KeyboardEventInit) {
      const event = new KeyboardEvent("keypress", {
        key,
        bubbles: true,
        cancelable: true,
        ...options,
      });
      document.dispatchEvent(event);
    },

    // הדמיית אירוע עכבר
    simulateMouseEvent(
      type: "click" | "mousedown" | "mouseup" | "mousemove",
      options?: MouseEventInit
    ) {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        ...options,
      });
      document.dispatchEvent(event);
    },

    // הדמיית אירוע מגע
    simulateTouchEvent(
      type: "touchstart" | "touchend" | "touchmove",
      options?: TouchEventInit
    ) {
      const event = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        ...options,
      });
      document.dispatchEvent(event);
    },
  },

  // פונקציות עזר לטפסים
  forms: {
    // מילוי טופס
    async fillForm(formData: Record<string, string>) {
      await act(async () => {
        Object.entries(formData).forEach(([name, value]) => {
          const input = document.querySelector(
            `[name="${name}"]`
          ) as HTMLInputElement;
          if (input) {
            input.value = value;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    },

    // שליחת טופס
    async submitForm(formElement: HTMLFormElement) {
      await act(async () => {
        formElement.dispatchEvent(new Event("submit", { bubbles: true }));
      });
    },

    // איפוס טופס
    async resetForm(formElement: HTMLFormElement) {
      await act(async () => {
        formElement.reset();
        formElement.dispatchEvent(new Event("reset", { bubbles: true }));
      });
    },
  },

  // פונקציות עזר לניווט
  navigation: {
    // הדמיית שינוי נתיב
    simulatePathChange(path: string) {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new Event("popstate"));
    },

    // הדמיית שינוי חיפוש
    simulateSearchChange(search: string) {
      window.history.pushState({}, "", `${window.location.pathname}${search}`);
      window.dispatchEvent(new Event("popstate"));
    },

    // הדמיית שינוי האש
    simulateHashChange(hash: string) {
      window.history.pushState({}, "", `${window.location.pathname}${hash}`);
      window.dispatchEvent(new Event("hashchange"));
    },
  },

  // פונקציות עזר לאחסון
  storage: {
    // ניקוי אחסון מקומי
    clearLocalStorage() {
      localStorage.clear();
      window.dispatchEvent(new Event("storage"));
    },

    // ניקוי אחסון מפגש
    clearSessionStorage() {
      sessionStorage.clear();
      window.dispatchEvent(new Event("storage"));
    },

    // ניקוי עוגיות
    clearCookies() {
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    },
  },

  // פונקציות עזר למוקים
  mocks: {
    // מוק לפונקציה
    mockFunction() {
      return vi.fn();
    },

    // מוק לפונקציה עם ערך חזרה
    mockFunctionWithReturn<T>(returnValue: T) {
      return vi.fn().mockReturnValue(returnValue);
    },

    // מוק לפונקציה אסינכרונית
    mockAsyncFunction<T>(returnValue: T) {
      return vi.fn().mockResolvedValue(returnValue);
    },

    // מוק לפונקציה שזורקת שגיאה
    mockErrorFunction(error: Error) {
      return vi.fn().mockRejectedValue(error);
    },
  },

  // פונקציות עזר לבדיקות
  assertions: {
    // בדיקה שאלמנט מוצג
    isElementVisible(element: Element) {
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    },

    // בדיקה שאלמנט בפוקוס
    isElementFocused(element: Element) {
      return document.activeElement === element;
    },

    // בדיקה שאלמנט מושבת
    isElementDisabled(element: HTMLElement) {
      return element.hasAttribute("disabled");
    },

    // בדיקה שאלמנט נדרש
    isElementRequired(element: HTMLElement) {
      return element.hasAttribute("required");
    },
  },
};

// ייצוא ברירת מחדל
export default testHelpers;
