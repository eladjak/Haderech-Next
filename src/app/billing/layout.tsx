import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חיוב ומנוי | הדרך",
  description: "ניהול המנוי והחיוב שלך בהדרך",
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
