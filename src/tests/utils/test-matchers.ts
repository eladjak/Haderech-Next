import { expect } from "vitest";

("use client");

export {};

/**
 * Custom matcher for checking if a mock was called with matching arguments
 * This matcher checks if any call to the mock function was made with arguments
 * that match the expected arguments (deep equality for objects)
 *
 * @param received The mock function that was called
 * @param expectedArgs The expected arguments
 * @returns An object with pass and message properties
 */
function toHaveBeenCalledWithMatch(received: any, ...expectedArgs: any[]) {
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
}

// רשום את המאצ'ר המותאם אישית
expect.extend({
  toHaveBeenCalledWithMatch,
});

export { toHaveBeenCalledWithMatch };
