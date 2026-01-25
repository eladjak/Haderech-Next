/**
 * @file CourseStructuredData.tsx
 * @description Course-specific structured data for SEO
 * Implements schema.org Course markup for individual course pages
 */

interface CourseData {
  id: string;
  title: string;
  description: string;
  duration?: number;
  price?: number;
  image_url?: string;
  level?: string;
  ratings?: Array<{ rating: number }>;
  averageRating?: number;
  updated_at?: string;
}

interface CourseStructuredDataProps {
  course: CourseData;
}

export function CourseStructuredData({ course }: CourseStructuredDataProps) {
  // Calculate average rating if ratings exist
  const averageRating = course.averageRating ||
    (course.ratings && course.ratings.length > 0
      ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
      : undefined);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'הדרך',
      url: 'https://haderech.co.il',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration ? `PT${course.duration}H` : undefined,
    },
    image: course.image_url,
    offers: course.price !== undefined ? {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'ILS',
      availability: 'https://schema.org/InStock',
    } : undefined,
    aggregateRating: averageRating && course.ratings && course.ratings.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: course.ratings.length,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    educationalLevel: course.level,
    inLanguage: 'he',
    dateModified: course.updated_at,
  };

  // Remove undefined properties
  const cleanedSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedSchema) }}
    />
  );
}
