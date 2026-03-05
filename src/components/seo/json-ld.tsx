export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "הדרך - אומנות הקשר",
    description: "תוכנית 12 שבועות לזוגיות",
    url: "https://haderech.ohlove.co.il",
    logo: "https://haderech.ohlove.co.il/images/haderech-logo-square.jpg",
    sameAs: ["https://ohlove.co.il"],
    offers: {
      "@type": "Offer",
      category: "Online Course",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CourseJsonLd({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    provider: {
      "@type": "Organization",
      name: "אומנות הקשר",
      url: "https://ohlove.co.il",
    },
    inLanguage: "he",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
