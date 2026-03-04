import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הפגישות שלי | הדרך",
  description:
    "צפו בפגישות הייעוץ שלכם - פגישות קרובות, עבר ודירוגים. נהלו את מסע הליווי האישי שלכם.",
  openGraph: {
    title: "הפגישות שלי | הדרך - אומנות הקשר",
    description:
      "צפו בפגישות הייעוץ שלכם - פגישות קרובות, עבר ודירוגים.",
    url: "https://haderech.co.il/mentoring/sessions",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "הפגישות שלי - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "הפגישות שלי | הדרך - אומנות הקשר",
    description:
      "צפו בפגישות הייעוץ שלכם - פגישות קרובות, עבר ודירוגים.",
    images: ["/images/hero.jpg"],
  },
};

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
