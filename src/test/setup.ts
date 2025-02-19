import "@testing-library/jest-dom";
import path from "path";

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import dotenv from "dotenv";
import { afterEach, expect, vi } from "vitest";

// טעינת משתני סביבה מקובץ .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// הרחבת expect עם matchers של testing-library
expect.extend(matchers);

// ניקוי אוטומטי אחרי כל בדיקה
afterEach(() => {
  cleanup();
});

// מוק לפונקציות של המערכת
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// מוק ל-localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// מוק ל-ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// מוק ל-IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// מוק לפונקציות של jest לתאימות
const globalJest = {
  fn: vi.fn,
  mock: vi.mock,
  spyOn: vi.spyOn,
  resetModules: vi.resetModules,
  clearAllMocks: vi.clearAllMocks,
};

Object.defineProperty(global, "jest", {
  value: globalJest,
  writable: true,
});
