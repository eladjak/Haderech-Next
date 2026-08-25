import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "רכישה ותשלום אינם זמינים | הדרך",
  description:
    "עמוד סטטוס: המסלולים, המחירים והרכישה המקוונת אינם פתוחים עד להשלמת חוזה המוצר ותשתית התשלום והזכאות.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "סטטוס רכישה | הדרך - אומנות הקשר",
    description:
      "הרכישה המקוונת אינה פעילה כרגע; מחירים ומסלולים ישנים אינם הצעה מאושרת.",
    url: `${siteConfig.url}/pricing`,
    images: [
      {
        url: "/images/haderech-banner.jpg",
        width: 1200,
        height: 630,
        alt: "הדרך - אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "סטטוס רכישה | הדרך - אומנות הקשר",
    description:
      "הרכישה המקוונת אינה פעילה כרגע; מחירים ומסלולים ישנים אינם הצעה מאושרת.",
    images: ["/images/haderech-banner.jpg"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
