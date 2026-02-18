"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  BadgeCard,
  StreakDisplay,
} from "@/components/gamification/badge-icon";

export default function StudentProfilePage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const profile = useQuery(
    api.gamification.getStudentProfile,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const xpData = useQuery(
    api.gamification.getUserXP,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const badgesData = useQuery(
    api.gamification.getUserBadges,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const streakData = useQuery(
    api.gamification.getDailyStreak,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const isLoading =
    profile === undefined ||
    xpData === undefined ||
    badgesData === undefined ||
    streakData === undefined;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8">
          <nav
            className="mb-4 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              דשבורד
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">הפרופיל שלי</span>
          </nav>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <>
            {/* Profile Header Card */}
            <section className="mb-8">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* Avatar */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {profile.imageUrl ? (
                      <img
                        src={profile.imageUrl}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-right">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {profile.email}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      הצטרף/ה:{" "}
                      {new Intl.DateTimeFormat("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(profile.joinedAt))}
                    </p>

                    {/* Level & XP */}
                    {xpData && (
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-center gap-3 sm:justify-start">
                          <span className="flex h-8 items-center rounded-full bg-emerald-100 px-3 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            רמה {xpData.level}
                          </span>
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {xpData.totalXP} XP
                          </span>
                        </div>
                        <div className="mt-2 max-w-sm">
                          <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                            <span>
                              רמה {xpData.level}
                            </span>
                            <span>
                              רמה {xpData.level + 1}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                              style={{ width: `${xpData.progressPercent}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {xpData.xpInCurrentLevel} / {xpData.xpNeededForNextLevel} XP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick links */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/student/leaderboard"
                      className="rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      לוח מובילים
                    </Link>
                    <Link
                      href="/student/analytics"
                      className="rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      אנליטיקס
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Overview */}
            <section className="mb-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="קורסים רשומים"
                  value={String(profile.stats.enrolledCourses)}
                  icon="courses"
                />
                <StatCard
                  title="שיעורים שהושלמו"
                  value={String(profile.stats.completedLessons)}
                  icon="lessons"
                />
                <StatCard
                  title="תעודות"
                  value={String(profile.stats.certificatesEarned)}
                  icon="certificates"
                />
                <StatCard
                  title="ציון ממוצע"
                  value={
                    profile.stats.averageScore > 0
                      ? `${profile.stats.averageScore}%`
                      : "-"
                  }
                  icon="score"
                />
              </div>
            </section>

            {/* Daily Streak */}
            {streakData && (
              <section className="mb-8">
                <StreakDisplay streak={streakData} />
              </section>
            )}

            {/* Achievement Badges */}
            {badgesData && (
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    הישגים
                  </h2>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {badgesData.earnedCount}/{badgesData.totalCount} (
                    {badgesData.completionPercent}%)
                  </span>
                </div>
                <div className="mb-3">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500 dark:bg-amber-400"
                      style={{
                        width: `${badgesData.completionPercent}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {badgesData.badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </section>
            )}

            {/* Course Progress */}
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                הקורסים שלי
              </h2>
              {profile.courses.length > 0 ? (
                <div className="space-y-4">
                  {profile.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {course.courseImage && (
                            <img
                              src={course.courseImage}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-zinc-900 dark:text-white">
                              {course.courseTitle}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              נרשם:{" "}
                              {new Intl.DateTimeFormat("he-IL").format(
                                new Date(course.enrolledAt)
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {course.hasCertificate && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              תעודה
                            </span>
                          )}
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {course.completionPercent}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={course.completionPercent} size="md" />
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          {course.completedLessons}/{course.totalLessons}{" "}
                          שיעורים
                        </span>
                        <Link
                          href={`/courses/${course.courseId}`}
                          className="font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                        >
                          המשך ללמוד
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    עדיין לא נרשמת לקורסים.{" "}
                    <Link
                      href="/courses"
                      className="font-medium text-zinc-900 underline dark:text-white"
                    >
                      גלה קורסים
                    </Link>
                  </p>
                </div>
              )}
            </section>

            {/* Certificates Section with Share */}
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                התעודות שלי
              </h2>
              {profile.certificates.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.certificates.map((cert) => (
                    <CertificateShareCard
                      key={cert.certificateNumber}
                      certificate={cert}
                      userName={profile.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    עדיין אין לך תעודות. השלם קורסים כדי לקבל תעודות סיום!
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              לא נמצא פרופיל
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Certificate card with share button
function CertificateShareCard({
  certificate,
  userName,
}: {
  certificate: {
    courseId: string;
    courseName: string;
    certificateNumber: string;
    issuedAt: number;
    completionPercent: number;
  };
  userName: string;
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/certificates?verify=${certificate.certificateNumber}`
      : "";

  const shareText = `סיימתי את הקורס "${certificate.courseName}" בפלטפורמת הדרך! תעודה מספר ${certificate.certificateNumber}`;

  const ogImageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/og?name=${encodeURIComponent(userName)}&course=${encodeURIComponent(certificate.courseName)}&cert=${encodeURIComponent(certificate.certificateNumber)}&date=${encodeURIComponent(new Intl.DateTimeFormat("he-IL").format(new Date(certificate.issuedAt)))}`
      : "";

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleShareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleShareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Certificate info */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
            <p className="font-medium text-zinc-900 dark:text-white">
              {certificate.courseName}
            </p>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            הונפקה:{" "}
            {new Intl.DateTimeFormat("he-IL").format(
              new Date(certificate.issuedAt)
            )}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {certificate.certificateNumber}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {certificate.completionPercent}%
        </span>
      </div>

      {/* Share button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
          שתף תעודה
        </button>

        {/* Share menu dropdown */}
        {showShareMenu && (
          <div className="absolute bottom-full left-0 right-0 z-10 mb-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-6.07a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              {copied ? "הועתק!" : "העתק קישור"}
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleShareTwitter}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter)
            </button>
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>

            {/* OG Image Preview Link */}
            {ogImageUrl && (
              <a
                href={ogImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z"
                  />
                </svg>
                צפה בתמונת שיתוף
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700">
        <ProfileStatIcon icon={icon} />
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
    </div>
  );
}

function ProfileStatIcon({ icon }: { icon: string }) {
  const svgClass = "h-4.5 w-4.5 text-zinc-600 dark:text-zinc-300";

  switch (icon) {
    case "courses":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      );
    case "lessons":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "certificates":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a48.454 48.454 0 01-7.54 0"
          />
        </svg>
      );
    case "score":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      );
    default:
      return null;
  }
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
