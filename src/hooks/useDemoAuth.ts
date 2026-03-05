"use client";

import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { DEMO_MODE, DEMO_USER } from "@/components/providers/demo-provider";

/**
 * Drop-in replacement for Clerk's useUser that works in demo mode.
 * When NEXT_PUBLIC_DEMO_MODE=true, returns a fake admin user.
 */
export function useDemoUser() {
  const clerkResult = useClerkUser();

  if (DEMO_MODE) {
    return {
      isLoaded: true,
      isSignedIn: true,
      user: DEMO_USER as ReturnType<typeof useClerkUser>["user"],
    };
  }

  return clerkResult;
}

/**
 * Drop-in replacement for Clerk's useAuth that works in demo mode.
 */
export function useDemoAuth() {
  const clerkResult = useClerkAuth();

  if (DEMO_MODE) {
    return {
      isLoaded: true,
      isSignedIn: true,
      userId: "demo_admin_user",
      sessionId: "demo_session",
      getToken: async () => "demo_token",
    };
  }

  return clerkResult;
}
