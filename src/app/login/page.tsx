import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "התחברות - הדרך",
  description: "התחברו לחשבון שלכם",
};

export default function LoginPage() {
  return (
    <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          הדרך
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;הצטרפתי להדרך לפני חודש ואני כבר מרגיש שינוי משמעותי
              במערכות היחסים שלי.&rdquo;
            </p>
            <footer className="text-sm">דוד דוידוב</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              התחברות לחשבון
            </h1>
            <p className="text-sm text-muted-foreground">
              הזן את פרטי ההתחברות שלך
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              אין לך חשבון? הירשם כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
