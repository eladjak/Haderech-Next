import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "הרשמה | הדרך",
  description: "הירשם להדרך וקבל גישה לתוכן הלימודי ולקהילה",
};

export default function RegisterPage() {
  return (
    <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col overflow-hidden bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-purple-800" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/register-background.jpg')",
          }}
        />
        <div className="relative z-20 flex items-center text-3xl font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-3 h-8 w-8"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          הדרך
        </div>
        <div className="relative z-20 mt-auto space-y-5">
          <div className="animate-fadeInUp">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">
              הצטרף למסע ההתפתחות שלך
            </h2>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-5 w-5 text-primary-foreground"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                התחל חינם עם משאבים רבים
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-5 w-5 text-primary-foreground"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                הצטרף לקהילה תומכת
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-5 w-5 text-primary-foreground"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                קבל גישה להמלצות אישיות
              </li>
            </ul>
          </div>
          <blockquote className="animate-fadeInUp space-y-2 border-l-4 border-white/30 pl-4">
            <p className="text-xl italic">
              &ldquo;הקהילה בהדרך היא אחת הקהילות הכי תומכות שהייתי בהן אי
              פעם.&rdquo;
            </p>
            <footer className="text-sm font-semibold">
              - רותי כהן, חברת קהילה ותיקה
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8 sm:p-12 lg:p-8 xl:p-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="relative flex flex-col space-y-2 text-center">
            <div className="flex justify-center lg:hidden">
              <div className="mb-6 flex items-center text-2xl font-bold text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-3 h-7 w-7"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                הדרך
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">צור חשבון חדש</h1>
            <p className="text-muted-foreground">
              הזן את הפרטים שלך להרשמה או השתמש באחת מאפשרויות ההרשמה המהירה
            </p>
          </div>
          <div className="animate-fadeInUp rounded-lg border bg-card p-6 shadow-sm">
            <RegisterForm />
          </div>
          <p className="animate-fadeInUp px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              יש לך כבר חשבון? התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
