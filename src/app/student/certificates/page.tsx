"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function StudentCertificatesPage() {
  const certificates = useQuery(api.certificates.getUserCertificates);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
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

          {/* Page header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
              התעודות שלי
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              תעודות הסיום שהרווחת על השלמת קורסים בהדרך
            </p>
          </div>

          {/* Loading state */}
          {certificates === undefined && (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {certificates !== undefined && certificates.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              {/* Certificate icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A853]/10">
                <svg
                  className="h-8 w-8 text-[#D4A853]"
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
              </div>
              <h2 className="mb-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                עוד לא סיימת קורס
              </h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                המשך ללמוד! ברגע שתשלים קורס, תקבל כאן תעודת סיום מהודרת.
              </p>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
              >
                עבור לקורסים
              </Link>
            </div>
          )}

          {/* Certificates grid */}
          {certificates !== undefined && certificates.length > 0 && (
            <>
              {/* Stats bar */}
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#D4A853]/20 bg-[#D4A853]/5 px-5 py-3 dark:border-[#D4A853]/10 dark:bg-[#D4A853]/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A853]/20">
                  <svg
                    className="h-4 w-4 text-[#D4A853]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#1E3A5F] dark:text-[#D4A853]">
                  {certificates.length === 1
                    ? "יש לך תעודה אחת - כל הכבוד!"
                    : `יש לך ${certificates.length} תעודות - מרשים!`}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {certificates.map((cert) => {
                  const formattedDate = new Intl.DateTimeFormat("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(cert.issuedAt));

                  return (
                    <Link
                      key={cert._id}
                      href={`/certificates/${cert._id}`}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-lg hover:border-[#D4A853]/40 dark:border-zinc-800 dark:hover:border-[#D4A853]/30"
                    >
                      {/* Top accent */}
                      <div
                        className="h-1 bg-gradient-to-r from-[#1E3A5F] via-[#D4A853] to-[#1E3A5F]"
                        aria-hidden="true"
                      />

                      <div className="relative bg-gradient-to-br from-[#FFFDF9] to-[#FFF8F0] p-6 text-center dark:from-zinc-900 dark:to-zinc-900/95">
                        {/* Mini decorative corners */}
                        <div
                          className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#D4A853]/40"
                          aria-hidden="true"
                        />
                        <div
                          className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#D4A853]/40"
                          aria-hidden="true"
                        />

                        {/* Seal */}
                        <div
                          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A853] to-[#F0D68A] shadow-md shadow-[#D4A853]/10 transition-transform group-hover:scale-110"
                          aria-hidden="true"
                        >
                          <span className="text-sm font-black text-[#1E3A5F]">
                            HD
                          </span>
                        </div>

                        {/* Course name */}
                        <h2 className="mb-2 text-lg font-bold text-[#1E3A5F] dark:text-blue-300">
                          {cert.courseName}
                        </h2>

                        {/* User name */}
                        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                          {cert.userName}
                        </p>

                        {/* Divider */}
                        <div
                          className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-[#D4A853]/50 to-transparent"
                          aria-hidden="true"
                        />

                        {/* Details */}
                        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <p>{formattedDate}</p>
                          <p className="font-mono tracking-wider text-zinc-400 dark:text-zinc-600">
                            {cert.certificateNumber}
                          </p>
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-center justify-center border-t border-zinc-100 bg-white px-4 py-2.5 text-xs font-medium text-[#D4A853] transition-colors group-hover:bg-[#D4A853]/5 dark:border-zinc-800 dark:bg-zinc-900">
                        <span className="flex items-center gap-1.5">
                          צפייה בתעודה
                          <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
