import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חיובים | ניהול | הדרך",
  description: "ניהול חיובים ומנויים - פאנל ניהול הדרך",
};

export default function AdminBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
