import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "הדרך | מדריך ללימוד React ו-Next.js",
  description: "דרך מעשית ואפקטיבית ללמוד React ו-Next.js בעברית",
  keywords:
    "זוגיות, מערכות יחסים, לימוד, קורסים, פורום, קהילה, ייעוץ זוגי, תקשורת זוגית",
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">
        ברוכים הבאים להדרך
      </h1>
      <p className="mb-4 text-center text-lg">
        פלטפורמת למידה חדשנית לשיפור מערכות יחסים
      </p>
    </div>
  );
}
