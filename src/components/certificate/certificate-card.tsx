"use client";

interface CertificateCardProps {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: number;
  completionPercent: number;
}

export function CertificateCard({
  userName,
  courseName,
  certificateNumber,
  issuedAt,
  completionPercent,
}: CertificateCardProps) {
  const formattedDate = new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(issuedAt));

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900"
      role="article"
      aria-label={`תעודת סיום: ${courseName}`}
    >
      {/* Decorative corners */}
      <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-zinc-300 dark:border-zinc-600" />
      <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-zinc-300 dark:border-zinc-600" />
      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-zinc-300 dark:border-zinc-600" />
      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-zinc-300 dark:border-zinc-600" />

      <div className="text-center">
        {/* Logo */}
        <div className="mb-2 text-xl font-bold text-zinc-400 dark:text-zinc-500">
          הדרך
        </div>

        {/* Title */}
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          תעודת סיום קורס
        </h3>

        {/* Recipient */}
        <p className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
          {userName}
        </p>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          סיים/ה בהצלחה את הקורס
        </p>

        {/* Course name */}
        <p className="mb-6 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          {courseName}
        </p>

        {/* Details */}
        <div className="mb-4 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span>השלמה: {completionPercent}%</span>
          <span>{formattedDate}</span>
        </div>

        {/* Certificate number */}
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          מספר תעודה: {certificateNumber}
        </p>
      </div>
    </div>
  );
}
