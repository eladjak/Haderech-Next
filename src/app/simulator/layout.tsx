import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "סימולטור שיחות",
  description:
    "תרגלו שיחות דייטינג אמיתיות עם סימולטור מבוסס בינה מלאכותית. שיפרו את הביטחון שלכם, למדו לנהל שיחות מעניינות וקבלו משוב מיידי.",
  openGraph: {
    title: "סימולטור שיחות | הדרך - אומנות הקשר",
    description:
      "תרגלו שיחות דייטינג אמיתיות עם סימולטור מבוסס בינה מלאכותית. שיפרו ביטחון וקבלו משוב מיידי.",
    url: `${siteConfig.url}/simulator`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "סימולטור שיחות - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "סימולטור שיחות | הדרך - אומנות הקשר",
    description:
      "תרגלו שיחות דייטינג אמיתיות עם סימולטור מבוסס בינה מלאכותית. שיפרו ביטחון וקבלו משוב מיידי.",
    images: ["/images/hero.jpg"],
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
