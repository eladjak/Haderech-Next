"use client";

/**
 * Hebrew relative time utility.
 * Returns strings like "לפני 3 שעות", "לפני רגע", "לפני 2 ימים".
 */
export function timeAgoHe(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return "לפני רגע";
  if (seconds < 60) return `לפני ${seconds} שניות`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "לפני דקה";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "לפני שעה";
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "לפני יום";
  if (days < 30) return `לפני ${days} ימים`;
  const months = Math.floor(days / 30);
  if (months === 1) return "לפני חודש";
  if (months < 12) return `לפני ${months} חודשים`;
  const years = Math.floor(months / 12);
  if (years === 1) return "לפני שנה";
  return `לפני ${years} שנים`;
}

interface TimeAgoProps {
  timestamp: number;
  className?: string;
}

export function TimeAgo({ timestamp, className }: TimeAgoProps) {
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      title={new Date(timestamp).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      className={className}
    >
      {timeAgoHe(timestamp)}
    </time>
  );
}
