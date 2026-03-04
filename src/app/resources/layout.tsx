import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "משאבים",
  description:
    "ספרייה עשירה של מאמרים, מדריכים ותוכן חינמי על דייטינג וזוגיות. למדו מהמומחים וגלו כיצד לשפר את חיי האהבה שלכם.",
  openGraph: {
    title: "משאבים | הדרך - אומנות הקשר",
    description:
      "ספרייה עשירה של מאמרים, מדריכים ותוכן חינמי על דייטינג וזוגיות.",
    url: "https://haderech.co.il/resources",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "משאבים - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "משאבים | הדרך - אומנות הקשר",
    description:
      "ספרייה עשירה של מאמרים, מדריכים ותוכן חינמי על דייטינג וזוגיות.",
    images: ["/images/hero.jpg"],
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
