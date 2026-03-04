import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "קורסים",
  description:
    "גלו את מגוון הקורסים שלנו ללמידת דייטינג וזוגיות. מקורסי התחלה ועד שיפור מיומנויות מתקדמות - כל הכלים לבניית קשר אמיתי.",
  openGraph: {
    title: "קורסים | הדרך - אומנות הקשר",
    description:
      "גלו את מגוון הקורסים שלנו ללמידת דייטינג וזוגיות. מקורסי התחלה ועד שיפור מיומנויות מתקדמות.",
    url: "https://haderech.co.il/courses",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "קורסים - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "קורסים | הדרך - אומנות הקשר",
    description:
      "גלו את מגוון הקורסים שלנו ללמידת דייטינג וזוגיות. מקורסי התחלה ועד שיפור מיומנויות מתקדמות.",
    images: ["/images/hero.jpg"],
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
