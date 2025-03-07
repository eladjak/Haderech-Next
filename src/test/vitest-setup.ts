import "@testing-library/jest-dom";
rary/jest-dom";
import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import type { _TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { _Mock } from "vitest";

import type { _AxeResults } from "axe-core";


export {}










// הרחבת הגדרות matchers עבור jest-dom
expect.extend(matchers);

// ניקוי אחרי כל בדיקה
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeAll(() => {
  // Mock IntersectionObserver
  class MockIntersectionObserverClass {
    root = null;
    rootMargin = "";
    thresholds = [];
    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn();
    unobserve = vi.fn();
  }
  global.IntersectionObserver =
    MockIntersectionObserverClass as unknown as typeof IntersectionObserver;

  // Mock window.matchMedia
  const mockMatchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()});
  global.matchMedia = mockMatchMedia;

  // Mock ResizeObserver
  class MockResizeObserverClass {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  global.ResizeObserver =
    MockResizeObserverClass as unknown as typeof ResizeObserver;

  // Mock window.scrollTo
  // הגדר פונקציית scrollTo מלאה שמתאימה לחתימה המקורית
  function mockScrollTo(options?: ScrollToOptions): void;
  function mockScrollTo(x: number, y: number): void;
  function mockScrollTo(
    _optionsOrX?: ScrollToOptions | number,
    _y?: number
  ): void {
    // פונקציה ריקה לצורך מוק
  }
  global.scrollTo = mockScrollTo;
});

// מוק לפונקציות הקונסולה
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();

// מאצ'ר מותאם אישית לבדיקה אם מוק נקרא עם פרמטרים מסוימים
const toHaveBeenCalledWithMatch = (received: any, ...expectedArgs: any[]) => {
  const calls = received.mock.calls;
  const pass = calls.some((call: any[]) =>
    expectedArgs.every((arg, i) => {
      if (typeof arg === "object") {
        return JSON.stringify(call[i]) === JSON.stringify(arg);
      }
      return call[i] === arg;
    })
  );

  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to have been called with matching arguments ${expectedArgs}`
        : `expected ${received} to have been called with matching arguments ${expectedArgs}`};
}

// הוספת המאצ'ר המותאם אישית לאובייקט expect
expect.extend({
  toHaveBeenCalledWithMatch});
