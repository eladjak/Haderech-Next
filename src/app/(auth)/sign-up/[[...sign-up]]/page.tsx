import type { Metadata } from "next";
import { ClerkAuthCard } from "@/components/auth/clerk-auth-card";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "יצירת חשבון מאובטח באזור האישי של הדרך — אומנות הקשר.",
  alternates: { canonical: "/sign-up" },
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950"
    >
      <ClerkAuthCard kind="sign-up" />
    </main>
  );
}
