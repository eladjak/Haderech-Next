import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "בלוג",
  description:
    "מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית מצוות הדרך - אומנות הקשר.",
  openGraph: {
    title: "בלוג | הדרך - אומנות הקשר",
    description:
      "מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית.",
    url: `${siteConfig.url}/blog`,
    images: [
      {
        url: "/images/haderech-banner.jpg",
        width: 1200,
        height: 630,
        alt: "בלוג - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "בלוג | הדרך - אומנות הקשר",
    description:
      "מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית.",
    images: ["/images/haderech-banner.jpg"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
