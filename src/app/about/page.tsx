import type { Metadata } from "next";
import React from "react";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "אודות הדרך - פלטפורמת למידה מתקדמת",
  description:
    "הדרך היא פלטפורמת למידה מתקדמת לפיתוח מיומנויות בינאישיות. למד עוד על החזון והמטרות שלנו.",
};

export default function Page() {
  return <AboutPage />;
}
