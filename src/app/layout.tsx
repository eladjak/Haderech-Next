import type { Metadata } from "next";
import { Suspense } from "react";
import { Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { GoogleAnalyticsScript } from "@/components/analytics/ga-script";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ErrorTracker } from "@/components/analytics/error-tracker";
import { WebsiteJsonLd, HomePageFallback } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";
import { SkipLink } from "@/components/layout/skip-link";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "הדרך - אומנות הקשר | תוכנית למידה בת 12 שבועות",
    template: "%s | הדרך - אומנות הקשר",
  },
  description:
    "תוכנית למידה בעברית בת 12 שבועות וב-6 שלבים, עם 75 שיעורים ו-8 מסמכי PDF לתרגול. כלי ה-AI והסימולטור מיועדים לתרגול בלבד ועלולים לטעות.",
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
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
    languages: { "he-IL": "/" },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "הדרך - אומנות הקשר",
    title: "הדרך - תוכנית למידה בת 12 שבועות | אומנות הקשר",
    description:
      "תוכנית למידה בעברית בת 12 שבועות וב-6 שלבים, עם 75 שיעורים ו-8 מסמכי PDF לתרגול.",
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
    title: "הדרך - תוכנית למידה בת 12 שבועות",
    description:
      "תוכנית למידה בעברית בת 12 שבועות וב-6 שלבים, עם 75 שיעורים ו-8 מסמכי PDF לתרגול.",
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
    <ClerkProvider localization={heIL} afterSignOutUrl="/">
      <html lang="he" dir="rtl" data-scroll-behavior="smooth">
        <head>
          <WebsiteJsonLd />
        </head>
        <body className={`${heebo.variable} font-sans antialiased`}>
          <GoogleAnalyticsScript />
          <HomePageFallback />
          <SkipLink />
          <ConvexClientProvider>
            <Suspense>
              <AnalyticsProvider>
                <MotionProvider>{children}</MotionProvider>
              </AnalyticsProvider>
            </Suspense>
          </ConvexClientProvider>
          <ErrorTracker />
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
