"use client";

// Badge icon component with 12 unique SVG icons for the gamification system
// Each icon represents a different achievement type

export function BadgeIcon({
  icon,
  earned,
  size = "md",
}: {
  icon: string;
  earned: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  }[size];

  const colorClass = earned
    ? "text-zinc-700 dark:text-zinc-200"
    : "text-zinc-400 dark:text-zinc-600";

  const svgProps = {
    className: `${sizeClass} ${colorClass}`,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "rocket":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      );

    case "book":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      );

    case "bookOpen":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v14.25M6 8.25l2 .5M18 8.25l-2 .5"
          />
        </svg>
      );

    case "star":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      );

    case "sword":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      );

    case "trophy":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a48.454 48.454 0 01-7.54 0"
          />
        </svg>
      );

    case "medal":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      );

    case "fire":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
          />
        </svg>
      );

    case "flame":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
        </svg>
      );

    case "crown":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 17.25V21h18v-3.75M3 17.25l3-9 3 4.5L12 6l3 6.75 3-4.5 3 9M3 17.25h18"
          />
        </svg>
      );

    case "compass":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.828 9.172l-1.414 4.243-4.243 1.414 1.414-4.243 4.243-1.414z"
          />
        </svg>
      );

    case "shield":
      return (
        <svg {...svgProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      );

    default:
      return null;
  }
}

// Badge card component used in profile and achievement pages
export function BadgeCard({
  badge,
}: {
  badge: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: number;
  };
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        badge.earned
          ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
          : "border-zinc-100 bg-zinc-50/50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900/50"
      }`}
    >
      <div
        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
          badge.earned
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <BadgeIcon icon={badge.icon} earned={badge.earned} />
      </div>
      <h3 className="mb-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
        {badge.title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {badge.description}
      </p>
      {badge.earned && badge.earnedAt && (
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          הושג:{" "}
          {new Intl.DateTimeFormat("he-IL").format(new Date(badge.earnedAt))}
        </p>
      )}
    </div>
  );
}

// Daily streak visual component
export function StreakDisplay({
  streak,
}: {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    isActiveToday: boolean;
    weekActivity: boolean[];
  };
}) {
  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  // Get the day of week for today, then map backwards
  const today = new Date().getDay();
  // weekActivity is last 7 days (index 6 = today, 0 = 6 days ago)
  // Map to day names
  const weekDays = streak.weekActivity.map((active, i) => {
    const dayOffset = 6 - i;
    const dayIndex = (today - dayOffset + 7) % 7;
    return {
      name: dayNames[dayIndex],
      active,
      isToday: i === 6,
    };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          רצף למידה יומי
        </h3>
        <div className="flex items-center gap-1.5">
          <svg
            className={`h-5 w-5 ${streak.currentStreak > 0 ? "text-orange-500" : "text-zinc-400 dark:text-zinc-600"}`}
            fill={streak.currentStreak > 0 ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
            />
          </svg>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            {streak.currentStreak}
          </span>
        </div>
      </div>

      {/* Week activity visualization */}
      <div className="mb-4 flex justify-between gap-2">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                day.active
                  ? "bg-emerald-500 text-white dark:bg-emerald-600"
                  : day.isToday
                    ? "border-2 border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              }`}
              aria-label={`${day.name}: ${day.active ? "למדת" : "לא למדת"}`}
            >
              {day.active ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : null}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {day.name}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {streak.currentStreak}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            רצף נוכחי
          </p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {streak.longestStreak}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            שיא רצף
          </p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {streak.totalActiveDays}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            סה"כ ימים
          </p>
        </div>
      </div>

      {/* Motivation message */}
      {!streak.isActiveToday && (
        <p className="mt-3 text-center text-sm text-amber-600 dark:text-amber-400">
          עוד לא למדת היום! השלם שיעור כדי לשמור על הרצף.
        </p>
      )}
    </div>
  );
}
