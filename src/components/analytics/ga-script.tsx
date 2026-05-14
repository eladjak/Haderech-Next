"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = "haderech_cookie_consent_v1";

/**
 * Loads Google Analytics ONLY after the user accepts cookies (Israeli
 * Communications Law amendment 40 / EU GDPR / general best practice).
 * Listens to `cookie-consent-accepted` window event from CookieConsent
 * component for dynamic activation without page reload.
 */
export function GoogleAnalyticsScript() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setConsented(window.localStorage.getItem(STORAGE_KEY) === "accepted");
    function onAccept() {
      setConsented(true);
    }
    window.addEventListener("cookie-consent-accepted", onAccept);
    return () => window.removeEventListener("cookie-consent-accepted", onAccept);
  }, []);

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
