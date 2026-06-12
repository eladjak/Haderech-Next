# הדרך נקסט - מעקב התקדמות

> **עדכון אחרון:** 2026-06-12 (סשן תוכן אוטונומי — שבת)
> **סטטוס:** Phase 78 הושלם | **83 דפים | 62 מודולי Convex | 239 קבצי קוד | 0 שגיאות TS | 0 `any` types**
> **הישג:** 78 phases - Quality, accessibility & type safety polish

---

## סשן 2026-06-12 — מימוש תוכן הקורס המלא (אוטונומי, שבת)

**הפער שנסגר:** בפרודקשן היו 75 שיעורים של "הדרך - אומנות הקשר" עם מבנה מלא (12 שבועות, 6 שלבים) אבל **0 שיעורים עם תוכן** ו-**0 בחנים**. דף השיעור הציג תיאור בלבד.

### מה נעשה
1. **תוכן מלא ל-75/75 שיעורים בפרודקשן** (~27,200 מילים) — נגזר מכנית מתסריטי הווידאו המקוריים ב-OneDrive (`מסמכי קורס דרך חדשה/תסריטים/`, 77 קבצים) בלי שכתוב AI — הקול של אלעד נשמר 1:1. הוסרו ההערות ההפקתיות (אימוג'י-מספרים, תזמונים, טלפרומפטר) והכותרות הומרו לכותרות-לומד (תרגול מעשי / לסיכום).
2. **12 בחנים שבועיים (48 שאלות)** מעוגנים בתוכן השיעורים, מחוברים לשיעור הסוגר של כל שבוע, ציון מעבר 60. (`convex/seedWeeklyQuizzes.ts`)
3. **תמונת קורס ראשית** — איור flat-vector ע"פ BRAND.md (ורוד-אדום/נייבי/זהב על קרם), Gemini, ללא טקסט → `public/images/courses/haderech-hero.jpg` + מוטציה `seedLessonContent:setCourseImage`.
4. **תיקון באג פרוד:** `/course(.*)` ב-`src/proxy.ts` תפס גם את `/courses` — קטלוג הקורסים הציבורי היה נעול מאחורי auth (404). תוקן ל-`/course/(.*)`.

### קבצים חדשים
- `scripts/build-lesson-content.mjs` — ממיר תסריט→שיעור (עם overrides לסטיות אינדקס בשבועות 5+10, אומתו מול כותרות הפרוד)
- `scripts/push-lesson-content.mjs` — דחיפת תוכן ישירה דרך פונקציות פרוסות (בלי convex deploy)
- `convex/lessonContentData.ts` — קובץ generated, ממופתח לפי scriptIndex
- `convex/seedLessonContent.ts` — `applyLessonContent` (אידמפוטנטי) + `setCourseImage`
- `convex/seedWeeklyQuizzes.ts` — `seedWeeklyQuizzes` (אידמפוטנטי)

### ממצאים לטיפול
- 🔐 **חור אבטחה:** `lessons:update`, `lessons:create`, `quizzes:create` הן מוטציות ציבוריות **בלי בדיקת auth** — כל אחד יכול לערוך שיעורים דרך ה-API הציבורי של Convex. כדאי להעביר ל-`adminLessons`/`requireAdmin` או להפוך ל-internal.
- 📜 תסריט יתום: `שבוע_5/יום_2_סרטון_2_להסכים_לקבל.md` — אין לו שיעור ב-DB (75 שיעורים מול 76 תסריטים פעילים). להחליט: להוסיף כשיעור או להשאיר בחוץ.
- 🔑 Clerk prod keys — עדיין dev instance (פעולת דשבורד של אלעד, ארוז מסשן קודם).
- 🎬 `videoUrl` ריק בכל 75 השיעורים — הסרטונים טרם הופקו; דף השיעור מציג כעת את התוכן המלא כטקסט.

---

## סטטוס פרויקט

| מדד | ערך |
|-----|-----|
| שלבים שהושלמו | 78 |
| דפים/נתיבים | 83 |
| קבצי קוד | 239 |
| קומפוננטות React | 72 |
| מודולי Convex | 62 |
| טבלאות DB | 47 |
| טסטים (E2E + Unit) | 48 |
| שגיאות TypeScript | 0 |
| שיעורים אמיתיים | 64 (51 ראשי + 5 מבוא + 8 דייטינג) |

## סקירה ויזואלית

פתח בדפדפן: `public/dev-status.html`

## Phase 78 - Quality, Accessibility & Type Safety Polish (2026-03-10)

### מה נעשה:
1. **Image Optimization** - הוחלפו כל תגיות `<img>` ל-Next.js `<Image>` (course-card, blog, course detail, community avatar) עם `fill`, `sizes`, ו-auto-optimization
2. **Type Safety** - הוסרו כל 14 שימושי `any` בקוד. נוצרו interfaces: `NormalizedPost`, `CommunityTopicView`, `CommunityReplyView`, `RecentPost`
3. **Error Boundaries** - נוספו error boundaries לנתיבי blog, courses, student (עברית מלאה)
4. **Accessibility** - נוסף `<label>` ל-newsletter email input, שופרה AuthorAvatar עם optional props
5. **Push Notifications Fix** - מימוש שמירת קטגוריות הודעות (היה TODO עם setTimeout) → כעת שומר ב-Convex userPreferences
6. **Console.log Cleanup** - הוסרו console.log מ-service worker registration
7. **Seed Data Update** - שיעור NVC חדש, 3 PDFs נלווים חדשים, תיאורי קורס מעודכנים

### קבצים שנערכו (15):
- `src/components/course/course-card.tsx` - `<img>` → `<Image>`
- `src/components/layout/footer.tsx` - newsletter form label
- `src/app/blog/page.tsx` - NormalizedPost type, `<img>` → `<Image>`
- `src/app/blog/[slug]/page.tsx` - RecentPost type
- `src/app/blog/error.tsx` (חדש)
- `src/app/courses/error.tsx` (חדש)
- `src/app/student/error.tsx` (חדש)
- `src/app/community/page.tsx` - CommunityTopicView type
- `src/app/community/[topicId]/page.tsx` - CommunityReplyView type, `<img>` → `<Image>`
- `src/app/community/forum/page.tsx` - removed `any` types
- `src/app/community/forum/[postId]/page.tsx` - removed `any` types
- `src/app/courses/[courseId]/page.tsx` - `<img>` → `<Image>`
- `src/components/notifications/push-settings.tsx` - implemented category save
- `src/lib/register-sw.ts` - removed console.log
- `convex/seedCourseData.ts` - NVC lesson + PDFs

### Commits: `743b5a8`, `3d1de5c`, `020691b`

## Phase 77 - Production Hardening & Deployment Runbook (2026-03-09)

### מה נעשה:
1. **`vercel.json`** - caching headers (images, fonts, static), SW headers, /healthz rewrite, Permissions-Policy
2. **`next.config.ts`** - YouTube CSP (frame-src, media-src), Permissions-Policy, image/avif+webp, poweredByHeader off, compress, strictMode
3. **`/api/health`** - env checks (Convex/Clerk/APP_URL), uptime counter, degraded status (503), cache headers
4. **VAPID keys** - Generated real key pair, updated usePushNotifications hook + .env.production.example
5. **`convex/seedHaderech.ts`** - Idempotent seed/update/clear mutations for main course
6. **`convex/schema.ts`** - Added lesson metadata: weekNumber, phaseNumber, phaseName, scriptIndex, pdfUrl + by_week index
7. **`convex/seedCourseData.ts`** - New lesson (שפות האהבה), PDF attachments (מכתב סליחה, חוזה מחויבות, שאלון שפות), reordering
8. **`.env.production.example`** - Complete documentation with all vars (VAPID, Stripe, Resend, GA4)
9. **`DEPLOY.md`** - Step-by-step deployment runbook (Convex, Clerk, Vercel, DNS, Stripe, monitoring)
10. **`launch-claude.sh`** - Quick project launch script

### קבצים שנערכו:
- `vercel.json` - Enhanced caching + rewrites
- `next.config.ts` - Security + performance upgrades
- `src/app/api/health/route.ts` - Enhanced health endpoint
- `src/hooks/usePushNotifications.ts` - Real VAPID key
- `.env.production.example` - Complete variable documentation
- `convex/schema.ts` - Lesson metadata fields + index
- `convex/seedCourseData.ts` - New content + PDFs
- `convex/seedHaderech.ts` (חדש) - Seed script
- `DEPLOY.md` (חדש) - Deployment runbook
- `launch-claude.sh` (חדש) - Launch script

### Commit: `c7a5cd0`

## Phase 76 - Production Deployment Prep (2026-03-08)

### מה נעשה:
1. **`src/lib/site-config.ts`** - מקור אמת יחיד ל-URL, קורא מ-`NEXT_PUBLIC_APP_URL`
2. **22 קבצים עודכנו** - כל ה-URLs הקשיחים הוחלפו ב-`siteConfig.url`
3. **`public/manifest.json`** - PWA manifest עם RTL, עברית, צבעי מותג
4. **Security headers** - HSTS + CSP ב-`next.config.ts` (Clerk, Convex, GA4)
5. **`.env.production.example`** - עודכן עם DEMO_MODE

### קבצים שנערכו:
- `src/lib/site-config.ts` (חדש)
- `public/manifest.json` (חדש)
- `public/dev-status.html` (חדש)
- `next.config.ts` - security headers
- `.env.production.example`
- `src/app/layout.tsx` - metadataBase
- `src/app/sitemap.ts` - baseUrl
- `src/app/robots.ts` - sitemap URL
- `src/components/seo/json-ld.tsx` - org URL + logo
- 15 layout.tsx files (about, blog, blog/[slug], chat, community, contact, courses, dashboard, faq, help, mentoring, mentoring/sessions, pricing, resources, settings, simulator, stories, tools)
- `src/app/stories/page.tsx` - sharing URL
- `src/app/blog/[slug]/page.tsx` - 2 sharing URLs
- `src/app/courses/[courseId]/page.tsx` - 2 sharing URLs

## Phases 24-76

| Phase | תיאור | סטטוס |
|-------|--------|-------|
| 24 | Help center, contact, settings | done |
| 25 | Gamification (XP, badges, levels) | done |
| 26 | Course reviews & ratings | done |
| 27 | Admin analytics dashboard | done |
| 28 | Notification system | done |
| 29 | Mentoring & 1-on-1 coaching | done |
| 30 | Social sharing & success stories | done |
| 31 | Blog system (6 Hebrew articles) | done |
| 32 | Landing page enhancement | done |
| 33 | Admin blog management | done |
| 34 | Accessibility polish | done |
| 35 | Deploy preparation | done |
| 36 | Payment scaffolding | done |
| 37 | Video player with tracking | done |
| 38 | Email templates (5 Hebrew) | done |
| 39 | Advanced student dashboard | done |
| 40 | Cron jobs & scheduled tasks | done |
| 41 | E2E tests (Playwright) | done |
| 42 | Onboarding wizard | done |
| 43 | Global search | done |
| 44 | Course certificates | done |
| 45 | FAQ knowledge base | done |
| 46 | Performance optimization | done |
| 47 | User preferences | done |
| 48 | Bookmarks & favorites | done |
| 49 | Activity feed & timeline | done |
| 50 | Admin auto-setup, logos, Sanity blog | done |
| 51 | Logo, design facelift, real course content | done |
| 52 | SEO (meta tags, sitemap, robots, JSON-LD) | done |
| 53 | PWA (manifest, service worker, offline) | done |
| 54 | Analytics (GA4, error tracking, web vitals) | done |
| 55 | Admin content manager + user management | done |
| 56 | Course detail page + lesson player | done |
| 57 | Stripe payment scaffolding | done |
| 58 | Email integration (Resend) | done |
| 59 | Social sharing + dynamic OG images | done |
| 60 | Dashboard learning widgets | done |
| 61 | i18n translation system (Hebrew) | done |
| 62 | Accessibility audit & fixes | done |
| 63 | Final polish (404, loading, error, footer, health) | done |
| 64 | Interactive course quizzes (5 Hebrew quizzes) | done |
| 65 | Enhanced student progress dashboard | done |
| 66 | Community forum (posts, replies, likes) | done |
| 67 | AI Chat Coach enhancements | done |
| 68 | Dating simulator (4 Hebrew scenarios) | done |
| 69 | Resource library (15 Hebrew resources) | done |
| 70 | Dating profile builder wizard | done |
| 71 | Admin analytics & reports dashboard | done |
| 72 | Push notification infrastructure | done |
| 73 | Daily content (tips, quotes, challenges) | done |
| 74 | Advanced gamification (leaderboard, rewards) | done |
| 75 | Course reviews & testimonials page | done |
| 76 | Production deployment prep (URLs, CSP, manifest) | done |
| 77 | Production hardening, VAPID, seed scripts, runbook | done |
| 78 | Quality, accessibility & type safety polish | done |

## מה הלאה (Phase 79+)

1. **Vercel Deploy** - `vercel --prod` + custom domain (ראה DEPLOY.md)
2. **Convex Production** - `npx convex deploy` + seed data
3. **Clerk Production** - Production instance + webhook
4. **Stripe Activation** - Real payment processing with webhooks
5. **Content Seeding** - `npx convex run seedHaderech:seedHaderechCourse`
6. **Lighthouse Audit** - Performance, Core Web Vitals
7. **Monitoring** - Health check alerts, error tracking

## Commits

### סשן קודם (Phases 24-51)
- `77bc866` Phase 24
- `b928083` Phases 25-27
- `5b26662` Phases 28-30
- `0a1ad6d` Phases 31-33
- `f135f47` Phase 34
- `39b43cf` Phases 35-37
- `0eb42c7` Phases 38-40
- `9a1d9cc` Phases 41-43
- `669cfc7` Phases 44-46
- `1de9c66` Phases 47-49
- `c28e58d` Phase 50
- `23fb7cb` Phase 51

### סשן נוכחי (Phases 52-76)
- `7ce989b` Phases 52-54 (SEO, PWA, Analytics)
- `2b02403` Phases 55-57 (Admin, Course Player, Stripe)
- `06ea902` Phases 58-60 (Email, Sharing, Dashboard)
- `3aa90e9` Phases 61-63 (i18n, Accessibility, Polish)
- `965b70f` Phases 64-66 (Quizzes, Dashboard, Forum)
- `c62bab2` Phases 67-69 (Chat Coach, Simulator, Resources)
- `b07333c` Phases 70-72 (Profile Builder, Admin Analytics, Push)
- `06a4541` Phases 73-75 (Daily Content, Gamification, Reviews)
- `c3b2f01` Demo mode
- `b147fa2` Phase 76 (Production Deployment Prep)
- `c7a5cd0` Phase 77 (Production Hardening, Seed Scripts, Deploy Runbook)
- `9c91f4e` Landing page deep update
- `743b5a8` Seed data update (NVC, PDFs)
- `3d1de5c` Phase 78 (Quality, Accessibility, Type Safety)
- `020691b` Phase 78 continued (Image optimization, push settings)
