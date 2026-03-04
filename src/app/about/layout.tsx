import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "אודות",
  description:
    "הכירו את הדרך - אומנות הקשר. הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית. הסיפור שלנו, הערכים שלנו והמשימה שלנו.",
  openGraph: {
    title: "אודות | הדרך - אומנות הקשר",
    description:
      "הכירו את הדרך - הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית.",
    url: "https://haderech.co.il/about",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "אודות - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "אודות | הדרך - אומנות הקשר",
    description:
      "הכירו את הדרך - הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית.",
    images: ["/images/hero.jpg"],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
