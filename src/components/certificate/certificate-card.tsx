"use client";

import { useRef, useState, useCallback } from "react";

interface CertificateCardProps {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: number;
  completionPercent: number;
}

// ─── PDF generation via canvas (no external library) ─────────────────────────

function buildCertificateHTML(
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
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #fff;
    width: 297mm;
    height: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    direction: rtl;
  }
  .cert {
    width: 270mm;
    height: 190mm;
    border: 3px solid #E85D75;
    border-radius: 16px;
    position: relative;
    padding: 40px 60px;
    text-align: center;
    background: linear-gradient(135deg, #FFFAF7 0%, #fde6ea 100%);
  }
  .corner {
    position: absolute;
    width: 30px;
    height: 30px;
    border-color: #D4A853;
    border-style: solid;
    border-width: 0;
  }
  .tl { top: 16px; right: 16px; border-top-width: 3px; border-right-width: 3px; }
  .tr { top: 16px; left: 16px; border-top-width: 3px; border-left-width: 3px; }
  .bl { bottom: 16px; right: 16px; border-bottom-width: 3px; border-right-width: 3px; }
  .br { bottom: 16px; left: 16px; border-bottom-width: 3px; border-left-width: 3px; }
  .logo { font-size: 28px; font-weight: 900; color: #1E3A5F; margin-bottom: 8px; letter-spacing: 2px; }
  .subtitle { font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #E85D75; margin-bottom: 28px; }
  .presents { font-size: 14px; color: #666; margin-bottom: 8px; }
  .name { font-size: 36px; font-weight: 700; color: #1E3A5F; margin-bottom: 12px; }
  .completed { font-size: 15px; color: #444; margin-bottom: 8px; }
  .course { font-size: 24px; font-weight: 700; color: #E85D75; margin-bottom: 28px; }
  .divider { width: 120px; height: 2px; background: #D4A853; margin: 0 auto 20px; }
  .meta { font-size: 12px; color: #888; margin-bottom: 6px; }
  .cert-num { font-size: 11px; color: #bbb; margin-top: 16px; }
</style>
</head>
<body>
<div class="cert">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="logo">הדרך</div>
  <div class="subtitle">תעודת סיום קורס</div>
  <div class="presents">מוענקת בגאווה ל-</div>
  <div class="name">${userName}</div>
  <div class="completed">אשר/ה סיים/ה בהצלחה את הקורס</div>
  <div class="course">${courseName}</div>
  <div class="divider"></div>
  <div class="meta">השלמה: ${completionPercent}% &nbsp;&bull;&nbsp; ${formattedDate}</div>
  <div class="cert-num">מספר תעודה: ${certificateNumber}</div>
</div>
</body>
</html>`;
}

function usePDFDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const download = useCallback(
    async (
      userName: string,
      courseName: string,
      certificateNumber: string,
      formattedDate: string,
      completionPercent: number
    ) => {
      setIsGenerating(true);
      try {
        const html = buildCertificateHTML(
          userName,
          courseName,
          certificateNumber,
          formattedDate,
          completionPercent
        );

        // Open print dialog in a new window - browser handles PDF export
        const printWindow = window.open("", "_blank", "width=1200,height=900");
        if (!printWindow) {
          alert("אנא אפשר חלונות קופצים כדי להוריד את התעודה");
          return;
        }
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { download, isGenerating };
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareCertButton({
  userName,
  courseName,
}: {
  userName: string;
  courseName: string;
}) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const text = `קיבלתי תעודת סיום על הקורס "${courseName}" בהדרך! 🎓`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "תעודת סיום - הדרך",
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setState("copied");
        setTimeout(() => setState("idle"), 2500);
      }
    } catch {
      // User cancelled or share not supported — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      aria-label={`שתף תעודה: ${courseName}`}
    >
      {state === "copied" ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          הועתק!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          שתף
        </>
      )}
    </button>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function CertificateCard({
  userName,
  courseName,
  certificateNumber,
  issuedAt,
  completionPercent,
}: CertificateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { download, isGenerating } = usePDFDownload();

  const formattedDate = new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(issuedAt));

  const handleDownload = () => {
    void download(userName, courseName, certificateNumber, formattedDate, completionPercent);
  };

  return (
    <div className="overflow-hidden rounded-2xl shadow-md" ref={cardRef}>
      {/* Certificate preview with brand colors */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-[#FFFAF7] to-[#fde6ea] p-8 dark:from-zinc-900 dark:to-brand-950"
        role="article"
        aria-label={`תעודת סיום: ${courseName}`}
      >
        {/* Decorative corners (gold) */}
        <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-accent-400" aria-hidden="true" />
        <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-accent-400" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-accent-400" aria-hidden="true" />
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-accent-400" aria-hidden="true" />

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500" aria-hidden="true" />

        <div className="text-center">
          {/* Logo */}
          <div className="mb-1 text-2xl font-black tracking-widest text-blue-500 dark:text-blue-400">
            הדרך
          </div>

          {/* Title */}
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            תעודת סיום קורס
          </h3>

          {/* Recipient */}
          <p className="mb-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            מוענקת ל-
          </p>
          <p className="mb-1 text-2xl font-bold text-blue-500 dark:text-blue-400">
            {userName}
          </p>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            אשר/ה סיים/ה בהצלחה את הקורס
          </p>

          {/* Course name */}
          <p className="mb-4 text-xl font-extrabold text-brand-600 dark:text-brand-400">
            {courseName}
          </p>

          {/* Gold divider */}
          <div className="mx-auto mb-4 h-0.5 w-20 bg-gradient-to-r from-transparent via-accent-400 to-transparent" aria-hidden="true" />

          {/* Details */}
          <div className="mb-3 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <span>השלמה: {completionPercent}%</span>
            <span>{formattedDate}</span>
          </div>

          {/* Certificate number */}
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            מספר תעודה: {certificateNumber}
          </p>
        </div>
      </div>

      {/* Action bar below the certificate preview */}
      <div className="flex items-center justify-between border border-t-0 border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <ShareCertButton userName={userName} courseName={courseName} />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
          aria-label={`הורד תעודה: ${courseName}`}
        >
          {isGenerating ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.990" />
              </svg>
              מכין...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              הורד PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
