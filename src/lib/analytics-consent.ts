export const ANALYTICS_CONSENT_STORAGE_KEY =
  "haderech:privacy-consent:analytics:v1";
export const ANALYTICS_CONSENT_EVENT = "haderech:analytics-consent-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function isAnalyticsConsentGranted(
  storage?: ReadableStorage | null
): boolean {
  const resolvedStorage =
    storage ?? (typeof window !== "undefined" ? window.localStorage : null);
  if (!resolvedStorage) return false;
  try {
    return resolvedStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}
export function storeAnalyticsConsent(
  granted: boolean,
  storage?: WritableStorage | null
): void {
  const resolvedStorage =
    storage ?? (typeof window !== "undefined" ? window.localStorage : null);
  if (!resolvedStorage) return;
  resolvedStorage.setItem(
    ANALYTICS_CONSENT_STORAGE_KEY,
    granted ? "granted" : "withdrawn"
  );
  if (typeof window !== "undefined" && storage === undefined) {
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  }
}
