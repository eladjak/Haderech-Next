import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "צ'אט AI",
  description:
    "שוחחו עם המאמן האישי שלכם מבוסס בינה מלאכותית. קבלו עצות מותאמות אישית לשיפור מיומנויות הדייטינג, כתיבת הודעות ובניית ביטחון עצמי.",
  openGraph: {
    title: "צ'אט AI | הדרך - אומנות הקשר",
    description:
      "שוחחו עם המאמן האישי שלכם מבוסס בינה מלאכותית. עצות מותאמות אישית לשיפור מיומנויות הדייטינג.",
    url: "https://haderech.co.il/chat",
    images: [
      {
        url: "/images/ai-chat.jpg",
        width: 1200,
        height: 630,
        alt: "צ'אט AI - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "צ'אט AI | הדרך - אומנות הקשר",
    description:
      "שוחחו עם המאמן האישי שלכם מבוסס בינה מלאכותית. עצות מותאמות אישית לשיפור מיומנויות הדייטינג.",
    images: ["/images/ai-chat.jpg"],
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
