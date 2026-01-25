# Performance Optimization Checklist

## Pre-Deployment Verification

### Build & Bundle
- [ ] Run `pnpm run build` successfully
- [ ] Check First Load JS < 200KB for main routes
- [ ] Verify code splitting is working (separate chunks)
- [ ] Run `pnpm run analyze` to review bundle composition

### Lighthouse Audit
- [ ] Performance Score ≥ 95
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Speed Index < 3.4s

### Image Optimization
- [ ] All images use Next.js Image component
- [ ] Images have proper `alt` attributes
- [ ] Images use `loading="lazy"` (except above-the-fold)
- [ ] Critical images use `priority` prop
- [ ] Image sizes are optimized for different viewports

### Font Optimization
- [ ] Fonts use Next.js font optimization
- [ ] Font display strategy is set (swap/optional)
- [ ] Preconnect headers for Google Fonts
- [ ] No flash of unstyled text (FOUT)

### Service Worker
- [ ] Service worker registers successfully
- [ ] Offline page works when disconnected
- [ ] Static assets are cached
- [ ] API responses cached appropriately

### Resource Hints
- [ ] Preconnect to critical origins
- [ ] DNS prefetch for external resources
- [ ] Preload critical resources
- [ ] Prefetch likely next pages

### Code Quality
- [ ] No unused dependencies
- [ ] No console.log in production
- [ ] TypeScript strict mode passing
- [ ] ESLint warnings = 0
- [ ] All tests passing

### Accessibility
- [ ] Lighthouse Accessibility Score ≥ 95
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper heading hierarchy
- [ ] ARIA labels where needed

### SEO
- [ ] Meta tags properly configured
- [ ] OpenGraph tags present
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Structured data implemented

## Performance Metrics Targets

| Metric | Target | Tool |
|--------|--------|------|
| Performance Score | 95-100 | Lighthouse |
| FCP | < 1.8s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| TBT | < 200ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Speed Index | < 3.4s | Lighthouse |
| Initial Load | < 200KB | Build output |
| Time to Interactive | < 3.5s | Lighthouse |

## Quick Commands

```bash
# Build and analyze
pnpm run build
pnpm run analyze

# Run Lighthouse
pnpm run lighthouse

# Type check
pnpm run type-check

# Lint
pnpm run lint:strict

# Full validation
pnpm run validate-all
```

## Common Issues & Fixes

### Issue: Large bundle size
**Fix**:
- Check `pnpm run analyze` output
- Lazy load heavy components
- Review dependencies with `pnpm run depcheck`

### Issue: Poor LCP score
**Fix**:
- Optimize images
- Add preload for critical resources
- Check for render-blocking resources

### Issue: High CLS
**Fix**:
- Add explicit width/height to images
- Reserve space for dynamic content
- Avoid layout shifts on load

### Issue: Service worker not updating
**Fix**:
- Clear cache: `localStorage.clear()` + `caches.delete()`
- Check service worker registration code
- Verify `/sw.js` is accessible

## Monitoring in Production

### Vercel Analytics
- Monitor real user metrics
- Track performance over time
- Identify slow pages

### Custom Performance Monitoring
```tsx
import { usePerformanceObserver } from '@/components/PreloadResources';

function MyApp() {
  usePerformanceObserver(); // Dev only
  return <App />;
}
```

## Continuous Improvement

1. **Weekly**: Review Vercel Analytics
2. **Bi-weekly**: Run Lighthouse on production
3. **Monthly**: Audit dependencies and bundle size
4. **Quarterly**: Review and update optimization strategies

---

**Goal**: Maintain Lighthouse Performance Score of 95-100 consistently across all major pages.
