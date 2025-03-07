"use client";

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeResults } from "axe-core";

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare module "vitest" {
  /**
   * Extended mock type with all required methods
   */
  export interface Mock<T = unknown, Y extends unknown[] = unknown[]> {
    (...args: Y): T;
    mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
    mockImplementationOnce: (fn: (...args: Y) => T) => Mock<T, Y>;
    mockReturnThis: () => Mock<T, Y>;
    mockReturnValue: (value: T) => Mock<T, Y>;
    mockReturnValueOnce: (value: T) => Mock<T, Y>;
    mockResolvedValue: <U = T>(value: U) => Mock<Promise<U>, Y>;
    mockResolvedValueOnce: <U = T>(value: U) => Mock<Promise<U>, Y>;
    mockRejectedValue: (value: unknown) => Mock<Promise<never>, Y>;
    mockRejectedValueOnce: (value: unknown) => Mock<Promise<never>, Y>;
    mockClear: () => Mock<T, Y>;
    mockReset: () => Mock<T, Y>;
    mockRestore: () => Mock<T, Y>;
    getMockName: () => string;
    mockName: (name: string) => Mock<T, Y>;
    mockReturnThis: () => Mock<T, Y>;
    mock: {
      calls: Y[];
      results: { type: string; value: unknown }[];
      instances: unknown[];
      contexts: unknown[];
      lastCall: Y;
      lastResult: { type: string; value: unknown };
    };
  }

  /**
   * Mock function extras
   */
  export interface MockedFunction<T extends (...args: unknown[]) => unknown>
    extends Mock<ReturnType<T>, Parameters<T>> {
    mockImplementation: (fn: T) => MockedFunction<T>;
    mockImplementationOnce: (fn: T) => MockedFunction<T>;
    mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
    mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
    mockResolvedValue: <U = ReturnType<T>>(value: U) => MockedFunction<T>;
    mockResolvedValueOnce: <U = ReturnType<T>>(value: U) => MockedFunction<T>;
    mockRejectedValue: (value: unknown) => MockedFunction<T>;
    mockRejectedValueOnce: (value: unknown) => MockedFunction<T>;
    mockReturnThis: () => MockedFunction<T>;
  }

  /**
   * Mock function with custom matchers
   */
  export interface Assertion<T = unknown>
    extends TestingLibraryMatchers<T, void> {
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    toHaveNoViolations: (results?: AxeResults) => void;
  }

  /**
   * Expect static methods
   */
  export interface ExpectStatic {
    any: (constructor: any) => any;
    arrayContaining: <T = unknown>(array: T[]) => any;
    objectContaining: <T = unknown>(object: T) => any;
    stringContaining: (string: string) => any;
    stringMatching: (string: string | RegExp) => any;
    extend: (
      matchers: Record<
        string,
        (...args: unknown[]) => { pass: boolean; message: () => string }
      >
    ) => void;
  }

  /**
   * Extended interface for asymmetric matchers
   */
  export interface AsymmetricMatchersContaining {
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = unknown>(expected: T) => any;
    arrayContaining: <T = unknown>(expected: T[]) => any;
  }
}

// 全局 window mock types for tests
declare global {
  export interface Window {
    axe: {
      run: (node: Element, options?: unknown) => Promise<AxeResults>;
    };
  }
}

export {};
