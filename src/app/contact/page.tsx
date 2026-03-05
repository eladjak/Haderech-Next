"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: "general", label: "שאלה כללית" },
  { value: "technical", label: "בעיה טכנית" },
  { value: "partnership", label: "בקשת שיתוף פעולה" },
  { value: "suggestion", label: "הצעה לשיפור" },
  { value: "other", label: "אחר" },
];

const CONTACT_INFO = [
  {
    emoji: "📧",
    label: "מייל",
    value: "support@haderech.co.il",
    href: "mailto:support@haderech.co.il",
  },
  {
    emoji: "⏱️",
    label: "זמן תגובה",
    value: "עד 24 שעות בימי עסקים",
    href: null,
  },
  {
    emoji: "🕐",
    label: "שעות פעילות",
    value: "א׳–ה׳, 09:00–18:00",
    href: null,
  },
];

// ─── Input Classname ───────────────────────────────────────────────────────────

const inputCls =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-violet-600 dark:focus:ring-violet-900/30";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const { user } = useUser();
  const submitMessage = useMutation(api.contact.submitMessage);

  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.message.trim().length < 20) {
      setError("ההודעה קצרה מדי - אנא כתבו לפחות 20 תווים");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        userId: user?.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "שגיאה בשליחת ההודעה. נסו שוב."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main id="main-content" className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl shadow-lg">
            📬
          </div>
          <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-white">
            צרו קשר
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            יש לכם שאלה, הצעה או משוב? נשמח לשמוע מכם.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
          {/* Contact Info - left column on desktop */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 lg:col-span-2"
          >
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
                פרטי יצירת קשר
              </h2>
              <div className="space-y-4">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl" aria-hidden="true">
                      {info.emoji}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm text-violet-600 hover:underline dark:text-violet-400"
                          dir="ltr"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-zinc-800 dark:text-zinc-200">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help link */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 dark:border-violet-900/30 dark:bg-violet-950/20">
              <p className="mb-2 text-sm font-medium text-violet-900 dark:text-violet-200">
                מחפשים תשובה מהירה?
              </p>
              <p className="mb-3 text-xs text-violet-700 dark:text-violet-300">
                במרכז העזרה שלנו תמצאו תשובות ל-20+ שאלות נפוצות.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
              >
                מרכז עזרה
                <svg
                  className="h-3 w-3 rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L6 12l7.5 7.5"
                  />
                </svg>
              </Link>
            </div>
          </motion.aside>

          {/* Form - right column on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 p-10 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20"
                >
                  <div className="mb-4 text-5xl">✅</div>
                  <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
                    ההודעה נשלחה בהצלחה!
                  </h2>
                  <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                    תודה שפניתם אלינו. נחזור אליכם בתוך 24 שעות בימי עסקים.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    שלח הודעה נוספת
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        id="form-error"
                        role="alert"
                        aria-live="polite"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      שם מלא <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      aria-required="true"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={inputCls}
                      placeholder="ישראל ישראלי"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      כתובת מייל <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      aria-required="true"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className={inputCls}
                      placeholder="your@email.com"
                      dir="ltr"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      נושא <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      required
                      aria-required="true"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-violet-600 dark:focus:ring-violet-900/30"
                    >
                      <option value="">בחרו נושא</option>
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      הודעה <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      aria-required="true"
                      aria-describedby="message-hint"
                      rows={5}
                      minLength={20}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-violet-600 dark:focus:ring-violet-900/30"
                      placeholder="ספרו לנו במה נוכל לעזור... (לפחות 20 תווים)"
                    />
                    <p id="message-hint" className="mt-1 text-left text-xs text-zinc-500">
                      {form.message.length} / מינימום 20 תווים
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-violet-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        שולח...
                      </>
                    ) : (
                      "שלח הודעה"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
