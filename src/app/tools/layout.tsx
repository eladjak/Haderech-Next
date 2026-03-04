import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "כלים",
  description:
    "כלים מעשיים לשיפור חיי הדייטינג שלכם: מחוללי שיחות, בנאי פרופיל, חידון ערכים ועוד. הכלים החינמיים שיעזרו לכם להצליח בדייטינג.",
  openGraph: {
    title: "כלים | הדרך - אומנות הקשר",
    description:
      "כלים מעשיים חינמיים לשיפור חיי הדייטינג: מחוללי שיחות, בנאי פרופיל וחידון ערכים.",
    url: "https://haderech.co.il/tools",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "כלים - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "כלים | הדרך - אומנות הקשר",
    description:
      "כלים מעשיים חינמיים לשיפור חיי הדייטינג: מחוללי שיחות, בנאי פרופיל וחידון ערכים.",
    images: ["/images/hero.jpg"],
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
