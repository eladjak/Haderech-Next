import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "צור קשר",
  description:
    "צרו קשר עם צוות הדרך - אומנות הקשר. יש לכם שאלות, הצעות או צורך בעזרה? אנחנו כאן בשבילכם.",
  openGraph: {
    title: "צור קשר | הדרך - אומנות הקשר",
    description:
      "צרו קשר עם צוות הדרך. שאלות, הצעות או עזרה - אנחנו כאן בשבילכם.",
    url: `${siteConfig.url}/contact`,
    images: [
      {
        url: "/images/haderech-banner.jpg",
        width: 1200,
        height: 630,
        alt: "צור קשר - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "צור קשר | הדרך - אומנות הקשר",
    description:
      "צרו קשר עם צוות הדרך. שאלות, הצעות או עזרה - אנחנו כאן בשבילכם.",
    images: ["/images/haderech-banner.jpg"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
