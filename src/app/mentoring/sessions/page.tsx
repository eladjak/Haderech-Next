"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  InteractiveStarRating,
  StarRating,
} from "../page";
import type { Id } from "@/../convex/_generated/dataModel";

type Tab = "upcoming" | "past";

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const day = dayNames[date.getDay()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `יום ${day}, ${date.getDate()}/${date.getMonth() + 1} בשעה ${hours}:${minutes}`;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "הרגע";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `לפני ${days} ימים`;
  const weeks = Math.floor(days / 7);
  return `לפני ${weeks} שבועות`;
}

function RatingForm({ sessionId }: { sessionId: Id<"mentoringSessions"> }) {
  const rateSession = useMutation(api.mentoring.rateSession);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await rateSession({ sessionId, rating });
      setSubmitted(true);
    } catch {
      // Error handled by Convex
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        תודה על הדירוג!
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-accent-400/10 p-4 dark:bg-accent-400/5">
      <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        איך הייתה הפגישה?
      </p>
      <div className="flex items-center gap-3">
        <InteractiveStarRating value={rating} onChange={setRating} />
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "..." : "שלח"}
        </button>
      </div>
    </div>
  );
}

interface SessionData {
  _id: Id<"mentoringSessions">;
  mentorId: Id<"mentors">;
  studentId: Id<"users">;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledAt: number;
  duration: number;
  notes?: string;
  mentorNotes?: string;
  rating?: number;
  createdAt: number;
  mentorName: string;
  mentorImage: string | null;
}

function SessionCard({ session }: { session: SessionData }) {
  const isUpcoming =
    session.status === "pending" || session.status === "confirmed";
  const isCompleted = session.status === "completed";
  const needsRating = isCompleted && session.rating === undefined;

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {session.mentorName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">
              {session.mentorName}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatDateTime(session.scheduledAt)}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[session.status]}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {session.duration} דקות
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <span>{timeAgo(session.createdAt)}</span>
      </div>

      {session.notes && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ההערות שלך:
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {session.notes}
          </p>
        </div>
      )}

      {isCompleted && session.rating !== undefined && (
        <div className="mt-3">
          <StarRating rating={session.rating} />
        </div>
      )}

      {needsRating && <RatingForm sessionId={session._id} />}

      {isUpcoming && (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {session.status === "pending"
            ? "ממתין לאישור המאמן/ת"
            : "הפגישה מאושרת!"}
        </div>
      )}
    </div>
  );
}

function SessionsContent() {
  const sessions = useQuery(api.mentoring.getStudentSessions);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    if (!sessions) return { upcoming: [], past: [] };
    const up: SessionData[] = [];
    const pa: SessionData[] = [];
    for (const session of sessions) {
      const s = session as SessionData;
      if (
        s.status === "pending" ||
        s.status === "confirmed" ||
        (s.status !== "completed" &&
          s.status !== "cancelled" &&
          s.scheduledAt > now)
      ) {
        up.push(s);
      } else {
        pa.push(s);
      }
    }
    return { upcoming: up, past: pa };
  }, [sessions, now]);

  const activeSessions = activeTab === "upcoming" ? upcoming : past;

  if (sessions === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
            activeTab === "upcoming"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          קרובות ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
            activeTab === "past"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          עבר ({past.length})
        </button>
      </div>

      {/* Sessions List */}
      {activeSessions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg
              className="h-8 w-8 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
            {activeTab === "upcoming"
              ? "אין פגישות קרובות"
              : "אין פגישות קודמות"}
          </h3>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {activeTab === "upcoming"
              ? "הזמינו פגישה עם אחד מהמאמנים שלנו כדי להתחיל."
              : "ברגע שתשלימו פגישות, הן יופיעו כאן."}
          </p>
          {activeTab === "upcoming" && (
            <Link
              href="/mentoring"
              className="inline-flex rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              מצאו מאמן/ת
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SessionsPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
          <Header />

          {/* Hero */}
          <section className="border-b border-zinc-100 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="container mx-auto flex items-center justify-between px-4">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  הפגישות שלי
                </h1>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                  צפו בפגישות הייעוץ שלכם ודרגו חוויות
                </p>
              </div>
              <Link
                href="/mentoring"
                className="hidden items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 sm:inline-flex"
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                הזמנת פגישה
              </Link>
            </div>
          </section>

          {/* Content */}
          <section className="container mx-auto px-4 py-8">
            <SessionsContent />
          </section>

          <Footer />
        </div>
      </SignedIn>
    </>
  );
}
