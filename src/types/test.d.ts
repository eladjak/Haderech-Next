/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeResults } from "axe-core";
import type { Vi } from "vitest";

declare global {
  namespace Vi {
    interface JestMatchers<T> {
      toHaveBeenCalledWithMatch: (...args: any[]) => void;
      toBeInTheDocument: () => void;
      toHaveAttribute: (attr: string, value?: string) => void;
      toHaveProperty: (prop: string) => void;
      toContain: (text: string) => void;
      toMatch: (regex: RegExp) => void;
      toBeDefined: () => void;
      toBeNull: () => void;
      toThrow: (message?: string) => void;
    }

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
      toBeUndefined: () => void;
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
      toBeAccessible(): Promise<unknown>;
      toHaveNoViolations(results: AxeResults): unknown;
      toHaveValidSchema(schema: unknown): void;
      toMatchPattern(pattern: RegExp): void;
      toBeWithinRange(min: number, max: number): void;
      toBeEmptyObject(): void;
      toBeNonEmptyObject(): void;
      toBeEmptyArray(): void;
      toBeNonEmptyArray(): void;
      toBeEmptyString(): void;
      toBeNonEmptyString(): void;
      toBeValidDate(): void;
      toBeValidEmail(): void;
      toBeValidUrl(): void;
      toBeValidIsoDate(): void;
      toBeValidUuid(): void;
      toBeValidHexColor(): void;
      toBeValidPhoneNumber(): void;
      toBeValidPostalCode(): void;
      toBeValidCreditCard(): void;
      toBeValidIpAddress(): void;
      toBeValidMacAddress(): void;
      toBeValidLatitude(): void;
      toBeValidLongitude(): void;
      toBeValidPort(): void;
      toBeValidHostname(): void;
      toBeValidDomain(): void;
      toBeValidSubdomain(): void;
      toBeValidTld(): void;
      toBeValidMimeType(): void;
      toBeValidBase64(): void;
      toBeValidJwt(): void;
      toBeValidJson(): void;
      toBeValidXml(): void;
      toBeValidYaml(): void;
      toBeValidMarkdown(): void;
      toBeValidHtml(): void;
      toBeValidCss(): void;
      toBeValidJs(): void;
      toBeValidTs(): void;
      toBeValidSql(): void;
      toBeValidRegex(): void;
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

    interface AsymmetricMatchersContaining {
      any: (constructor: any) => any;
      stringMatching: (expected: string | RegExp) => any;
      objectContaining: <T = any>(expected: T) => any;
      toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
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

  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    any: (constructor: unknown) => unknown;
  }

  interface AsymmetricMatchersContaining {
    toHaveBeenCalledWithMatch: (...args: unknown[]) => void;
    any: (constructor: unknown) => unknown;
  }

  interface MockInstance<T extends (...args: any[]) => any> {
    mockImplementation: (fn: T) => MockInstance<T>;
    mockReturnValue: (value: ReturnType<T>) => MockInstance<T>;
    mockReturnThis: () => MockInstance<T>;
    mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockInstance<T>;
    mockRejectedValue: (value: unknown) => MockInstance<T>;
  }

  interface Mocked<T> {
    mockImplementation: (fn: T) => Mocked<T>;
    mockReturnValue: (value: ReturnType<T>) => Mocked<T>;
    mockReturnThis: () => Mocked<T>;
    mockResolvedValue: (value: Awaited<ReturnType<T>>) => Mocked<T>;
    mockRejectedValue: (value: unknown) => Mocked<T>;
  }

  interface ExpectStatic {
    extend: (matchers: Record<string, unknown>) => void;
    any: (constructor: unknown) => unknown;
  }

  interface Vi {
    fn: <T extends (...args: any[]) => any>(
      implementation?: T
    ) => MockInstance<T>;
    mocked: <T>(item: T) => Mocked<T>;
  }

  interface InlineConfig {
    globals: boolean;
    setupFiles: string[];
  }

  interface UserConfig {
    test: InlineConfig;
  }
}

declare global {
  interface Window {
    ResizeObserver: {
      new (callback: ResizeObserverCallback): ResizeObserver;
      prototype: ResizeObserver;
    };
    IntersectionObserver: {
      new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ): IntersectionObserver;
      prototype: IntersectionObserver;
    };
  }
}

export {};
