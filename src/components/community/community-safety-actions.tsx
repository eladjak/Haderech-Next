"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

type Props = {
  targetType: "topic" | "reply";
  topicId?: Id<"communityTopics">;
  replyId?: Id<"communityReplies">;
};

export function CommunitySafetyActions(props: Props) {
  const reportTarget = useMutation(api.communityModeration.reportTarget);
  const blockUser = useMutation(api.communityModeration.blockUser);
  const [reason, setReason] = useState<
    "harassment" | "privacy" | "spam" | "unsafe_content" | "other"
  >("harassment");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitReport() {
    setBusy(true);
    setMessage("");
    try {
      await reportTarget({
        targetType: props.targetType,
        ...(props.topicId ? { topicId: props.topicId } : {}),
        ...(props.replyId ? { replyId: props.replyId } : {}),
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      });
      setMessage("הדיווח התקבל לבדיקה אנושית.");
      setDetails("");
    } catch {
      setMessage("לא הצלחנו לקבל את הדיווח. אפשר לנסות שוב מאוחר יותר.");
    } finally {
      setBusy(false);
    }
  }

  async function block() {
    if (!window.confirm("להסתיר עבורך תוכן של המשתמש/ת הזה/ו?")) return;
    setBusy(true);
    setMessage("");
    try {
      await blockUser({
        targetType: props.targetType,
        ...(props.topicId ? { topicId: props.topicId } : {}),
        ...(props.replyId ? { replyId: props.replyId } : {}),
      });
      setMessage("התוכן של המשתמש/ת הוסתר עבורך.");
    } catch {
      setMessage("לא הצלחנו לבצע את החסימה.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="text-xs text-zinc-500 dark:text-zinc-400">
      <summary className="cursor-pointer rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        דיווח או חסימה
      </summary>
      <div className="mt-2 w-72 max-w-full space-y-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <label className="block font-medium text-zinc-700 dark:text-zinc-200">
          סיבת הדיווח
          <select
            value={reason}
            onChange={(event) =>
              setReason(event.target.value as typeof reason)
            }
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="harassment">הטרדה או פגיעה</option>
            <option value="privacy">פגיעה בפרטיות</option>
            <option value="spam">ספאם</option>
            <option value="unsafe_content">תוכן לא בטוח</option>
            <option value="other">אחר</option>
          </select>
        </label>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={1500}
          rows={3}
          placeholder="פרטים קצרים שיעזרו לבדיקה (לא חובה)"
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={submitReport}
            className="rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            שליחת דיווח
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={block}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
          >
            הסתרת משתמש/ת
          </button>
        </div>
        {message && <p role="status">{message}</p>}
        <p className="leading-5">
          דיווחים נבדקים בידי אדם. דיווח אינו גורר ענישה אוטומטית.
        </p>
      </div>
    </details>
  );
}
