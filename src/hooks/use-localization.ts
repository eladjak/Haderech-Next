import { useCallback } from "react";

import he from "@/locales/he.json";

type LocaleKey = keyof typeof he | (string & {});
type LocaleValue = string | { [key: string]: string | LocaleObject };
type LocaleObject = { [key: string]: string | LocaleObject };

function getNestedValue(
  obj: Record<string, LocaleValue>,
  path: string[],
): string | undefined {
  let current = obj as Record<string, LocaleValue>;
  for (const key of path) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = current[key] as Record<string, LocaleValue>;
  }
  return typeof current === "string" ? current : undefined;
}

export function useLocalization() {
  const t = useCallback(
    (key: LocaleKey, params?: Record<string, string>): string => {
      const path = key.split(".");
      let value = getNestedValue(he, path) || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{${paramKey}}`, paramValue);
        });
      }

      return value;
    },
    [],
  );

  const setLanguage = useCallback((lang: "he" | "en") => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, []);

  return { t, setLanguage };
}
