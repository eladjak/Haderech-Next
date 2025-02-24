// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "whatwg-fetch";

// הגדרת vi כאובייקט גלובלי
global.vi = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  mock: jest.mock,
  unmock: jest.unmock,
  doMock: jest.doMock,
  doUnmock: jest.doUnmock,
  importActual: jest.requireActual,
  importMock: jest.requireMock,
  stubGlobal: (name, value) => {
    const original = global[name];
    global[name] = value;
    return () => {
      global[name] = original;
    };
  },
  stubEnv: (name, value) => {
    const original = process.env[name];
    process.env[name] = value;
    return () => {
      process.env[name] = original;
    };
  },
  unstubAllGlobals: () => {
    // יישום בהמשך אם יהיה צורך
  },
  unstubAllEnvs: () => {
    // יישום בהמשך אם יהיה צורך
  },
};

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "",
    query: {},
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

// מוק עבור IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    // יישום בסיסי
    this.callback([
      {
        isIntersecting: true,
        target: element,
      },
    ]);
  }

  unobserve() {
    // יישום בסיסי
  }

  disconnect() {
    // יישום בסיסי
  }
}

global.IntersectionObserver = MockIntersectionObserver;

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

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Set timezone
process.env.TZ = "Asia/Jerusalem";

// Set test environment
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
