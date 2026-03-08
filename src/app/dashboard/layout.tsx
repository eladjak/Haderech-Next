import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "לוח בקרה",
  description: "לוח הבקרה האישי שלכם - עקבו אחר ההתקדמות, המשיכו קורסים והגיעו לכל הכלים במקום אחד.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "לוח בקרה | הדרך - אומנות הקשר",
    description: "לוח הבקרה האישי שלכם - עקבו אחר ההתקדמות והמשיכו ללמוד.",
    url: `${siteConfig.url}/dashboard`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "לוח בקרה - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "לוח בקרה | הדרך - אומנות הקשר",
    description: "לוח הבקרה האישי שלכם - עקבו אחר ההתקדמות והמשיכו ללמוד.",
    images: ["/images/hero.jpg"],
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
