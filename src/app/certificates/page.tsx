"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CertificateCard } from "@/components/certificate/certificate-card";

export default function CertificatesPage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const certificates = useQuery(
    api.certificates.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              האזור שלי
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">התעודות שלי</span>
          </nav>

          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            התעודות שלי
          </h1>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400">
            תעודות סיום שקיבלת על השלמת קורסים
          </p>

          {/* Loading */}
          {certificates === undefined && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {certificates !== undefined && certificates.length === 0 && (
            <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
              <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                עדיין אין תעודות
              </p>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                השלם קורסים כדי לקבל תעודות סיום
              </p>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                עבור לקורסים
              </Link>
            </div>
          )}

          {/* Certificate list */}
          {certificates !== undefined && certificates.length > 0 && (
            <div className="space-y-6">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert._id}
                  userName={cert.userName}
                  courseName={cert.courseName}
                  certificateNumber={cert.certificateNumber}
                  issuedAt={cert.issuedAt}
                  completionPercent={cert.completionPercent}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
