import { useCallback } from 'react';
import { he } from '@/locales/he';

type TranslationKey = keyof typeof he | string;

export const useLocalization = () => {
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    let translation = key.split('.').reduce((obj: any, k) => obj?.[k], he) || key;

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value.toString());
      });
    }

    return translation;
  }, []);

  return {
    t,
    currentLocale: 'he',
    direction: 'rtl' as const,
  };
}; 