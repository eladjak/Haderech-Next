import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "סיפורי משתתפים | הדרך",
  description:
    "עמוד סיפורי המשתתפים נמצא בבדיקת מקור, הרשאה לפרסום והסכמה מפורשת.",
  openGraph: {
    title: "סיפורי משתתפים | הדרך - אומנות הקשר",
    description:
      "סיפורי משתתפים יוצגו רק לאחר אימות מקור והסכמה מפורשת לפרסום.",
    url: `${siteConfig.url}/stories`,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "הדרך - אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "סיפורי משתתפים | הדרך - אומנות הקשר",
    description:
      "סיפורי משתתפים יוצגו רק לאחר אימות מקור והסכמה מפורשת לפרסום.",
    images: ["/images/hero.jpg"],
  },
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
