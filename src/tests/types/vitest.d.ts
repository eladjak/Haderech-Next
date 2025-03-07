import type { AxeResults } from "axe-core";

/// <reference types="vitest" />

declare global {
  namespace Vi {
    interface Assertion {
      toHaveNoViolations: void;
    }
  }

  interface Window {
    axe: {
      run: (node: Element, options?: any) => Promise<AxeResults>;
    };
  }

  var axe: Window["axe"];
}

export {};
