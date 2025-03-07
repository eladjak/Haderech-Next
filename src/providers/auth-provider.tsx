"use client";

import React from "react";
import { AuthProvider as CoreAuthProvider } from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <CoreAuthProvider>{children}</CoreAuthProvider>;
}
