import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { CommunityAccessBoundary } from "@/components/community/community-access-boundary";

export const metadata: Metadata = {
  title: "קהילה",
  description:
    "הקהילה של אומנות הקשר נמצאת בהכנה לקראת פתיחה מסודרת סביב הספר, הקורס והליווי.",
  openGraph: {
    title: "קהילה | הדרך - אומנות הקשר",
    description:
      "קהילה אחת סביב הספר, הקורס והליווי — נמצאת כעת בהכנה לקראת פתיחה מסודרת.",
    url: `${siteConfig.url}/community`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "קהילה - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "קהילה | הדרך - אומנות הקשר",
    description:
      "קהילה אחת סביב הספר, הקורס והליווי — נמצאת כעת בהכנה לקראת פתיחה מסודרת.",
    images: ["/images/hero.jpg"],
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityAccessBoundary>{children}</CommunityAccessBoundary>;
}
