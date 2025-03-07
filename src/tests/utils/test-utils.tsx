import { configureStore } from "@reduxjs/toolkit";
import { RenderOptions, render as tlRender } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { expect } from "vitest";
import type { Mock } from "vitest";
import React from "react";

("use client");

export {};

// מוק סטור בסיסי לטסטים
const mockStore = configureStore({
  reducer: {
    course: (state = {}) => state,
    forum: (state = {}) => state,
    simulator: (state = {}) => state,
    user: (state = {}) => state,
  },
});

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider store={mockStore}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return tlRender(ui, { wrapper: AllTheProviders, ...options });
};

const checkFunctionCall = (mockFn: Mock, expectedArgs?: unknown[]) => {
  expect(mockFn).toHaveBeenCalled();
  if (expectedArgs) {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  }
};

const checkCallCount = (mockFn: Mock, expectedCount: number) => {
  expect(mockFn).toHaveBeenCalledTimes(expectedCount);
};

export { customRender as render, checkFunctionCall, checkCallCount };
