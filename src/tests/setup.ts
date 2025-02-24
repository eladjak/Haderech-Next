import { vi } from "vitest";

import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

import { configure } from "@testing-library/react";

import React from "react";

// Configure testing library
configure({
  testIdAttribute: "data-testid",
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", { ...props });
  },
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

// Mock OpenAI
vi.mock("openai", () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;

// Mock window.matchMedia
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

// Custom matchers
expect.extend({
  toHaveBeenCalledWithMatch(received: any, expected: any) {
    const pass = received.mock.calls.some((call: any[]) =>
      JSON.stringify(call).includes(JSON.stringify(expected))
    );

    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to have been called with arguments matching ${expected}`,
    };
  },
});

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = () => false;
