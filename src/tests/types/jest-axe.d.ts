import { AxeResults } from "axe-core";
import { Assertion, AsymmetricMatchersContaining } from "vitest";

declare module "jest-axe" {
  export interface IToHaveNoViolations {
    (received: AxeResults): { pass: boolean; message: () => string };
  }

  export function configureAxe(options?: any): void;
  export const toHaveNoViolations: IToHaveNoViolations;
  export function axe(
    node: Element | string,
    options?: any
  ): Promise<AxeResults>;
}

declare module "vitest" {
  interface Assertion extends AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

export {};
