import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ייעוץ אישי | הדרך",
  description:
    "קבלו הכוונה אישית ממאמנים מנוסים בתחום הדייטינג והזוגיות. הזמינו פגישת ייעוץ 1-על-1 עם מומחים מובילים.",
  openGraph: {
    title: "ייעוץ אישי | הדרך - אומנות הקשר",
    description:
      "קבלו הכוונה אישית ממאמנים מנוסים בתחום הדייטינג והזוגיות. הזמינו פגישת ייעוץ 1-על-1.",
    url: "https://haderech.co.il/mentoring",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "ייעוץ אישי - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ייעוץ אישי | הדרך - אומנות הקשר",
    description:
      "קבלו הכוונה אישית ממאמנים מנוסים בתחום הדייטינג והזוגיות. הזמינו פגישת ייעוץ 1-על-1.",
    images: ["/images/hero.jpg"],
  },
};

export default function MentoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
