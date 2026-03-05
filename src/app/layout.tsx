import type { Metadata } from "next";
import { Suspense } from "react";
import { Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { GoogleAnalyticsScript } from "@/components/analytics/ga-script";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ErrorTracker } from "@/components/analytics/error-tracker";
import { WebsiteJsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "הדרך - אומנות הקשר | תוכנית 12 שבועות לזוגיות",
    template: "%s | הדרך - אומנות הקשר",
  },
  description:
    "תוכנית הדרך של אומנות הקשר - 12 שבועות שישנו לך את חיי הזוגיות. עם צ'אט AI חכם, סימולטור דייטים, קהילה תומכת ו-73 שיעורי וידאו.",
  keywords: [
    "זוגיות",
    "דייטינג",
    "אומנות הקשר",
    "קורס זוגיות",
    "הדרך",
    "דייטים",
    "מציאת זוגיות",
    "אהבה",
    "תקשורת זוגית",
  ],
  authors: [{ name: "אלעד יעקבוביץ׳ - אומנות הקשר" }],
  creator: "אומנות הקשר",
  publisher: "אומנות הקשר",
  metadataBase: new URL("https://haderech.ohlove.co.il"),
  alternates: {
    canonical: "/",
    languages: { "he-IL": "/" },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "הדרך - אומנות הקשר",
    title: "הדרך - תוכנית 12 שבועות לזוגיות | אומנות הקשר",
    description:
      "תוכנית הדרך של אומנות הקשר - 12 שבועות שישנו לך את חיי הזוגיות.",
    images: [
      {
        url: "/images/haderech-banner.jpg",
        width: 1200,
        height: 630,
        alt: "הדרך - אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "הדרך - תוכנית 12 שבועות לזוגיות",
    description:
      "תוכנית הדרך של אומנות הקשר - 12 שבועות שישנו לך את חיי הזוגיות.",
    images: ["/images/haderech-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={heIL}>
      <html lang="he" dir="rtl">
        <head>
          <WebsiteJsonLd />
        </head>
        <body className={`${heebo.variable} font-sans antialiased`}>
          <GoogleAnalyticsScript />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
          >
            דלג לתוכן הראשי
          </a>
          <ConvexClientProvider>
            <Suspense>
              <AnalyticsProvider>{children}</AnalyticsProvider>
            </Suspense>
          </ConvexClientProvider>
          <ErrorTracker />
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
