import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
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
      toContain: (item: any) => void;
      toThrow: (error?: string | RegExp | Error) => void;
      toThrowError: (error?: string | RegExp | Error) => void;
      toHaveBeenCalled: () => void;
      toHaveBeenCalledTimes: (times: number) => void;
      toHaveBeenCalledWith: (...args: any[]) => void;
      toHaveBeenLastCalledWith: (...args: any[]) => void;
      toHaveBeenNthCalledWith: (nthCall: number, ...args: any[]) => void;
      toHaveReturned: () => void;
      toHaveReturnedTimes: (times: number) => void;
      toHaveReturnedWith: (value: any) => void;
      toHaveLastReturnedWith: (value: any) => void;
      toHaveNthReturnedWith: (nthCall: number, value: any) => void;
      toHaveProperty: (keyPath: string | string[], value?: any) => void;
      toBeInstanceOf: (Class: any) => void;
      toMatchObject: (object: object) => void;
      toMatchSnapshot: (name?: string) => void;
      toMatchInlineSnapshot: (snapshot: string) => void;
      toThrowErrorMatchingSnapshot: () => void;
      toThrowErrorMatchingInlineSnapshot: (snapshot: string) => void;
      resolves: Assertion<T>;
      rejects: Assertion<T>;
      not: Assertion<T>;
      toHaveBeenCalledWithMatch: (...args: any[]) => void;
    }

    interface Mock<T = any> {
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
  }
}

declare module "vitest" {
  export type Assertion<T = any> = Vi.Assertion<T>;
  export type Mock<T = any> = Vi.Mock<T>;
  export interface Expect {
    <T = any>(actual: T): Assertion<T>;
    extend(
      matchers: Record<
        string,
        (...args: any[]) => { pass: boolean; message: () => string }
      >
    ): void;
  }
}

export {};
