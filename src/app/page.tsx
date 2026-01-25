import type { Metadata } from "next";
import React from "react";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "הדרך - פלטפורמת למידה מתקדמת לפיתוח כישורי תקשורת",
  description:
    "פלטפורמת למידה חדשנית לשיפור מערכות יחסים וכישורי תקשורת. קורסים מותאמים אישית, סימולטורים אינטראקטיביים, וקהילה תומכת.",
  keywords:
    "זוגיות, מערכות יחסים, לימוד, קורסים, פורום, קהילה, ייעוץ זוגי, תקשורת זוגית, כישורי תקשורת, יחסים אישיים",
  openGraph: {
    title: "הדרך - פלטפורמת למידה מתקדמת",
    description: "פלטפורמת למידה חדשנית לשיפור מערכות יחסים וכישורי תקשורת",
    url: "https://haderech.co.il",
    type: "website",
  },
  alternates: {
    canonical: "https://haderech.co.il",
  },
};

export default function Page() {
  return <HomePage />;
}
