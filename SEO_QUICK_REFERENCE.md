# SEO Quick Reference Guide

## Implementation Status: ✅ COMPLETE

**Target:** Lighthouse SEO Score 100/100
**Date:** 2026-01-25
**Status:** Ready for Deployment

---

## Files Overview

### Created Files (8)

**Components (3):**
1. `/src/components/StructuredData.tsx` - Organization & Website schemas
2. `/src/components/CourseStructuredData.tsx` - Course schema
3. `/src/components/Breadcrumbs.tsx` - Navigation with schema

**Configuration (2):**
4. `/src/app/sitemap.ts` - Dynamic sitemap (hourly updates)
5. `/src/app/robots.ts` - Search engine rules

**Documentation (3):**
6. `/SEO_IMPLEMENTATION.md` - Full implementation guide
7. `/SEO_VALIDATION_CHECKLIST.md` - Testing procedures
8. `/SEO_SUMMARY.md` - Complete overview

### Modified Files (6)

1. `/src/app/layout.tsx` - Enhanced metadata + StructuredData
2. `/src/app/page.tsx` - Homepage SEO
3. `/src/app/courses/page.tsx` - Courses list SEO
4. `/src/app/courses/[id]/page.tsx` - Course detail SEO + Breadcrumbs
5. `/src/app/forum/page.tsx` - Forum SEO
6. `/src/app/about/page.tsx` - About page SEO

---

## Quick Implementation Checklist

### ✅ Completed:
- [x] Comprehensive metadata (title, description, keywords)
- [x] Open Graph tags (Facebook, LinkedIn, WhatsApp)
- [x] Twitter Cards (summary_large_image)
- [x] Canonical URLs (all pages)
- [x] Structured data (4 schema types)
- [x] Dynamic sitemap generation
- [x] Robots.txt configuration
- [x] Breadcrumb navigation
- [x] Multi-language support (he-IL, en-US)
- [x] Mobile-friendly meta tags
- [x] Performance optimizations (DNS prefetch, preconnect)

### 🔲 Required Before Launch:
- [ ] Create `/public/og-image.png` (1200x630px)
- [ ] Create `/public/twitter-image.png` (1200x630px)
- [ ] Create `/public/logo.png`
- [ ] Update Google verification code in layout.tsx
- [ ] Deploy to production
- [ ] Submit sitemap to Google Search Console
- [ ] Run Lighthouse audit

---

## Metadata Structure

### Global (Layout)
```typescript
metadataBase: 'https://haderech.co.il'
title: 'הדרך - פלטפורמת למידה מתקדמת לפיתוח כישורי תקשורת'
template: '%s | הדרך'
```

### Per Page
- Unique title
- Unique description (50-160 chars)
- Open Graph tags
- Canonical URL

---

## Structured Data Schemas

### 1. Organization (Global)
```json
{
  "@type": "EducationalOrganization",
  "name": "הדרך",
  "url": "https://haderech.co.il"
}
```

### 2. WebSite (Global)
```json
{
  "@type": "WebSite",
  "name": "הדרך",
  "potentialAction": {
    "@type": "SearchAction"
  }
}
```

### 3. Course (Per Course)
```json
{
  "@type": "Course",
  "name": "[Course Title]",
  "provider": "הדרך",
  "aggregateRating": {...}
}
```

### 4. Breadcrumb (Per Page)
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

---

## Sitemap Configuration

**URL:** `https://haderech.co.il/sitemap.xml`

**Includes:**
- 8 static pages
- All published courses (dynamic)
- 100 recent forum posts (dynamic)

**Updates:** Every hour (revalidate: 3600)

**Priorities:**
- Homepage: 1.0
- Courses: 0.9
- Forum/Simulator: 0.8
- Course pages: 0.7
- Forum posts: 0.6
- Auth pages: 0.5

---

## Robots.txt Rules

**URL:** `https://haderech.co.il/robots.txt`

**Allowed:**
- All public pages (/)

**Disallowed:**
- /api/
- /admin/
- /_next/
- /auth/callback
- /auth/confirm
- /private/

**Sitemap:** Points to sitemap.xml

---

## Validation URLs

### After Deployment:

