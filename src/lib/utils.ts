import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility Functions
 *
 * A collection of utility functions used throughout the application.
 * Includes functions for class name merging, date formatting, text manipulation, etc.
 */

/**
 * Merges multiple class names using clsx and tailwind-merge
 * Useful for combining Tailwind classes with dynamic conditions
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a localized string
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats minutes into hours and minutes string
 *
 * @param minutes - Number of minutes
 * @returns Formatted duration string
 */
export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} דקות`;
  }

  if (remainingMinutes === 0) {
    return `${hours} שעות`;
  }

  return `${hours} שעות ו-${remainingMinutes} דקות`;
}

/**
 * Formats a price in NIS with proper currency symbol
 *
 * @param price - Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(price);
}

/**
 * Formats a number with proper thousands separators
 *
 * @param number - Number to format
 * @returns Formatted number string
 */
export function formatNumber(number: number) {
  return new Intl.NumberFormat("he-IL").format(number);
}

/**
 * Truncates text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * Creates a URL-friendly slug from a string
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, "") // Keep Hebrew characters
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Gets initials from a name (up to 2 characters)
 *
 * @param name - Full name
 * @returns Initials string
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
