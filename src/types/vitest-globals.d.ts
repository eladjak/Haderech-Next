"use client";

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace Vi {
    export interface Assertion<T = unknown>
      extends TestingLibraryMatchers<T, void> {
      toBe: (expected: T) => void;
      toEqual: (expected: T) => void;
      toBeInTheDocument: () => void;
      toHaveAttribute: (attr: string, value?: string) => void;
      toHaveClass: (className: string) => void;
      toHaveStyle: (style: Record<string, string>) => void;
      toBeVisible: () => void;
      toBeDisabled: () => void;
      toBeEnabled: () => void;
      toHaveValue: (value: string | number | string[]) => void;
      toBeChecked: () => void;
      toBePartiallyChecked: () => void;
      toHaveFocus: () => void;
      toHaveTextContent: (text: string | RegExp) => void;
      toContainElement: (element: Element | null) => void;
      toContainHTML: (html: string) => void;
      toHaveRole: (role: string) => void;
      toHaveAccessibleName: (name: string) => void;
      toHaveAccessibleDescription: (description: string) => void;
      toHaveErrorMessage: (message: string) => void;
      toHaveLength: (length: number) => void;
      toBeDefined: () => void;
      toBeUndefined: () => void;
      toBeNull: () => void;
      toBeTruthy: () => void;
      toBeFalsy: () => void;
      toBeGreaterThan: (number: number) => void;
      toBeLessThan: (number: number) => void;
      toBeGreaterThanOrEqual: (number: number) => void;
      toBeLessThanOrEqual: (number: number) => void;
      toBeCloseTo: (number: number, precision?: number) => void;
      toMatch: (regex: RegExp | string) => void;
      toContain: (item: unknown) => void;
      toThrow: (error?: string | RegExp | Error) => void;
      toThrowError: (error?: string | RegExp | Error) => void;
      toHaveBeenCalled: () => void;
      toHaveBeenCalledTimes: (times: number) => void;
      toHaveBeenCalledWith: (...args: unknown[]) => void;
      toHaveBeenLastCalledWith: (...args: unknown[]) => void;
      toHaveBeenNthCalledWith: (nthCall: number, ...args: unknown[]) => void;
      toHaveReturned: () => void;
      toHaveReturnedTimes: (times: number) => void;
      toHaveReturnedWith: (value: unknown) => void;
      toHaveLastReturnedWith: (value: unknown) => void;
      toHaveNthReturnedWith: (nthCall: number, value: unknown) => void;
      toHaveProperty: (keyPath: string | string[], value?: unknown) => void;
      toBeInstanceOf: (Class: unknown) => void;
      toMatchObject: (object: object) => void;
      toMatchSnapshot: (name?: string) => void;
      toMatchInlineSnapshot: (snapshot: string) => void;
      toThrowErrorMatchingSnapshot: () => void;
      toThrowErrorMatchingInlineSnapshot: (snapshot: string) => void;
      resolves: Assertion<T>;
      rejects: Assertion<T>;
      not: Assertion<T>;
      toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    }

    export interface Mock<T = unknown> {
      (...args: unknown[]): T;
      mock: {
        calls: unknown[][];
        instances: unknown[];
        invocationCallOrder: number[];
        results: { type: string; value: unknown }[];
        lastCall: unknown[];
      };
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: unknown[]) => unknown): Mock<T>;
      mockImplementationOnce(fn: (...args: unknown[]) => unknown): Mock<T>;
      mockName(name: string): Mock<T>;
      mockReturnThis(): Mock<T>;
      mockReturnValue(value: T): Mock<T>;
      mockReturnValueOnce(value: T): Mock<T>;
      mockResolvedValue(value: T): Mock<Promise<T>>;
      mockResolvedValueOnce(value: T): Mock<Promise<T>>;
      mockRejectedValue(value: unknown): Mock<Promise<unknown>>;
      mockRejectedValueOnce(value: any): Mock<Promise<unknown>>;
    }
  }
}

declare module "vitest" {
  export type Assertion<T = unknown> = Vi.Assertion<T>;
  export type Mock<T = unknown> = Vi.Mock<T>;
  export interface Expect {
    <T = unknown>(actual: T): Assertion<T>;
    extend(
      matchers: Record<
        string,
        (...args: unknown[]) => { pass: boolean; message: () => string }
      >
    ): void;
  }
}

export {};
