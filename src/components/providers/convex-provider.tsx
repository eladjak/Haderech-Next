"use client";

import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode, useEffect, useRef } from "react";
import { api } from "@/../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Ensure every signed-in Clerk user has a Convex `users` row (Phase 22).
 *
 * Previously the row was created only by the Clerk webhook or on admin
 * pages (ensureUser in admin-guard) — so fresh sign-ups on environments
 * without the webhook (dev/preview) had NO user row, which silently hid
 * the course enroll CTA and every per-user query. Found live 2026-07-05
 * during deep E2E verification. ensureUser is idempotent, so calling it
 * once per session app-wide is safe everywhere, prod included.
 */
function EnsureUser({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const ran = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !ran.current) {
      ran.current = true;
      void ensureUser().catch(() => {
        // best-effort: allow a retry on next auth change
        ran.current = false;
      });
    }
  }, [isAuthenticated, ensureUser]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <EnsureUser>{children}</EnsureUser>
    </ConvexProviderWithClerk>
  );
}
