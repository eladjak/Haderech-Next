import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "הדרך - אומנות הקשר",
    template: "%s | הדרך - אומנות הקשר",
  },
  description:
    "פלטפורמה ללמידת דייטינג וזוגיות באונליין. קורסים, סימולציות, כלים מעשיים ותמיכת קהילה לבניית קשרים אמיתיים ומשמעותיים.",
  metadataBase: new URL("https://haderech.co.il"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://haderech.co.il",
    siteName: "הדרך - אומנות הקשר",
    title: "הדרך - אומנות הקשר",
    description:
      "פלטפורמה ללמידת דייטינג וזוגיות באונליין. קורסים, סימולציות, כלים מעשיים ותמיכת קהילה.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "הדרך - אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "הדרך - אומנות הקשר",
    description:
      "פלטפורמה ללמידת דייטינג וזוגיות באונליין. קורסים, סימולציות, כלים מעשיים ותמיכת קהילה.",
    images: ["/images/hero.jpg"],
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
        <body className={`${heebo.variable} font-sans antialiased`}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
          >
            דלג לתוכן הראשי
          </a>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
