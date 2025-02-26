import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import React from "react";
import { store } from "@/store/store";

/**
 * Providers Component
 *
 * A component that wraps the application with various providers.
 * Currently includes the theme provider for dark/light mode support.
 */

("use client");

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>{children}</Provider>
    </ThemeProvider>
  );
}
