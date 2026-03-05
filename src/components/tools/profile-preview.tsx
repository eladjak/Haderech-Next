"use client";

// -----------------------------------------------
// ProfilePreview - Mock Dating App Card
// Phase 70 - Dating Profile Builder
// -----------------------------------------------

interface ProfilePreviewProps {
  displayName?: string;
  age?: number;
  location?: string;
  bio?: string;
  interests?: string[];
  customInterests?: string[];
  lookingFor?: "relationship" | "casual" | "friendship" | "not-sure" | "";
  score?: number;
}

const LOOKING_FOR_LABELS: Record<string, { label: string; color: string }> = {
  relationship: { label: "מחפש/ת זוגיות", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" },
  casual: { label: "מחפש/ת קשר קליל", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  friendship: { label: "מחפש/ת חברות", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" },
  "not-sure": { label: "פתוח/ה לאפשרויות", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400" },
};

export function ProfilePreview({
  displayName,
  age,
  location,
  bio,
  interests = [],
  customInterests = [],
  lookingFor,
  score,
}: ProfilePreviewProps) {
  const allInterests = [...interests, ...customInterests].slice(0, 8);
  const hasContent = displayName || age || location || bio || allInterests.length > 0;
  const lookingForMeta = lookingFor ? LOOKING_FOR_LABELS[lookingFor] : null;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-400">הפרופיל שלך יופיע כאן</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      {/* Cover gradient */}
      <div className="h-28 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600" />

      {/* Avatar */}
      <div className="relative -mt-10 px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg dark:border-zinc-900">
          <span className="text-3xl font-bold text-white">
            {displayName ? displayName.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
      </div>

      {/* Profile info */}
      <div className="px-5 pb-5 pt-3">
        {/* Name row */}
        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {displayName || "שם תצוגה"}
          </h3>
          {age && (
            <span className="text-lg text-zinc-500 dark:text-zinc-400">{age}</span>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="mb-3 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {location}
          </div>
        )}

        {/* Looking for badge */}
        {lookingForMeta && (
          <div className="mb-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${lookingForMeta.color}`}>
              {lookingForMeta.label}
            </span>
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {bio}
          </p>
        )}

        {/* Interests */}
        {allInterests.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {allInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Score */}
        {score !== undefined && score > 0 && (
          <div className="mt-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>ציון פרופיל</span>
              <span className={`font-semibold ${score >= 70 ? "text-green-600 dark:text-green-400" : score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400"}`}>
                {score}/100
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
