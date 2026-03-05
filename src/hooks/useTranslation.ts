"use client";

import { translations, Locale } from "@/lib/i18n/translations";

// For now, always Hebrew. Future: read from context/cookie
const currentLocale: Locale = "he";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key if not found
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const t = (key: string): string => {
    return getNestedValue(
      translations[currentLocale] as unknown as Record<string, unknown>,
      key,
    );
  };

  return { t, locale: currentLocale, dir: "rtl" as const };
}
