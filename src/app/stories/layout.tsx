import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "סיפורי הצלחה | הדרך",
  description:
    "קראו סיפורי הצלחה מתלמידים שעברו את הקורסים שלנו ושינו את חיי הזוגיות שלהם. הסיפורים שלהם מספרים את הכל.",
  openGraph: {
    title: "סיפורי הצלחה | הדרך - אומנות הקשר",
    description:
      "סיפורי הצלחה מתלמידי הדרך - שינוי אמיתי בזוגיות, דייטינג וצמיחה אישית.",
    url: `${siteConfig.url}/stories`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "סיפורי הצלחה - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "סיפורי הצלחה | הדרך - אומנות הקשר",
    description:
      "סיפורי הצלחה מתלמידי הדרך - שינוי אמיתי בזוגיות, דייטינג וצמיחה אישית.",
    images: ["/images/hero.jpg"],
  },
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
