import "@testing-library/jest-dom";
import path from "path";

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import dotenv from "dotenv";
import { afterEach, expect, vi } from "vitest";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Extend expect with testing-library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock system functions
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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock window.scrollTo
const mockScrollTo = (x = 0, y = 0) => {
  // פונקציית דמה - לא צריכה לעשות כלום במוקים
};
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: mockScrollTo,
});

// Mock console methods
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();

// Custom matcher for checking if a mock was called with matching arguments
expect.extend({
  toHaveBeenCalledWithMatch(received: any, ...expectedArgs: any[]) {
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
          : `expected ${received} to have been called with matching arguments ${expectedArgs}`,
    };
  },
});

window.ResizeObserver = MockResizeObserver;
global.ResizeObserver = MockResizeObserver;

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();
  observe(element: Element) {
    this.elements.add(element);
  }
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.elements.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  triggerEntries() {
    const entries: IntersectionObserverEntry[] = Array.from(this.elements).map(
      (element) => {
        return {
          target: element,
          isIntersecting: true,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        };
      }
    );
    this.callback(entries, this);
  }
}

window.IntersectionObserver = IntersectionObserverMock;
global.IntersectionObserver = IntersectionObserverMock;

class DOMMatrixReadOnlyMock {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  m11 = 1;
  m12 = 0;
  m13 = 0;
  m14 = 0;
  m21 = 0;
  m22 = 1;
  m23 = 0;
  m24 = 0;
  m31 = 0;
  m32 = 0;
  m33 = 1;
  m34 = 0;
  m41 = 0;
  m42 = 0;
  m43 = 0;
  m44 = 1;
  is2D = true;
  isIdentity = true;

  constructor(transform?: string) {
    // no-op for mock
  }

  multiply(): DOMMatrixReadOnlyMock {
    return new DOMMatrixReadOnlyMock();
  }

  translate(): DOMMatrixReadOnlyMock {
    return new DOMMatrixReadOnlyMock();
  }

  inverse(): DOMMatrixReadOnlyMock {
    return new DOMMatrixReadOnlyMock();
  }

  transformPoint(x = 0, y = 0) {
    return { x, y };
  }
}
