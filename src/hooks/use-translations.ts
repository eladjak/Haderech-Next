/**
 * useTranslations Hook
 *
 * A custom hook that provides type-safe translations using i18next.
 * It wraps the useTranslation hook from react-i18next and provides better TypeScript support.
 */

import { useTranslation } from "react-i18next";

import type { AvailableLanguages } from "@/locales";

export function useTranslations() {
  const { t, i18n } = useTranslation();

  const setLanguage = async (lang: AvailableLanguages) => {
    await i18n.changeLanguage(lang);
  };

  const getCurrentLanguage = () => {
    return i18n.language as AvailableLanguages;
  };

  const getDirection = () => {
    return getCurrentLanguage() === "he" ? "rtl" : "ltr";
  };

  return {
    t,
    i18n,
    setLanguage,
    getCurrentLanguage,
    getDirection,
  };
}
