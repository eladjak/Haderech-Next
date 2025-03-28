/**
 * Type definitions for mocks and testing utilities
 */

/**
 * Extended Mock type that includes all mock methods
 */
export interface Mock<T = any, Y extends any[] = any[]> {
  (...args: Y): T;
  mock: {
    calls: Y[];
    instances: any[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
    lastCall: Y;
  };
  mockClear(): Mock<T, Y>;
  mockReset(): Mock<T, Y>;
  mockRestore(): Mock<T, Y>;
  getMockName(): string;
  mockName(name: string): Mock<T, Y>;
  mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
  mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
  mockReturnValue(value: T): Mock<T, Y>;
  mockReturnValueOnce(value: T): Mock<T, Y>;
  mockResolvedValue<U = T>(value: U): Mock<Promise<U>, Y>;
  mockResolvedValueOnce<U = T>(value: U): Mock<Promise<U>, Y>;
  mockRejectedValue(value: any): Mock<Promise<never>, Y>;
  mockRejectedValueOnce(value: any): Mock<Promise<never>, Y>;
  withImplementation(
    fn: (...args: Y) => T,
    callback: () => Promise<unknown>
  ): Promise<void>;
}

/**
 * מאפשר הרחבת הטיפוסים של בדיקות Vitest
 */
export interface CustomTestMatchers<R = unknown> {
  toBeValidXML(): R;
  toContainValidJSON(): R;
  toBeFormattedAs(expected: string): R;
  toBeValidSchema(schema: unknown): R;
  toMatchTimestamp(): R;
  toHaveBeenCalledWithMatch(...args: any[]): R;
}

/**
 * Mock implementation of console methods
 */
declare global {
  interface Console {
    mockClear: () => void;
    mockImplementation: (impl?: unknown) => void;
    mockImplementationOnce: (impl?: unknown) => void;
    mockRestore: () => void;
    mockReset: () => void;
  }
}

// הרחבת טיפוסי קונסול במודול NodeJS
declare module "vitest" {
  interface Global {
    console: {
      log: Mock;
      error: Mock;
      warn: Mock;
      info: Mock;
      debug: Mock;
    };
  }
}

export {};
