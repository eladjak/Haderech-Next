import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "מאמר | הדרך",
  description:
    "קראו מאמרים מקצועיים על דייטינג, זוגיות וצמיחה אישית מצוות הדרך.",
  openGraph: {
    title: "מאמר | הדרך - אומנות הקשר",
    description: "מאמר מקצועי מצוות הדרך - אומנות הקשר.",
    url: `${siteConfig.url}/blog`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "מאמר - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "מאמר | הדרך - אומנות הקשר",
    description: "מאמר מקצועי מצוות הדרך - אומנות הקשר.",
    images: ["/images/hero.jpg"],
  },
};

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
