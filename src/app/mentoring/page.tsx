"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Id } from "@/../convex/_generated/dataModel";

interface MentorData {
  _id: Id<"mentors">;
  displayName: string;
  bio: string;
  specialties: string[];
  imageUrl?: string;
  pricePerSession: number;
  sessionDuration: number;
  available: boolean;
  rating?: number;
  totalSessions: number;
  userImage: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין לאישור",
  confirmed: "מאושר",
  completed: "הושלם",
  cancelled: "בוטל",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "text-accent-400 fill-accent-400"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="mr-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} כוכבים`}
        >
          <svg
            className={`h-7 w-7 transition-colors ${
              star <= (hover || value)
                ? "text-accent-400 fill-accent-400"
                : "text-zinc-300 dark:text-zinc-600"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatHebrewDate(date: Date): string {
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const day = dayNames[date.getDay()];
  return `יום ${day}, ${date.getDate()}/${date.getMonth() + 1}`;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function BookingModal({
  mentor,
  onClose,
}: {
  mentor: MentorData;
  onClose: () => void;
}) {
  const bookSession = useMutation(api.mentoring.bookSession);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(mentor.sessionDuration);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const days = getNextDays(7);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await bookSession({
        mentorId: mentor._id,
        scheduledAt: scheduledDate.getTime(),
        duration,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
    } catch {
      // Error handled by Convex
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="הזמנה נשלחה"
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <svg
              className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
            ההזמנה נשלחה בהצלחה!
          </h3>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {mentor.displayName} יקבל/תקבל התראה ויאשר/תאשר את הפגישה בהקדם.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              סגור
            </button>
            <Link
              href="/mentoring/sessions"
              className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:shadow-md hover:brightness-110"
            >
              הפגישות שלי
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`הזמנת פגישה עם ${mentor.displayName}`}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            הזמנת פגישה עם {mentor.displayName}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="סגור"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Date Selection */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            בחרו תאריך
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {days.map((day) => {
              const isSelected =
                selectedDate?.toDateString() === day.toDateString();
              const isFriday = day.getDay() === 5;
              const isSaturday = day.getDay() === 6;
              const isDisabled = isFriday || isSaturday;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedDate(day)}
                  className={`rounded-xl px-2 py-3 text-center text-xs font-medium transition-all ${
                    isDisabled
                      ? "cursor-not-allowed text-zinc-300 dark:text-zinc-700"
                      : isSelected
                        ? "bg-brand-500 text-white shadow-md"
                        : "bg-zinc-50 text-zinc-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  <div className="text-[10px]">
                    {["א", "ב", "ג", "ד", "ה", "ו", "ש"][day.getDay()]}
                  </div>
                  <div className="mt-0.5 text-sm font-bold">
                    {day.getDate()}
                  </div>
                  <div className="text-[10px]">{day.getMonth() + 1}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              בחרו שעה
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    selectedTime === time
                      ? "bg-brand-500 text-white shadow-md"
                      : "bg-zinc-50 text-zinc-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            משך הפגישה
          </label>
          <div className="flex gap-2">
            {[30, 45, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  duration === d
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-zinc-50 text-zinc-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {d} דקות
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label
            htmlFor="booking-notes"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            הערות למאמן/ת (אופציונלי)
          </label>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="ספרו בקצרה על מה תרצו לדבר..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-500 dark:focus:ring-brand-900/50"
          />
        </div>

        {/* Price Summary */}
        <div className="mb-6 rounded-xl bg-brand-50/60 p-4 dark:bg-brand-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              מחיר הפגישה
            </span>
            <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
              {mentor.pricePerSession} &#8362;
            </span>
          </div>
          {selectedDate && selectedTime && (
            <div className="mt-2 flex items-center justify-between border-t border-brand-100/60 pt-2 dark:border-brand-800/40">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                מועד
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {formatHebrewDate(selectedDate)}, {selectedTime}
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "שולח..." : "שלחו הזמנה"}
        </button>
      </div>
    </div>
  );
}

function MentorCard({ mentor }: { mentor: MentorData }) {
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <div className="group rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:border-brand-100 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
        {/* Avatar + Name */}
        <div className="mb-4 flex items-center gap-4">
          {mentor.imageUrl || mentor.userImage ? (
            <img
              src={mentor.imageUrl ?? mentor.userImage ?? ""}
              alt={mentor.displayName}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-100 dark:ring-zinc-700"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white ring-2 ring-brand-100 dark:ring-zinc-700">
              {getInitials(mentor.displayName)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {mentor.displayName}
            </h3>
            {mentor.rating !== undefined && (
              <StarRating rating={mentor.rating} />
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {mentor.bio}
        </p>

        {/* Specialties */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {mentor.specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Price + Sessions */}
        <div className="mb-5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {mentor.sessionDuration} דקות
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {mentor.totalSessions} פגישות
          </div>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {mentor.pricePerSession} &#8362;
          </span>
        </div>

        {/* CTA */}
        <SignedIn>
          <button
            onClick={() => setShowBooking(true)}
            className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            הזמנת פגישה
          </button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110">
              התחברו כדי להזמין
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {showBooking && (
        <BookingModal mentor={mentor} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}

export default function MentoringPage() {
  const mentors = useQuery(api.mentoring.listMentors);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-blue-500/10 via-brand-500/5 to-accent-400/10 py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-white">
            ייעוץ אישי 1-על-1
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            קבלו הכוונה אישית ממאמנים מנוסים בתחום הדייטינג והזוגיות
          </p>
          <SignedIn>
            <Link
              href="/mentoring/sessions"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-brand-600 shadow-sm transition-all hover:bg-brand-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-brand-400 dark:hover:bg-zinc-700"
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
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              הפגישות שלי
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        {mentors === undefined ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex-1">
                    <div className="mb-2 h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </div>
                <div className="mb-2 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="mb-4 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="mb-4 flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-6 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
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
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
              עדיין אין מאמנים
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              מאמנים חדשים יתווספו בקרוב. חזרו שוב!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {mentors.map((mentor) => (
              <MentorCard key={mentor._id} mentor={mentor as MentorData} />
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              ),
              title: "מאמנים מוסמכים",
              desc: "כל המאמנים שלנו עברו הכשרה ייעודית ובעלי ניסיון מוכח בתחום הדייטינג והזוגיות.",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              ),
              title: "פרטיות מלאה",
              desc: "כל השיחות חסויות לחלוטין. מה שנאמר בפגישה נשאר בפגישה.",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              ),
              title: "גישה אישית",
              desc: "כל פגישה מותאמת אישית לצרכים שלכם. אין גישה אחת שמתאימה לכולם.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-100 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                <svg
                  className="h-6 w-6 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {item.icon}
                </svg>
              </div>
              <h3 className="mb-1 font-bold text-zinc-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export { STATUS_LABELS, STATUS_COLORS, InteractiveStarRating, StarRating };
