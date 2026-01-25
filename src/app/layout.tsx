import { Analytics } from "@vercel/analytics/react";
import { Viewport } from "next";
import React from "react";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";
import { StructuredData } from "@/components/StructuredData";
import { PWA } from "@/components/PWA";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://haderech.co.il'),
  title: {
    default: 'הדרך - פלטפורמת למידה מתקדמת לפיתוח כישורי תקשורת',
    template: '%s | הדרך',
  },
  description: 'פלטפורמת למידה אינטראקטיבית לפיתוח כישורי תקשורת ויחסים אישיים. קורסים מקצועיים, סימולטורים אינטראקטיביים, ופורום קהילתי.',
  keywords: ['למידה מקוונת', 'כישורי תקשורת', 'יחסים אישיים', 'קורסים דיגיטליים', 'סימולטור', 'פורום'],
  authors: [{ name: 'HaDerech Team', url: 'https://haderech.co.il' }],
  creator: 'HaDerech',
  publisher: 'HaDerech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://haderech.co.il',
    siteName: 'הדרך',
    title: 'הדרך - פלטפורמת למידה מתקדמת',
    description: 'פלטפורמת למידה אינטראקטיבית לפיתוח כישורי תקשורת ויחסים אישיים',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'הדרך - פלטפורמת למידה',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הדרך - פלטפורמת למידה מתקדמת',
    description: 'פלטפורמת למידה אינטראקטיבית לפיתוח כישורי תקשורת',
    images: ['/twitter-image.png'],
    creator: '@haderech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://haderech.co.il',
    languages: {
      'he-IL': 'https://haderech.co.il',
      'en-US': 'https://haderech.co.il/en',
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Removed maximumScale and userScalable to comply with WCAG 2.1 Level AA
  // and Israeli accessibility law - users must be able to zoom
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="הדרך" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Structured Data for SEO */}
        <StructuredData />

        {/* DNS Prefetch & Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Preconnect to Supabase */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}

        {/* Preload critical resources */}
        <link
          rel="modulepreload"
          href="/_next/static/chunks/framework.js"
        />
        <link
          rel="modulepreload"
          href="/_next/static/chunks/main.js"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
          <Analytics />
          <Toaster />
          <PWA />
        </Providers>
      </body>
    </html>
  );
}
