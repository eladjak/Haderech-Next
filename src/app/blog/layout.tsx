import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "בלוג | הדרך",
  description:
    "מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית מצוות הדרך - אומנות הקשר.",
  openGraph: {
    title: "בלוג | הדרך - אומנות הקשר",
    description:
      "מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית.",
    url: "https://haderech.co.il/blog",
    images: [
      {
        url: "/images/hero.jpg",
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
    images: ["/images/hero.jpg"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
