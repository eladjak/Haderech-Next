"use client";

import { createContext, useContext, ReactNode } from "react";

// Demo mode context
const DemoModeContext = createContext(false);

export function useDemoMode() {
  return useContext(DemoModeContext);
}

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Mock user for demo mode
export const DEMO_USER = {
  id: "demo_admin_user",
  firstName: "אלעד",
  lastName: "מנהל",
  fullName: "אלעד מנהל",
  username: "admin",
  primaryEmailAddress: { emailAddress: "eladjak@gmail.com" },
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
