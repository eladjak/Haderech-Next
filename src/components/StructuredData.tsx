/**
 * @file StructuredData.tsx
 * @description JSON-LD structured data components for SEO optimization
 * Provides schema.org markup for search engines
 */

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'הדרך',
    url: 'https://haderech.co.il',
    logo: 'https://haderech.co.il/logo.png',
    description: 'פלטפורמת למידה אינטראקטיבית לפיתוח כישורי תקשורת ויחסים אישיים',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IL',
    },
    sameAs: [
      'https://facebook.com/haderech',
      'https://twitter.com/haderech',
      'https://linkedin.com/company/haderech',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'הדרך',
    url: 'https://haderech.co.il',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://haderech.co.il/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
