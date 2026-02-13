# הדרך נקסט - מערכת לימודים - התקדמות

## סטטוס: in_progress
## עדכון אחרון: 2026-02-13

## מצב נוכחי
מערכת הלימודים בפיתוח פעיל. התשתית הבסיסית הושלמה: דפי נחיתה, קורסים, דשבורד, אימות משתמשים, דף פרטי קורס ודף לימוד שיעור. Convex + Clerk integration תוקן - Provider משתמש ב-ConvexProviderWithClerk לאימות משתמשים. TypeScript מתקמפל ללא שגיאות. נדרש לחבר Convex ו-Clerk עם environment variables.

## מה בוצע
- [x] Landing page (דף נחיתה עם Hero, features, footer)
- [x] Auth pages - Clerk sign-in / sign-up
- [x] Courses list page - רשימת קורסים מ-Convex
- [x] Dashboard - אזור אישי עם כרטיסי סטטיסטיקות
- [x] Header component עם ניווט desktop + mobile
- [x] Middleware - הגנה על נתיבים פרטיים
- [x] Convex schema (courses, lessons, users, enrollments, progress)
- [x] Convex functions: courses, lessons, users, progress
- [x] Convex _generated stubs (לאפשר compilation ללא Convex backend)
- [x] Course detail page (`/courses/[courseId]`) - עם breadcrumb, רשימת שיעורים, סטטיסטיקות
- [x] Lesson learning page (`/courses/[courseId]/learn`) - sidebar עם רשימת שיעורים, ניווט בין שיעורים, video placeholder
- [x] Enrollments module (convex/enrollments.ts) - הרשמה/ביטול הרשמה לקורסים
- [x] Mobile responsive header עם hamburger menu
- [x] Fixed lint warnings (unused imports)
- [x] TypeScript compiles with zero errors
- [x] ESLint passes (2 non-critical img warnings only)
- [x] Convex + Clerk auth integration (ConvexProviderWithClerk)
- [x] convex.json configuration file
- [x] .env.local.example with after-auth redirect URLs

## צעדים הבאים
1. **הגדרת Environment Variables** - Clerk keys + Convex URL ב-.env.local
2. **הפעלת `npx convex dev`** - ליצור _generated types אמיתיים ולסנכרן schema
3. **אינטגרציית Progress tracking** - חיבור דף הלימוד למעקב התקדמות ב-Convex
4. **דשבורד דינמי** - הצגת קורסים רשומים וסטטיסטיקות אמיתיות מ-Convex
5. **Phase 2: Video player** - נגן וידאו עם מעקב זמן צפייה
6. **Phase 2: Continue where left off** - המשך מהנקודה שנעצרת
7. **Phase 3: Admin panel** - ניהול קורסים ותוכן
8. **Next.js 16 middleware deprecation** - מיגרציה מ-middleware.ts ל-proxy.ts

## החלטות שהתקבלו
- npm (לא bun) - כמתועד ב-CLAUDE.md, bun לא עובד במערכת זו
- Convex _generated stubs - נוצרו ידנית כי אין Convex deployment מוגדר
- `<img>` במקום `next/image` - כי תמונות קורסים מ-URLs חיצוניים שדורשים הגדרת domains
- RTL + Hebrew (Heebo font) מוגדר ב-layout.tsx
- Clerk localization to Hebrew via heIL

## קבצים שנערכו (סשן אחרון 2026-02-13)
- `src/components/providers/convex-provider.tsx` - switched from ConvexProvider to ConvexProviderWithClerk for authenticated Convex queries
- `convex.json` - NEW: Convex CLI configuration
- `.env.local.example` - added after-auth redirect URLs and comments
- `PROGRESS.md` - updated with current status

## קבצים שנערכו (סשן קודם 2026-02-13)
- `convex/_generated/dataModel.d.ts` - NEW: stub types for data model
- `convex/_generated/server.d.ts` - NEW: typed query/mutation/action stubs
- `convex/_generated/server.js` - NEW: generic query/mutation/action exports
- `convex/_generated/api.d.ts` - NEW: typed API with all modules
- `convex/_generated/api.js` - NEW: anyApi export
- `convex/enrollments.ts` - NEW: enrollment functions (enroll, unenroll, isEnrolled, listByUser)
- `convex/users.ts` - removed unused `mutation` import
- `src/app/courses/page.tsx` - fixed import path to use @/ alias
- `src/app/courses/[courseId]/page.tsx` - NEW: course detail page
- `src/app/courses/[courseId]/learn/page.tsx` - NEW: lesson learning page with sidebar
- `src/app/dashboard/page.tsx` - enhanced with CTA link to courses, achievements section
- `src/components/layout/header.tsx` - added mobile hamburger menu
- `src/middleware.ts` - removed unused isPublicRoute variable

## הערות לסשן הבא
- קרא CLAUDE.md לפני התחלה
- נדרש לחבר Clerk ו-Convex (ראה .env.local.example)
- Next.js 16 מזהיר על middleware deprecation - לשקול מיגרציה ל-proxy
- _generated files הם stubs - `npx convex dev` יחליף אותם באמיתיים

## Git History
- `ef57d26` - feat: add complete learning platform foundation with courses, lessons, auth, and dashboard (27 files, +2543/-80)
- `34694ea` - Initial commit from Create Next App

## Remote
- No remote configured yet. To push: create a GitHub repo and run `git remote add origin <url> && git push -u origin master`
