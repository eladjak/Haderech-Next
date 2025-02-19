import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

import { configure } from "@testing-library/react";

// Configure testing library
configure({
  testIdAttribute: "data-testid",
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession() {
    return { data: null, status: "unauthenticated" };
  },
}));

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Custom matchers
expect.extend({
  toHaveBeenCalledWithMatch(received: jest.Mock, expected: any) {
    const pass = received.mock.calls.some((call) =>
      JSON.stringify(call[0]).includes(JSON.stringify(expected))
    );
    return {
      pass,
      message: () =>
        `expected ${received.getMockName()} to have been called with an object matching ${JSON.stringify(
          expected
        )}`,
    };
  },
});

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = () => false;
