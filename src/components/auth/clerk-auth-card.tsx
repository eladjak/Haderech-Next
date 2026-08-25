"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useSyncExternalStore } from "react";

const appearance = {
  elements: {
    rootBox: "mx-auto",
    card: "shadow-lg",
  },
};

export function ClerkAuthCard({ kind }: { kind: "sign-in" | "sign-up" }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
        טוען טופס מאובטח…
      </p>
    );
  }

  return kind === "sign-in" ? (
    <SignIn appearance={appearance} />
  ) : (
    <SignUp appearance={appearance} />
  );
}
