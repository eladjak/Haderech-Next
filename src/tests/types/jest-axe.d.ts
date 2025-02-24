import { AxeResults } from "axe-core";
import { Assertion, AsymmetricMatchersContaining } from "vitest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

declare module "jest-axe" {
  export interface JestAxe {
    (html: Element | string, options?: any): Promise<AxeResults>;
    toHaveNoViolations(): void;
  }

  export const axe: JestAxe;
  export const toHaveNoViolations: () => void;
  export const configureAxe: (options: any) => void;
  export const getAxeResults: (
    html: Element | string,
    options?: any
  ) => Promise<AxeResults>;
}

declare module "vitest" {
  interface Assertion extends AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

export {};
