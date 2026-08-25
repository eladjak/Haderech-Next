"use client";

import { createContext, useContext, ReactNode } from "react";

// Demo mode context
const DemoModeContext = createContext(false);

export function useDemoMode() {
  return useContext(DemoModeContext);
}

// The server config is the canonical parser for all demo env values. This
// injected value is true only after the private opt-in and local-development
// checks pass, so client code cannot drift on whitespace/case normalization.
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE_AUTHORIZED === "true";

// Mock user for demo mode
export const DEMO_USER = {
  id: "demo_admin_user",
  firstName: "אלעד",
  lastName: "מנהל",
  fullName: "אלעד מנהל",
  username: "admin",
  primaryEmailAddress: { emailAddress: "demo@example.invalid" },
  imageUrl: "",
  hasImage: false,
};

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return (
    <DemoModeContext.Provider value={DEMO_MODE}>
      {children}
    </DemoModeContext.Provider>
  );
}
