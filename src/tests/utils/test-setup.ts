import { TextDecoder, TextEncoder } from "util";
import React from "react";
import "@testing-library/jest-dom";
import { afterEach, expect, vi } from "vitest";
import "@testing-library/dom";
import matchers from "@testing-library/jest-dom/matchers";
import { cleanup, configure } from "@testing-library/react";
import axe from "axe-core";
import "./test-matchers";
import type { Mock } from "vitest";
import { mockSupabaseClient } from "./test-mocks";

// הגדרת axe-core
global.axe = axe;

// מוקים גלובליים
class MockResizeObserverClass {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("ResizeObserver", MockResizeObserverClass);

class MockIntersectionObserverClass {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserverClass);

vi.stubGlobal("fetch", vi.fn());

const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});
vi.stubGlobal("matchMedia", mockMatchMedia);

// מוקים לספריות
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "",
    query: {},
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

// הוספנו טיפוסים מפורשים ל-props
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: any;
  }) => React.createElement("img", { src, alt, ...props }),
}));

// מוקים לשירותים
const createMockSupabaseClient = () => ({
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }),
});

vi.mock("@/lib/services/supabase", () => ({
  createSupabaseClient: vi.fn(() => createMockSupabaseClient()),
}));

// מוקים לקומפוננטות UI
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// מוקים לאנליטיקס
vi.mock("@vercel/analytics/react", () => ({
  Analytics: vi.fn(() => null),
}));

// הגדרות גלובליות
beforeAll(() => {
  // הגדרת אזור זמן
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01"));

  // הגדרת שפה
  vi.stubGlobal("navigator", {
    language: "he-IL",
  });

  // הגדרת מידות חלון
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
});

afterAll(() => {
  vi.useRealTimers();
});

// ניקוי לפני כל טסט
beforeEach(() => {
  // ניקוי מוקים
  vi.clearAllMocks();

  // ניקוי localStorage
  localStorage.clear();

  // ניקוי sessionStorage
  sessionStorage.clear();

  // ניקוי cookies
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
});

// ניקוי אחרי כל טסט
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // ניקוי DOM
  document.body.innerHTML = "";
});

// הרחבת expect עם jest-dom matchers
expect.extend(matchers);

// מוק לחלון הדפדפן
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

// מוק ל-scrollTo
const mockScrollTo = (_x = 0, _y = 0) => {
  // פונקציית דמה - לא צריכה לעשות כלום במוקים
};
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: mockScrollTo,
});

// מוק לפונקציות הקונסולה
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();

// מוק ל-ResizeObserver
class MockResizeObserverImpl {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
// לא להשתמש ב-window.ResizeObserver אלא ליצור מוק ישירות
vi.stubGlobal("ResizeObserver", MockResizeObserverImpl);

// מוק ל-IntersectionObserver
class MockIntersectionObserverImpl {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}
// לא להשתמש ב-window.IntersectionObserver אלא ליצור מוק ישירות
vi.stubGlobal("IntersectionObserver", MockIntersectionObserverImpl);

// מוק לסופאבייס
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// מוק ל-OpenAI
vi.mock("openai", () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: "Test response",
                },
              },
            ],
          })
        ),
      },
    },
  })),
}));

// מאצ'רים מותאמים אישית
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const mockCalls = (received as any).mock.calls;
    const match = mockCalls.some((call: any[]) =>
      call.every((arg, i) => {
        if (typeof expected[i] === "object" && expected[i] !== null) {
          return JSON.stringify(arg) === JSON.stringify(expected[i]);
        }
        return arg === expected[i];
      })
    );

    return {
      pass: match,
      message: () =>
        match
          ? `expected ${received} not to have been called with ${expected}`
          : `expected ${received} to have been called with ${expected}`,
    };
  },
});
