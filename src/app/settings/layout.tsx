import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "הגדרות",
  description: "נהלו את הגדרות החשבון שלכם בהדרך - אומנות הקשר.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "הגדרות | הדרך - אומנות הקשר",
    description: "נהלו את הגדרות החשבון שלכם.",
    url: `${siteConfig.url}/settings`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "הגדרות - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "הגדרות | הדרך - אומנות הקשר",
    description: "נהלו את הגדרות החשבון שלכם.",
    images: ["/images/hero.jpg"],
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
