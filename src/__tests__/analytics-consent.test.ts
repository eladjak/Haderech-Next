import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  isAnalyticsConsentGranted,
  storeAnalyticsConsent,
} from "@/lib/analytics-consent";

describe("analytics consent gate", () => {
  beforeEach(() => localStorage.clear());

  it("fails closed when no decision exists", () => {
    expect(isAnalyticsConsentGranted(localStorage)).toBe(false);
  });

  it("allows analytics only for the exact granted decision", () => {
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "granted");
    expect(isAnalyticsConsentGranted(localStorage)).toBe(true);
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "withdrawn");
    expect(isAnalyticsConsentGranted(localStorage)).toBe(false);
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "yes");
    expect(isAnalyticsConsentGranted(localStorage)).toBe(false);
  });

  it("stores grant and withdrawal decisions explicitly", () => {
    storeAnalyticsConsent(true, localStorage);
    expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe("granted");
    storeAnalyticsConsent(false, localStorage);
    expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      "withdrawn"
    );
  });

  it("fails closed if storage cannot be read", () => {
    expect(
      isAnalyticsConsentGranted({
        getItem() {
          throw new Error("blocked");
        },
      })
    ).toBe(false);
  });

  it("gates both script loading and event transmission", () => {
    const gaScript = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/analytics/ga-script.tsx"),
      "utf8"
    );
    const provider = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/components/analytics/analytics-provider.tsx"
      ),
      "utf8"
    );
    expect(gaScript).toContain("!GA_ID || !consented");
    expect(gaScript).toContain("analytics_storage: \"denied\"");
    expect(provider).toContain("isAnalyticsConsentGranted()");
  });
});
