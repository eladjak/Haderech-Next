import { TextDecoder, TextEncoder } from "util";
import { afterEach, beforeAll, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup, configure } from "@testing-library/react";

// Configure testing library
configure({
  // @ts-expect-error - testIdAttribute קיים בספריה אך לא מוגדר בטיפוס
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
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
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

// השתמש ב-Class לעקוף את בעיות הטיפוסים של vi.fn().mockImplementation
class MockResizeObserverClass {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver =
  MockResizeObserverClass as unknown as typeof ResizeObserver;

// שימוש במוק דומה עבור matchMedia
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

// Custom matcher for checking if a mock was called with a matching object
expect.extend({
  toHaveBeenCalledWithMatch(received: any, expected: unknown) {
    const pass = received.mock.calls.some((call: unknown[]) =>
      JSON.stringify(call[0]).includes(JSON.stringify(expected))
    );

    return {
      message: () =>
        `expected ${received} to have been called with an object matching ${expected}`,
      pass,
    };
  },
});
