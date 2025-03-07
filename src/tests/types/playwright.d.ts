import { Locator, Page } from "@playwright/test";

declare global {
  namespace PlaywrightTest {
    interface Page extends Page {
      // הרחבות מותאמות אישית לדף
      getByTestId(testId: string): Locator;
      getByRole(role: string, options?: { name?: string | RegExp }): Locator;
      getByText(text: string | RegExp, options?: { exact?: boolean }): Locator;
      getByPlaceholder(placeholder: string | RegExp): Locator;
      getByLabel(label: string | RegExp): Locator;
      getByTitle(title: string | RegExp): Locator;
      getByAltText(altText: string | RegExp): Locator;
    }

    interface Locator extends Locator {
      // הרחבות מותאמות אישית ללוקטור
      getByTestId(testId: string): Locator;
      getByRole(role: string, options?: { name?: string | RegExp }): Locator;
      getByText(text: string | RegExp, options?: { exact?: boolean }): Locator;
      getByPlaceholder(placeholder: string | RegExp): Locator;
      getByLabel(label: string | RegExp): Locator;
      getByTitle(title: string | RegExp): Locator;
      getByAltText(altText: string | RegExp): Locator;
    }
  }
}

declare module "@playwright/test" {
  export interface Matchers<R> {
    // מאצ'רים מותאמים אישית
    toBeAccessible: R;
    toHaveNoViolations: R;
    toHaveScreenshot(options?: { maxDiffPixels?: number }): R;
    toMatchSnapshot(options?: { maxDiffPixels?: number }): R;
  }
}

declare module "playwright" {
  export interface BrowserContext {
    // הרחבות מותאמות אישית להקשר דפדפן
    addInitScript(script: string | Function): Promise<void>;
    route(url: string | RegExp, handler: (route: Route) => void): Promise<void>;
    unroute(url: string | RegExp): Promise<void>;
  }

  export interface Browser {
    // הרחבות מותאמות אישית לדפדפן
    newContext(options?: BrowserContextOptions): Promise<BrowserContext>;
    close: Promise<void>;
  }

  export interface ElementHandle {
    // הרחבות מותאמות אישית לידית אלמנט
    evaluate<T>(
      pageFunction: (element: Element, ...args: any[]) => T | Promise<T>,
      ...args: any[]
    ): Promise<T>;
    evaluateHandle(
      pageFunction: (element: Element, ...args: any[]) => any,
      ...args: any[]
    ): Promise<JSHandle>;
  }

  export interface Frame {
    // הרחבות מותאמות אישית למסגרת
    waitForSelector(
      selector: string,
      options?: { state?: "attached" | "detached" | "visible" | "hidden" }
    ): Promise<ElementHandle>;
    waitForFunction(
      pageFunction: Function | string,
      options?: { polling?: "raf" | "mutation" | number; timeout?: number },
      ...args: any[]
    ): Promise<JSHandle>;
  }

  export interface JSHandle {
    // הרחבות מותאמות אישית לידית JS
    evaluate<T>(
      pageFunction: (element: any, ...args: any[]) => T | Promise<T>,
      ...args: any[]
    ): Promise<T>;
    evaluateHandle(
      pageFunction: (element: any, ...args: any[]) => any,
      ...args: any[]
    ): Promise<JSHandle>;
  }

  export interface Mouse {
    // הרחבות מותאמות אישית לעכבר
    move(x: number, y: number, options?: { steps?: number }): Promise<void>;
    down(options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
    }): Promise<void>;
    up(options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
    }): Promise<void>;
  }

  export interface Keyboard {
    // הרחבות מותאמות אישית למקלדת
    type(text: string, options?: { delay?: number }): Promise<void>;
    press(key: string, options?: { delay?: number }): Promise<void>;
  }

  export interface Touchscreen {
    // הרחבות מותאמות אישית למסך מגע
    tap(x: number, y: number): Promise<void>;
  }
}
