"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ─── Print-friendly certificate HTML builder ──────────────────────────────────

function buildPrintHTML(
  userName: string,
  courseName: string,
  certificateNumber: string,
  formattedDate: string,
  completionPercent: number
): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>תעודת סיום - ${courseName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4 landscape; margin: 0; }
  body {
    font-family: 'Heebo', Arial, sans-serif;
    background: #fff;
    width: 297mm;
    height: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    direction: rtl;
  }
  .cert {
    width: 275mm;
    height: 195mm;
    border: 3px solid #1E3A5F;
    border-radius: 12px;
    position: relative;
    padding: 32px 48px;
    text-align: center;
    background: linear-gradient(145deg, #FFFDF9 0%, #FFF8F0 50%, #FFFDF9 100%);
    overflow: hidden;
  }
  .cert::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1.5px solid #D4A853;
    border-radius: 8px;
    pointer-events: none;
  }
  .corner {
    position: absolute;
    width: 40px;
    height: 40px;
    border-color: #D4A853;
    border-style: solid;
    border-width: 0;
  }
  .tl { top: 20px; right: 20px; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 4px; }
  .tr { top: 20px; left: 20px; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 4px; }
  .bl { bottom: 20px; right: 20px; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 4px; }
  .br { bottom: 20px; left: 20px; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 4px; }
  .logo { font-size: 32px; font-weight: 900; color: #1E3A5F; margin-bottom: 4px; letter-spacing: 3px; }
  .subtitle { font-size: 20px; font-weight: 300; letter-spacing: 6px; color: #D4A853; margin-bottom: 24px; }
  .presents { font-size: 14px; color: #888; margin-bottom: 8px; font-weight: 300; }
  .name { font-size: 40px; font-weight: 900; color: #1E3A5F; margin-bottom: 12px; }
  .completed { font-size: 15px; color: #666; margin-bottom: 8px; font-weight: 300; }
  .course { font-size: 26px; font-weight: 700; color: #D4A853; margin-bottom: 24px; }
  .divider { width: 140px; height: 2px; background: linear-gradient(to right, transparent, #D4A853, transparent); margin: 0 auto 20px; }
  .seal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4A853, #F0D68A, #D4A853);
    box-shadow: 0 2px 8px rgba(212,168,83,0.3);
    margin-bottom: 16px;
    color: #1E3A5F;
    font-size: 28px;
    font-weight: 900;
  }
  .meta { font-size: 12px; color: #999; margin-bottom: 4px; }
  .cert-num { font-size: 11px; color: #ccc; margin-top: 12px; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="cert">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="logo">הדרך</div>
  <div class="subtitle">תעודת סיום</div>
  <div class="presents">מוענקת בגאווה ל-</div>
  <div class="name">${userName}</div>
  <div class="completed">אשר/ה סיים/ה בהצלחה את הקורס</div>
  <div class="course">${courseName}</div>
  <div class="divider"></div>
  <div class="seal">HD</div>
  <div class="meta">השלמה: ${completionPercent}% &nbsp;&bull;&nbsp; ${formattedDate}</div>
  <div class="cert-num">מספר תעודה: ${certificateNumber}</div>
</div>
</body>
</html>`;
}

// ─── Share helpers ─────────────────────────────────────────────────────────────

function useShareCertificate() {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const share = useCallback(
    async (courseName: string) => {
      const text = `קיבלתי תעודת סיום על הקורס "${courseName}" בהדרך!`;
      const url = window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title: "תעודת סיום - הדרך",
            text,
            url,
          });
        } else {
          await navigator.clipboard.writeText(`${text}\n${url}`);
          setCopyState("copied");
          setTimeout(() => setCopyState("idle"), 2500);
        }
      } catch {
        // User cancelled share - ignore
      }
    },
    []
  );

  return { share, copyState };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CertificateViewPage() {
  const params = useParams();
  const certId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const certificate = useQuery(
    api.certificates.getCertificate,
    certId ? { id: certId as Id<"certificates"> } : "skip"
  );

  const { share, copyState } = useShareCertificate();

  const formattedDate = certificate
    ? new Intl.DateTimeFormat("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(certificate.issuedAt))
    : "";

  const handlePrint = () => {
    if (!certificate) return;

    const html = buildPrintHTML(
      certificate.userName,
      certificate.courseName,
      certificate.certificateNumber,
      formattedDate,
      certificate.completionPercent
    );

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      alert("אנא אפשר חלונות קופצים כדי להדפיס את התעודה");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // Loading
  if (certificate === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="h-[500px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </main>
      </div>
    );
  }

  // Not found
  if (certificate === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 text-6xl" aria-hidden="true">
              ?
            </div>
            <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
              התעודה לא נמצאה
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              ייתכן שהקישור שגוי או שהתעודה הוסרה.
            </p>
            <Link
              href="/certificates"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              חזרה לתעודות
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/certificates"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              התעודות שלי
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">
              תעודת סיום
            </span>
          </nav>

          {/* Certificate Display */}
          <div
            ref={printRef}
            className="relative overflow-hidden rounded-2xl border-2 border-[#1E3A5F]/20 shadow-xl print:border-[#1E3A5F] print:shadow-none"
          >
            {/* Top gradient bar */}
            <div
              className="h-1.5 bg-gradient-to-r from-[#1E3A5F] via-[#D4A853] to-[#1E3A5F]"
              aria-hidden="true"
            />

            <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FFFDF9] px-6 py-10 text-center sm:px-12 sm:py-14 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-900">
              {/* Decorative corners */}
              <div
                className="absolute right-5 top-5 h-10 w-10 border-r-[3px] border-t-[3px] border-[#D4A853] rounded-tr-sm"
                aria-hidden="true"
              />
              <div
                className="absolute left-5 top-5 h-10 w-10 border-l-[3px] border-t-[3px] border-[#D4A853] rounded-tl-sm"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-5 right-5 h-10 w-10 border-b-[3px] border-r-[3px] border-[#D4A853] rounded-br-sm"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-5 left-5 h-10 w-10 border-b-[3px] border-l-[3px] border-[#D4A853] rounded-bl-sm"
                aria-hidden="true"
              />

              {/* Inner decorative border */}
              <div
                className="pointer-events-none absolute inset-3 rounded-lg border border-[#D4A853]/30"
                aria-hidden="true"
              />

              {/* Logo */}
              <div className="mb-2 text-3xl font-black tracking-[0.15em] text-[#1E3A5F] sm:text-4xl dark:text-blue-300">
                הדרך
              </div>

              {/* Title */}
              <h1 className="mb-8 text-lg font-light tracking-[0.3em] text-[#D4A853] sm:text-xl">
                תעודת סיום
              </h1>

              {/* Subtitle */}
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                מוענקת בגאווה ל-
              </p>

              {/* User name */}
              <p className="mb-3 text-3xl font-black text-[#1E3A5F] sm:text-4xl dark:text-blue-300">
                {certificate.userName}
              </p>

              {/* Course description */}
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                אשר/ה סיים/ה בהצלחה את הקורס
              </p>

              {/* Course name */}
              <p className="mb-8 text-xl font-bold text-[#D4A853] sm:text-2xl">
                {certificate.courseName}
              </p>

              {/* Gold divider */}
              <div
                className="mx-auto mb-6 h-0.5 w-32 bg-gradient-to-r from-transparent via-[#D4A853] to-transparent"
                aria-hidden="true"
              />

              {/* Seal */}
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A853] via-[#F0D68A] to-[#D4A853] shadow-lg shadow-[#D4A853]/20"
                aria-hidden="true"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1E3A5F]/20 bg-gradient-to-br from-[#F0D68A] to-[#D4A853]">
                  <span className="text-xl font-black text-[#1E3A5F]">
                    HD
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  השלמה: {certificate.completionPercent}%
                </span>
                <span
                  className="hidden h-1 w-1 rounded-full bg-zinc-400 sm:block"
                  aria-hidden="true"
                />
                <span>{formattedDate}</span>
              </div>

              {/* Certificate number */}
              <p className="text-xs tracking-wider text-zinc-400 dark:text-zinc-600">
                מספר תעודה: {certificate.certificateNumber}
              </p>
            </div>

            {/* Bottom gradient bar */}
            <div
              className="h-1.5 bg-gradient-to-r from-[#1E3A5F] via-[#D4A853] to-[#1E3A5F]"
              aria-hidden="true"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
            {/* Share button */}
            <button
              type="button"
              onClick={() => share(certificate.courseName)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="שתף תעודה"
            >
              {copyState === "copied" ? (
                <>
                  <svg
                    className="h-4 w-4 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  הקישור הועתק!
                </>
              ) : (
                <>
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
                </>
              )}
            </button>

            {/* Print / Download button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-[#1E3A5F] to-[#2A4F7F] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
              aria-label="הדפס או הורד תעודה"
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              הדפס / הורד PDF
            </button>

            {/* Back link */}
            <Link
              href="/certificates"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              חזרה לתעודות
            </Link>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          footer,
          nav,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
