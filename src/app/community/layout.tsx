import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "קהילה",
  description:
    "הצטרפו לקהילת הדרך - מקום לשאול שאלות, לשתף חוויות ולקבל תמיכה מאנשים שעוברים את אותו המסע. ביחד לומדים טוב יותר.",
  openGraph: {
    title: "קהילה | הדרך - אומנות הקשר",
    description:
      "הצטרפו לקהילת הדרך - שאלו, שתפו ותמכו. ביחד לומדים טוב יותר.",
    url: "https://haderech.co.il/community",
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
      "הצטרפו לקהילת הדרך - שאלו, שתפו ותמכו. ביחד לומדים טוב יותר.",
    images: ["/images/hero.jpg"],
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