1. **Sitemap:** https://haderech.co.il/sitemap.xml
2. **Robots:** https://haderech.co.il/robots.txt
3. **Manifest:** https://haderech.co.il/manifest.json

### Testing Tools:

1. **Lighthouse:** Chrome DevTools > Lighthouse
2. **Rich Results:** https://search.google.com/test/rich-results
3. **Mobile-Friendly:** https://search.google.com/test/mobile-friendly
4. **PageSpeed:** https://pagespeed.web.dev/
5. **OG Tags (FB):** https://developers.facebook.com/tools/debug/
6. **Twitter Cards:** https://cards-dev.twitter.com/validator

---

## Usage Examples

### Add Breadcrumbs:
```tsx
import { Breadcrumbs } from "@/components/Breadcrumbs";

const items = [
  { name: 'דף הבית', url: '/' },
  { name: 'קורסים', url: '/courses' },
  { name: 'שם הקורס', url: '/courses/123' },
];

<Breadcrumbs items={items} />
```

### Add Course Schema:
```tsx
import { CourseStructuredData } from "@/components/CourseStructuredData";

<CourseStructuredData course={courseData} />
```

### Add Page Metadata:
```tsx
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description (50-160 chars)',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    url: 'https://haderech.co.il/page-url',
  },
  alternates: {
    canonical: 'https://haderech.co.il/page-url',
  },
};
```

---

## Expected Results

### Lighthouse Scores:
- **SEO: 100/100** ✅
- Performance: 90+
- Accessibility: 100
- Best Practices: 100

### Search Console (Week 1):
- All pages indexed
- Sitemap processed
- No crawl errors
- Structured data valid

### Social Media:
- Rich previews on Facebook
- Twitter card displays
- LinkedIn preview works
- WhatsApp preview shows image

---

## Troubleshooting

### Sitemap 404?
- Check file exists at `/src/app/sitemap.ts`
- Verify deployment successful
- Clear CDN cache

### Structured Data Not Found?
- Validate JSON syntax
- Check script tags in <head>
- Use Rich Results Test tool

### Social Preview Not Showing?
- Create required images (1200x630px)
- Use absolute URLs for images
- Clear social media cache
- Wait 24 hours for cache update

### Low SEO Score?
- Check meta description exists
- Verify title tag unique
- Ensure images have alt text
- Test mobile-friendliness

---

## Maintenance Schedule

### Daily (Week 1):
- Monitor Search Console
- Check indexing status

### Weekly:
- Run Lighthouse audit
- Review coverage reports

### Monthly:
- Update meta descriptions
- Review keywords
- Check for broken links
- Analyze search queries

---

## Key Metrics to Track

1. **Organic Impressions** - How often site appears in search
2. **Click-Through Rate (CTR)** - Percentage of clicks vs impressions
3. **Average Position** - Ranking in search results
4. **Indexed Pages** - Number of pages in Google's index
5. **Core Web Vitals** - LCP, FID, CLS scores
6. **Structured Data** - Rich results in search

---

## Next Actions

### Pre-Launch:
1. Create social images (og-image.png, twitter-image.png, logo.png)
2. Update Google verification code
3. Deploy to production

### Post-Launch:
4. Verify ownership in Google Search Console
5. Submit sitemap
6. Run Lighthouse audit
7. Test all validation tools

### Week 1:
8. Monitor indexing daily
9. Check for errors
10. Request indexing for key pages

---

## Quick Links

**Documentation:**
- Full Guide: `/SEO_IMPLEMENTATION.md`
- Validation: `/SEO_VALIDATION_CHECKLIST.md`
- Summary: `/SEO_SUMMARY.md`

**Components:**
- Structured Data: `/src/components/StructuredData.tsx`
- Course Schema: `/src/components/CourseStructuredData.tsx`
- Breadcrumbs: `/src/components/Breadcrumbs.tsx`

**Config:**
- Sitemap: `/src/app/sitemap.ts`
- Robots: `/src/app/robots.ts`
- Layout: `/src/app/layout.tsx`

---

## Support Resources

- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Lighthouse SEO](https://web.dev/lighthouse-seo/)

---

**Status: ✅ Ready for Production**
**SEO Score Target: 100/100**
**Last Updated: 2026-01-25**
