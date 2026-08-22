import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "סימולטור שיחות בדיוני",
  description:
    "תרגלו שיחות בדיוניות עם דמויות AI וקבלו משוב אוטומטי על התרגול. הסימולציה אינה אדם אמיתי, והמשוב אינו אבחון, ציון ליכולת או תחזית לקשר.",
  openGraph: {
    title: "סימולטור שיחות בדיוני | הדרך - אומנות הקשר",
    description:
      "תרגול שיחות בדיוניות עם דמויות AI ומשוב אוטומטי שעלול לטעות.",
    url: `${siteConfig.url}/simulator`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "סימולטור שיחות בדיוני - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "סימולטור שיחות בדיוני | הדרך - אומנות הקשר",
    description:
      "תרגול שיחות בדיוניות עם דמויות AI ומשוב אוטומטי שעלול לטעות.",
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
