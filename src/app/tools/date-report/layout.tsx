import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "רפלקציה אחרי דייט",
  description:
    "תרגול מקומי ופרטי לבחירת מוקד, התבוננות במה שקרה ובחירת צעד קטן — בלי ניקוד ובלי ניתוח של אדם אחר.",
};

export default function DateReportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
