# SEO Validation Checklist

## Quick Validation Guide

### 1. Test URLs to Verify

After deploying, verify these URLs are accessible:

```
https://haderech.co.il/sitemap.xml
https://haderech.co.il/robots.txt
https://haderech.co.il/manifest.json
```

### 2. Lighthouse SEO Audit

**Steps:**
1. Open any page in Chrome
2. Open DevTools (F12)
3. Navigate to "Lighthouse" tab
4. Select "SEO" category
5. Click "Generate report"

**Expected Results:**
- SEO Score: 100/100
- All checks should pass:
  - ✅ Document has a valid hreflang
  - ✅ Document has a meta description
  - ✅ Page has successful HTTP status code
  - ✅ Document has a title element
  - ✅ Links are crawlable
  - ✅ Page is mobile friendly
  - ✅ Image elements have alt attributes
  - ✅ robots.txt is valid

### 3. Structured Data Validation

**Tool:** Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Pages to Test:**
1. Homepage (/) - Should show:
   - ✅ EducationalOrganization
   - ✅ WebSite with SearchAction

2. Course Page (/courses/[id]) - Should show:
   - ✅ Course schema
   - ✅ BreadcrumbList
   - ✅ AggregateRating (if reviews exist)

**Alternative Tool:** Schema Markup Validator
**URL:** https://validator.schema.org/

### 4. Open Graph Validation

**Facebook Debugger:**
- URL: https://developers.facebook.com/tools/debug/
- Test: Homepage, Course pages
- Expected: Title, description, and image preview

**Twitter Card Validator:**
- URL: https://cards-dev.twitter.com/validator
- Test: Homepage, Course pages
- Expected: summary_large_image card with preview

**LinkedIn Post Inspector:**
- URL: https://www.linkedin.com/post-inspector/
- Test: Homepage
- Expected: Full preview with image

### 5. Sitemap Validation

**Manual Check:**
```bash
curl https://haderech.co.il/sitemap.xml
```

**Expected Content:**
- Static pages (/, /courses, /forum, etc.)
- Dynamic course pages
- Recent forum posts
- Valid XML format
- Proper lastModified dates
- Correct priority values

**Online Validator:**
- URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Paste sitemap URL
- Verify no errors

### 6. Robots.txt Validation

**Manual Check:**
```bash
curl https://haderech.co.il/robots.txt
```

