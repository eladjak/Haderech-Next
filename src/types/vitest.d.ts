/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeResults } from "axe-core";

// Define the shape of Mock objects
export interface Mock<T = any> {
  (...args: any[]): T;
  mock: {
    calls: any[][];
    instances: any[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
    lastCall: any[];
  };
  mockClear(): void;
  mockReset(): void;
  mockRestore(): void;
  mockImplementation(fn: (...args: any[]) => any): Mock<T>;
  mockImplementationOnce(fn: (...args: any[]) => any): Mock<T>;
  mockName(name: string): Mock<T>;
  mockReturnThis(): Mock<T>;
  mockReturnValue(value: T): Mock<T>;
  mockReturnValueOnce(value: T): Mock<T>;
  mockResolvedValue(value: T): Mock<Promise<T>>;
  mockResolvedValueOnce(value: T): Mock<Promise<T>>;
  mockRejectedValue(value: any): Mock<Promise<any>>;
  mockRejectedValueOnce(value: any): Mock<Promise<any>>;
}

// Extend vitest types
declare module "vitest" {
  export interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
    toHaveBeenCalledWithMatch: (...args: any[]) => void;
    toHaveNoViolations: () => void;
  }

  export interface AsymmetricMatchersContaining {
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = any>(expected: T) => any;
    arrayContaining: <T = any>(expected: T[]) => any;
    toHaveBeenCalledWithMatch: (...args: any[]) => void;
  }

  export interface ExpectStatic {
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = any>(expected: T) => any;
    arrayContaining: <T = any>(expected: T[]) => any;
    extend: (
      matchers: Record<
        string,
        (...args: any[]) => { pass: boolean; message: () => string }
      >
    ) => void;
  }

  export interface MockOptions {
    name?: string;
  }

  export interface Vi {
    fn: <T extends (...args: any[]) => any>(
      implementation?: T
    ) => Mock<ReturnType<T>>;
    mock: <T>(file: string, options?: MockOptions) => Mock<T>;
  }
}

// Add global WindowMock types
declare global {
  interface Window {
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
