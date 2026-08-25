"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  isAnalyticsConsentGranted,
} from "@/lib/analytics-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalyticsScript() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const refresh = () => setConsented(isAnalyticsConsentGranted());
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_CONSENT_STORAGE_KEY) refresh();
    };
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    const analyticsWindow = window as unknown as Record<string, unknown> & {
      gtag?: (...args: unknown[]) => void;
    };
    analyticsWindow[`ga-disable-${GA_ID}`] = !consented;
    if (!consented && analyticsWindow.gtag) {
      analyticsWindow.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  }, [consented]);

  if (!GA_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
