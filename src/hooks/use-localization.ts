import he from '@/locales/he.json'

type LocaleKey = string
type LocaleValue = string | Record<string, LocaleValue>

function getNestedValue(obj: Record<string, LocaleValue>, path: string[]): string | undefined {
  let current = obj
  for (const key of path) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    current = current[key] as Record<string, LocaleValue>
  }
  return typeof current === 'string' ? current : undefined
}

export function useLocalization() {
  const t = (key: LocaleKey): string => {
    const path = key.split('.')
    const value = getNestedValue(he, path)
    return value || key
  }

  return { t }
} 