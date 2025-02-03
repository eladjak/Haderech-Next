import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  keywords: string[];
}

export function constructMetadata({
  title,
  description,
  keywords,
}: SEOProps): Metadata {
  return {
    title: `${title} | הדרך`,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title: `${title} | הדרך`,
      description,
      siteName: "הדרך",
      locale: "he_IL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | הדרך`,
      description,
    },
    metadataBase: new URL("https://haderech.co.il"),
  };
}
