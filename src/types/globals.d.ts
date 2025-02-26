import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeResults } from "axe-core";

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare module "vitest" {
  /**
   * Extended mock type with all required methods
   */
  export interface Mock<T = any, Y extends any[] = any[]> {
    (...args: Y): T;
    mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
    mockImplementationOnce: (fn: (...args: Y) => T) => Mock<T, Y>;
    mockReturnThis: () => Mock<T, Y>;
    mockReturnValue: (value: T) => Mock<T, Y>;
    mockReturnValueOnce: (value: T) => Mock<T, Y>;
    mockResolvedValue: <U = T>(value: U) => Mock<Promise<U>, Y>;
    mockResolvedValueOnce: <U = T>(value: U) => Mock<Promise<U>, Y>;
    mockRejectedValue: (value: any) => Mock<Promise<never>, Y>;
    mockRejectedValueOnce: (value: any) => Mock<Promise<never>, Y>;
    mockClear: () => Mock<T, Y>;
    mockReset: () => Mock<T, Y>;
    mockRestore: () => Mock<T, Y>;
    getMockName: () => string;
    mockName: (name: string) => Mock<T, Y>;
    mockReturnThis: () => Mock<T, Y>;
    mock: {
      calls: Y[];
      results: { type: string; value: any }[];
      instances: any[];
      contexts: any[];
      lastCall: Y;
      lastResult: { type: string; value: any };
    };
  }

  /**
   * Mock function extras
   */
  export interface MockedFunction<T extends (...args: any[]) => any>
    extends Mock<ReturnType<T>, Parameters<T>> {
    mockImplementation: (fn: T) => MockedFunction<T>;
    mockImplementationOnce: (fn: T) => MockedFunction<T>;
    mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
    mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
    mockResolvedValue: <U = ReturnType<T>>(value: U) => MockedFunction<T>;
    mockResolvedValueOnce: <U = ReturnType<T>>(value: U) => MockedFunction<T>;
    mockRejectedValue: (value: any) => MockedFunction<T>;
    mockRejectedValueOnce: (value: any) => MockedFunction<T>;
    mockReturnThis: () => MockedFunction<T>;
  }

  /**
   * Mock function with custom matchers
   */
  export interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
    toHaveBeenCalledWithMatch: (...args: any[]) => void;
    toHaveNoViolations: (results?: AxeResults) => void;
  }

  /**
   * Expect static methods
   */
  export interface ExpectStatic {
    any: (constructor: any) => any;
    arrayContaining: <T = any>(array: T[]) => any;
    objectContaining: <T = any>(object: T) => any;
    stringContaining: (string: string) => any;
    stringMatching: (string: string | RegExp) => any;
    extend: (
      matchers: Record<
        string,
        (...args: any[]) => { pass: boolean; message: () => string }
      >
    ) => void;
  }

  /**
   * Extended interface for asymmetric matchers
   */
  export interface AsymmetricMatchersContaining {
    toHaveBeenCalledWithMatch: (...args: any[]) => void;
    any: (constructor: any) => any;
    stringMatching: (expected: string | RegExp) => any;
    objectContaining: <T = any>(expected: T) => any;
    arrayContaining: <T = any>(expected: T[]) => any;
  }
}

// 全局 window mock types for tests
declare global {
  interface Window {
    axe: {
      run: (node: Element, options?: any) => Promise<AxeResults>;
    };
  }
}

export {};
