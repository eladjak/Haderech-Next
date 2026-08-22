"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

export function CommunityModerationQueue() {
  const reports = useQuery(api.adminCommunityModeration.listReportQueue, {
    limit: 100,
  });
  const appeals = useQuery(api.adminCommunityModeration.listAppealQueue, {
    limit: 100,
  });
  const updateReport = useMutation(
    api.adminCommunityModeration.updateReportStatus,
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(
    reportId: Id<"communityReports">,
    status: "under_review" | "resolved_no_action" | "dismissed",
  ) {
    const note = window.prompt("הערה פנימית למתן הקשר (לא חובה)")?.trim();
    setBusy(reportId);
    try {
      await updateReport({
        reportId,
        status,
        ...(note ? { internalNote: note } : {}),
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          תור בדיקה אנושי
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          דיווח אינו מסתיר תוכן ואינו מעניש אוטומטית. הפעולות כאן הן תיעוד
          triage בלבד.
        </p>
      </div>
      {reports === undefined ? (
        <p className="text-sm text-zinc-500">טוען דיווחים…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-zinc-500">אין דיווחים בתור.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report._id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {report.targetType} · {report.reason}
                </p>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                  {report.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                מדווח/ת: {report.reporterName} · נושא/ת הדיווח: {report.subjectName}
              </p>
              {report.details && (
                <p className="mt-2 whitespace-pre-wrap text-sm">{report.details}</p>
              )}
              <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
                {report.targetTitleSnapshot && (
                  <p className="font-medium">{report.targetTitleSnapshot}</p>
                )}
                <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                  {report.targetExcerptSnapshot}
                </p>
                {report.topicId && (
                  <Link
                    href={`/community/${report.topicId}`}
                    className="mt-2 inline-block font-medium underline"
                  >
                    פתיחת היעד בקהילה
                  </Link>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={busy === report._id}
                  onClick={() => setStatus(report._id, "under_review")}
                  className="rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  התחלת בדיקה
                </button>
                <button
                  disabled={busy === report._id}
                  onClick={() => setStatus(report._id, "resolved_no_action")}
                  className="rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  סגירה ללא פעולה
                </button>
                <button
                  disabled={busy === report._id}
                  onClick={() => setStatus(report._id, "dismissed")}
                  className="rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  דחיית דיווח
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-zinc-500">
        ערעורים ממתינים: {appeals?.length ?? 0}. בשלב זה אין במערכת sanction
        appealable, ולכן התור צפוי להישאר ריק עד שיוגדר מודל סנקציות מאושר.
      </p>
    </section>
  );
}
