"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend API
    setSubmitted(true);
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            צרו קשר
          </h1>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400">
            יש לכם שאלה, הצעה או משוב? נשמח לשמוע מכם.
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 p-8 text-center dark:bg-emerald-900/20">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                ההודעה נשלחה בהצלחה
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                תודה שפניתם אלינו. נחזור אליכם בהקדם.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  שם מלא
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                  placeholder="השם שלכם"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  כתובת מייל
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  נושא
                </label>
                <select
                  id="subject"
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-600"
                >
                  <option value="">בחרו נושא</option>
                  <option value="general">שאלה כללית</option>
                  <option value="technical">בעיה טכנית</option>
                  <option value="content">תוכן הקורסים</option>
                  <option value="suggestion">הצעה לשיפור</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  הודעה
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                  placeholder="ספרו לנו במה נוכל לעזור..."
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-full bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                שלח הודעה
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
