import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "כלי AI לתרגול",
  description:
    "כלי AI בעברית לתרגול חשיבה ושיחות על היכרות ותקשורת. התשובות עלולות להיות שגויות ואינן תחליף לטיפול, לייעוץ מקצועי או לשיקול דעתכם.",
  alternates: { canonical: "/chat" },
  openGraph: {
    title: "כלי AI לתרגול | הדרך - אומנות הקשר",
    description:
      "כלי AI בעברית לתרגול חשיבה ושיחות. התשובות עלולות לטעות ואינן ייעוץ מקצועי.",
    url: `${siteConfig.url}/chat`,
    images: [
      {
        url: "/images/ai-chat.jpg",
        width: 1200,
        height: 630,
        alt: "כלי AI לתרגול - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "כלי AI לתרגול | הדרך - אומנות הקשר",
    description:
      "כלי AI בעברית לתרגול חשיבה ושיחות. התשובות עלולות לטעות ואינן ייעוץ מקצועי.",
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
