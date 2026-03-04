import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הישגים | הדרך",
  description: "הישגים, תגים ומעקב התקדמות במערכת הלימודים של הדרך",
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
