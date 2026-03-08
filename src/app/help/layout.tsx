import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "עזרה ותמיכה",
  description:
    "מרכז העזרה של הדרך - אומנות הקשר. מצאו תשובות לשאלות נפוצות, מדריכי שימוש ופתרונות לבעיות נפוצות.",
  openGraph: {
    title: "עזרה ותמיכה | הדרך - אומנות הקשר",
    description:
      "מרכז העזרה של הדרך. שאלות נפוצות, מדריכי שימוש ופתרונות לבעיות.",
    url: `${siteConfig.url}/help`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "עזרה ותמיכה - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "עזרה ותמיכה | הדרך - אומנות הקשר",
    description:
      "מרכז העזרה של הדרך. שאלות נפוצות, מדריכי שימוש ופתרונות לבעיות.",
    images: ["/images/hero.jpg"],
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
