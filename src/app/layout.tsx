import React from "react";

import { Analytics } from "@vercel/analytics/react";

import { Toaster } from "@/components/ui/toaster";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";

import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "הדרך",
    template: "%s | הדרך",
  },
  description: "פלטפורמת למידה מתקדמת לשיפור מערכות יחסים",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
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
        </Providers>
      </body>
    </html>
  );
}
