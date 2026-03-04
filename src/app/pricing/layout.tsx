import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מחירים",
  description:
    "בחרו את התוכנית המתאימה לכם. גישה לכל הקורסים, הסימולטור, כלי ה-AI ותמיכת הקהילה. השקעה קטנה לשינוי אמיתי בחיי הדייטינג שלכם.",
  openGraph: {
    title: "מחירים | הדרך - אומנות הקשר",
    description:
      "בחרו את התוכנית המתאימה לכם. גישה לכל הקורסים, הסימולטור וכלי ה-AI.",
    url: "https://haderech.co.il/pricing",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "מחירים - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "מחירים | הדרך - אומנות הקשר",
    description:
      "בחרו את התוכנית המתאימה לכם. גישה לכל הקורסים, הסימולטור וכלי ה-AI.",
    images: ["/images/hero.jpg"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
