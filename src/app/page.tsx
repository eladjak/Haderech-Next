import type { Metadata } from "next";
import React from "react";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "הדרך - פלטפורמת למידה מתקדמת",
  description:
    "פלטפורמת למידה חדשנית לשיפור מערכות יחסים. קורסים מותאמים אישית, תרחישי תרגול, וקהילה תומכת.",
  keywords:
    "זוגיות, מערכות יחסים, לימוד, קורסים, פורום, קהילה, ייעוץ זוגי, תקשורת זוגית",
};

export default function Page() {
  return <HomePage />;
}
