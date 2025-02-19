import { format, formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export const formatDate = (date: string | Date) => {
  return format(new Date(date), "dd/MM/yyyy", { locale: he });
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: he });
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: he });
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("he-IL").format(num);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(amount);
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} דקות`;
  }

  if (remainingMinutes === 0) {
    return `${hours} שעות`;
  }

  return `${hours} שעות ו-${remainingMinutes} דקות`;
};

export const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`;
};

export const formatLevel = (level: number) => {
  return `רמה ${level}`;
};

export const formatPoints = (points: number) => {
  return `${formatNumber(points)} נקודות`;
};

export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} דקות`;
  }

  if (remainingMinutes === 0) {
    return `${hours} שעות`;
  }

  return `${hours} שעות ו-${remainingMinutes} דקות`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