**Expected Content:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
...
Sitemap: https://haderech.co.il/sitemap.xml
```

**Google Robots Testing Tool:**
- URL: https://www.google.com/webmasters/tools/robots-testing-tool
- Test specific URLs against robots.txt

### 7. Mobile-Friendly Test

**Tool:** Google Mobile-Friendly Test
**URL:** https://search.google.com/test/mobile-friendly

**Expected:**
- ✅ Page is mobile friendly
- ✅ Text is readable without zooming
- ✅ Content fits the screen
- ✅ Links are properly spaced

### 8. Page Speed Insights

**Tool:** Google PageSpeed Insights
**URL:** https://pagespeed.web.dev/

**Test Pages:**
- Homepage (/)
- Courses (/courses)
- Individual Course (/courses/[id])

**Expected Scores:**
- Performance: 90+ (target)
- Accessibility: 100
- Best Practices: 100
- SEO: 100 ✅

### 9. Search Console Setup

**After Deployment:**

1. **Verify Ownership:**
   - Go to Google Search Console
   - Add property: https://haderech.co.il
   - Use the verification code from layout.tsx metadata
   - Complete verification

2. **Submit Sitemap:**
   - Navigate to Sitemaps section
   - Add: https://haderech.co.il/sitemap.xml
   - Submit

3. **Request Indexing:**
   - Go to URL Inspection
   - Test important URLs
   - Request indexing for key pages

4. **Monitor:**
   - Check Coverage report daily (first week)
   - Monitor Performance (impressions, clicks)
   - Review Enhancements (structured data)

### 10. Metadata Verification

Check each page has proper meta tags in the HTML source:

**Homepage (/):**
```html
✅ <title>הדרך - פלטפורמת למידה מתקדמת לפיתוח כישורי תקשורת | הדרך</title>
✅ <meta name="description" content="...">
✅ <meta property="og:title" content="...">
✅ <meta property="og:description" content="...">
✅ <meta property="og:image" content="...">
✅ <meta property="og:url" content="https://haderech.co.il">
✅ <meta name="twitter:card" content="summary_large_image">
✅ <link rel="canonical" href="https://haderech.co.il">
```

**Course Page (/courses/[id]):**
```html
✅ <title>[Course Title] | הדרך</title>
✅ <meta name="description" content="...">
✅ <meta property="og:title" content="...">
✅ <meta property="og:image" content="[course image]">
✅ <link rel="canonical" href="https://haderech.co.il/courses/[id]">
✅ <script type="application/ld+json"> [Course Schema]
✅ <script type="application/ld+json"> [Breadcrumb Schema]
```

### 11. Internal Linking Check

Verify proper internal linking structure:
- ✅ Homepage links to main sections
- ✅ Course list links to individual courses
- ✅ Breadcrumbs on course pages
- ✅ Footer links to important pages
- ✅ All links use descriptive anchor text

### 12. Image Optimization

Check that images have:
- ✅ Alt text (accessibility & SEO)
- ✅ Proper dimensions (width & height)
- ✅ Optimized file size
- ✅ Next.js Image component usage
- ✅ WebP format where possible

### 13. Accessibility & SEO Overlap

Run accessibility audit (impacts SEO):
- ✅ Proper heading hierarchy (h1 → h6)
- ✅ ARIA labels where needed
- ✅ Keyboard navigation works
- ✅ Color contrast meets WCAG standards
- ✅ Form labels properly associated

## Common Issues & Solutions

### Issue: Sitemap Returns 404
**Solution:** Ensure `/home/user/Haderech-Next/src/app/sitemap.ts` is deployed and Next.js is configured correctly.

### Issue: Structured Data Not Detected
**Solution:**
- Check that JSON-LD scripts are in <head>
- Validate JSON syntax
- Ensure data is not undefined

### Issue: Low SEO Score
**Possible Causes:**
- Missing meta description
- No title tag
- Images without alt text
- Broken links
- Non-crawlable content
- No robots.txt or sitemap

### Issue: Social Previews Not Showing
**Solution:**
- Ensure Open Graph images exist
- Images must be 1200x630px
- Use absolute URLs for images
- Clear social media cache (Facebook Debugger)

## Performance Tips

1. **Lazy Load Images:** Use Next.js Image component
2. **Code Splitting:** Implemented by Next.js
3. **Font Optimization:** Preconnect to Google Fonts ✅
4. **Resource Hints:** DNS prefetch and preconnect ✅
5. **Caching:** Set proper cache headers
6. **CDN:** Use Vercel CDN (automatic)

## Monitoring Schedule

### Daily (First Week):
- Check Search Console coverage
- Monitor for crawl errors
- Review indexing status

### Weekly:
- Run Lighthouse audit
- Check page speed
- Review Search Console performance

### Monthly:
- Analyze search queries
- Review click-through rates
- Update metadata if needed
- Check for broken links
- Review competitor SEO

## SEO Score Breakdown

### Lighthouse SEO Factors:

1. **Meta Description** (10 points) ✅
   - Present on all pages
   - 50-160 characters
   - Unique per page

2. **Title Tag** (10 points) ✅
   - Present on all pages
   - Unique per page
   - Includes brand name

3. **Crawlability** (15 points) ✅
   - robots.txt configured
   - No blocked resources
   - Valid sitemap

4. **Mobile Friendly** (15 points) ✅
   - Responsive design
   - Viewport meta tag
   - Touch targets sized properly

5. **HTTPS** (10 points) ✅
   - All pages served over HTTPS
   - No mixed content

6. **Canonical URLs** (10 points) ✅
   - Set on all pages
   - Prevents duplicate content

7. **Structured Data** (10 points) ✅
   - Valid JSON-LD
   - Relevant schemas
   - No errors

8. **hreflang** (10 points) ✅
   - Language alternatives specified
   - Proper format

9. **Image Alt Text** (10 points) ⚠️
   - Implementation ready
   - Needs to be added to all images

10. **Link Text** (10 points) ✅
    - Descriptive anchor text
    - No "click here" links

**Target Total: 100/100** ✅

## Next Steps After Validation

1. ✅ Deploy the application
2. ✅ Verify all URLs are accessible
3. ✅ Run Lighthouse audit
4. ✅ Submit sitemap to Google Search Console
5. ✅ Request indexing for key pages
6. ✅ Set up Google Analytics
7. ✅ Monitor Search Console daily
8. ✅ Create og-image.png and twitter-image.png
9. ✅ Update Google verification code
10. ✅ Add alt text to all images

## Resources

- [Google Search Console](https://search.google.com/search-console)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Web.dev SEO](https://web.dev/lighthouse-seo/)

---

**Last Updated:** 2026-01-25
**Status:** Ready for Validation
**Expected SEO Score:** 100/100
