import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "בלוג | ניהול | הדרך",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
