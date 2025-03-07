import { vi } from "vitest";
import React from "react";

("use client");

export {};

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
      expires: "2024-12-31",
    },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock @supabase/supabase-js
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    }),
  }),
}));

// Mock openai
vi.mock("openai", () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Test response",
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Mock next/image
const NextImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>((props, ref) => {
  return React.createElement("img", { ...props, ref });
});
NextImage.displayName = "NextImage";

vi.mock("next/image", () => ({
  __esModule: true,
  default: NextImage,
}));

// Mock TextEncoder/TextDecoder
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = class TextEncoder {
    encoding = "utf-8";
    encode(str: string): Uint8Array {
      return new Uint8Array(Buffer.from(str));
    }
    encodeInto(
      str: string,
      dest: Uint8Array
    ): { read: number; written: number } {
      const encoded = this.encode(str);
      dest.set(encoded);
      return { read: str.length, written: encoded.length };
    }
  };
}

if (typeof TextDecoder === "undefined") {
  global.TextDecoder = class TextDecoder {
    encoding = "utf-8";
    fatal = false;
    ignoreBOM = false;
    constructor(label?: string, options?: TextDecoderOptions) {
      this.encoding = label || "utf-8";
      this.fatal = options?.fatal || false;
      this.ignoreBOM = options?.ignoreBOM || false;
    }
    decode(arr: Uint8Array): string {
      return Buffer.from(arr).toString("utf8");
    }
  };
}

// Mock ResizeObserver
if (typeof ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      // Implement basic functionality
      this.callback([{ target } as ResizeObserverEntry], this);
    }
    unobserve(_target: Element) {
      // Clean up observation
    }
    disconnect() {
      // Clean up all observations
    }
  };
}

// Mock window.matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Custom matcher for checking if a mock was called with a partial match of arguments
expect.extend({
  toHaveBeenCalledWithMatch(received: any, ...expectedArgs: any[]) {
    const calls = received.mock.calls;
    const match = calls.some((call: any[]) =>
      expectedArgs.every((arg, index) => {
        if (typeof arg === "object") {
          return JSON.stringify(call[index]).includes(JSON.stringify(arg));
        }
        return call[index] === arg;
      })
    );

    if (match) {
      return {
        message: () =>
          `expected ${received.getMockName()} not to have been called with arguments matching ${expectedArgs}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received.getMockName()} to have been called with arguments matching ${expectedArgs}, but it was called with ${calls}`,
        pass: false,
      };
    }
  },
});
