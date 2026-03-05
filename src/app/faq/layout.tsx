import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "שאלות נפוצות",
  description:
    "תשובות לשאלות הנפוצות ביותר על הדרך - אומנות הקשר. קורסים, כלי AI, סימולטור דייטים, מנויים, פרטיות ועוד.",
  openGraph: {
    title: "שאלות נפוצות | הדרך - אומנות הקשר",
    description:
      "תשובות לשאלות הנפוצות ביותר על הדרך - קורסים, כלי AI, סימולטור דייטים ועוד.",
    url: "https://haderech.ohlove.co.il/faq",
    images: [
      {
        url: "/images/haderech-banner.jpg",
        width: 1200,
        height: 630,
        alt: "שאלות נפוצות - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "שאלות נפוצות | הדרך - אומנות הקשר",
    description:
      "תשובות לשאלות הנפוצות ביותר על הדרך - קורסים, כלי AI, סימולטור דייטים ועוד.",
    images: ["/images/haderech-banner.jpg"],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
