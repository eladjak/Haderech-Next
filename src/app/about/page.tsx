import type { Metadata } from "next";
import React from "react";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "אודות הדרך - פלטפורמת למידה מתקדמת",
  description:
    "הדרך היא פלטפורמת למידה מתקדמת לפיתוח מיומנויות בינאישיות, כישורי תקשורת ויחסים אישיים. למד עוד על החזון, המטרות והצוות שלנו.",
  openGraph: {
    title: "אודות הדרך",
    description: "פלטפורמת למידה מתקדמת לפיתוח מיומנויות בינאישיות וכישורי תקשורת",
    url: "https://haderech.co.il/about",
    type: "website",
  },
  alternates: {
    canonical: "https://haderech.co.il/about",
  },
};

export default function Page() {
  return <AboutPage />;
}
