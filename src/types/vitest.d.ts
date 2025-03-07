import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeResults } from "axe-core";

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// Define the shape of Mock objects
export interface Mock<T = unknown> {
  (...args: unknown[]): T;
  mock: {
    calls: unknown[][];
    instances: unknown[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
    lastCall: unknown[];
  };
  mockClear: void;
  mockReset: void;
  mockRestore: void;
  mockImplementation(fn: (...args: unknown[]) => any): Mock<T>;
  mockImplementationOnce(fn: (...args: unknown[]) => any): Mock<T>;
  mockName(name: string): Mock<T>;
  mockReturnThis: Mock<T>;
  mockReturnValue(value: T): Mock<T>;
  mockReturnValueOnce(value: T): Mock<T>;
  mockResolvedValue(value: T): Mock<Promise<T>>;
  mockResolvedValueOnce(value: T): Mock<Promise<T>>;
  mockRejectedValue(value: unknown): Mock<Promise<unknown>>;
  mockRejectedValueOnce(value: any): Mock<Promise<unknown>>;
}

// Extend vitest types
declare module "vitest" {
  export interface Assertion<T = unknown>
    extends TestingLibraryMatchers<T, void> {
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    toHaveNoViolations: () => void;
  }

  export interface AsymmetricMatchersContaining {
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = unknown>(expected: T) => any;
    arrayContaining: <T = unknown>(expected: T[]) => any;
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
  }
  export interface ExpectStatic {
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = unknown>(expected: T) => any;
    arrayContaining: <T = unknown>(expected: T[]) => any;
    extend: (
      matchers: Record<
        string,
        (...args: unknown[]) => { pass: boolean; message: () => string }
      >
    ) => void;
  }

  export interface MockOptions {
    name?: string;
  }
  export interface Vi {
    fn: <T extends (...args: unknown[]) => any>(
      implementation?: T
    ) => Mock<ReturnType<T>>;
    mock: <T>(file: string, options?: MockOptions) => Mock<T>;
  }
}

// Add global WindowMock types
declare global {
  export interface Window {
    matchMedia: (query: string) => {
      matches: boolean;
      media: string;
      onchange: null;
      addListener: Mock;
      removeListener: Mock;
      addEventListener: Mock;
      removeEventListener: Mock;
      dispatchEvent: Mock;
    };
    IntersectionObserver: {
      new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ): {
        observe: Mock;
        unobserve: Mock;
        disconnect: Mock;
        takeRecords: Mock;
        root: Element | null;
        rootMargin: string;
        thresholds: ReadonlyArray<number>;
      };
      prototype: IntersectionObserver;
    };
    ResizeObserver: {
      new (callback: ResizeObserverCallback): {
        observe: Mock;
        unobserve: Mock;
        disconnect: Mock;
      };
      prototype: ResizeObserver;
    };
    scrollTo: Mock;
  }
}

export {};
