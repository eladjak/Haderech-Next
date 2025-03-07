import React from "react";
import { Analytics } from "@/components/analytics";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Viewport as ViewportComponent } from "@/components/viewport";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "הדרך",
    template: "%s | הדרך",
  },
  description: "פלטפורמת למידה מקוונת לפיתוח אישי ומקצועי",
  keywords: [
    "למידה מקוונת",
    "פיתוח אישי",
    "פיתוח מקצועי",
    "קורסים",
    "הדרכה",
    "מנטורינג",
  ],
  authors: [
    {
      name: "הדרך",
      url: "https://haderech.co.il",
    },
  ],
  creator: "הדרך",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://haderech.co.il",
    title: "הדרך - פלטפורמת למידה מקוונת",
    description: "פלטפורמת למידה מקוונת לפיתוח אישי ומקצועי",
    siteName: "הדרך",
  },
  twitter: {
    card: "summary_large_image",
    title: "הדרך - פלטפורמת למידה מקוונת",
    description: "פלטפורמת למידה מקוונת לפיתוח אישי ומקצועי",
    creator: "@haderech",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          <ViewportComponent />
          {children}
          <Analytics />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
