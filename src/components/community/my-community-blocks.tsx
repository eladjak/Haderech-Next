"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function MyCommunityBlocks() {
  const blocks = useQuery(api.communityModeration.listMyBlocks);
  const unblock = useMutation(api.communityModeration.unblockUser);
  const [busy, setBusy] = useState<string | null>(null);

  if (blocks === undefined) return null;

  return (
    <details className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer font-medium">
        משתמשים שהסתרתי ({blocks.length})
      </summary>
      {blocks.length === 0 ? (
        <p className="mt-3 text-zinc-500">לא הסתרת כרגע משתמשים בקהילה.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {blocks.map((block) => (
            <li key={block.blockedUserId} className="flex items-center justify-between gap-3">
              <span>{block.displayName}</span>
              <button
                type="button"
                disabled={busy === block.blockedUserId}
                onClick={async () => {
                  setBusy(block.blockedUserId);
                  try {
                    await unblock({ targetUserId: block.blockedUserId });
                  } finally {
                    setBusy(null);
                  }
                }}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
              >
                ביטול הסתרה
              </button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
