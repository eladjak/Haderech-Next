/**
 * Localization Configuration
 * 
 * This file exports the configuration for i18next and the available translations.
 * It also provides type definitions for the translations.
 */

import { en } from './en'
import { he } from './he'

export const defaultNS = 'translation'
export const fallbackLng = 'he'

export const resources = {
  en: {
    translation: en,
  },
  he: {
    translation: he,
  },
} as const

export type AvailableLanguages = keyof typeof resources
export type TranslationKeys = keyof typeof he | keyof typeof en

export { en, he } 