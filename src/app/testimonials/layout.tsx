import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ביקורות משתתפים | הדרך",
  description:
    "ביקורות פומביות יוצגו רק לאחר אימות השתתפות, מקור והסכמה מפורשת לפרסום.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function TestimonialsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
