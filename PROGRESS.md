# הדרך נקסט - מערכת לימודים - התקדמות

## סטטוס: in_progress
## עדכון אחרון: 2026-02-14

## מצב נוכחי
מערכת הלימודים בפיתוח פעיל. התשתית הבסיסית הושלמה: דפי נחיתה, קורסים, דשבורד, אימות משתמשים, דף פרטי קורס ודף לימוד שיעור. Convex + Clerk integration תוקן - Provider משתמש ב-ConvexProviderWithClerk לאימות משתמשים. TypeScript מתקמפל ללא שגיאות. נוסף מודול seed עם 3 קורסי דוגמה (16 שיעורים סך הכל) בנושאי תקשורת זוגית. הדשבורד שודרג להציג קורסים מ-Convex עם כלי seed לפיתוח. נדרש לחבר Convex ו-Clerk עם environment variables.

## מה בוצע
- [x] Landing page (דף נחיתה עם Hero, features, footer)
- [x] Auth pages - Clerk sign-in / sign-up
- [x] Courses list page - רשימת קורסים מ-Convex
- [x] Dashboard - אזור אישי עם כרטיסי סטטיסטיקות + תצוגת קורסים
- [x] Header component עם ניווט desktop + mobile
- [x] Middleware - הגנה על נתיבים פרטיים
- [x] Convex schema (courses, lessons, users, enrollments, progress)
- [x] Convex functions: courses, lessons, users, progress, enrollments
- [x] Convex _generated stubs (לאפשר compilation ללא Convex backend)
- [x] Course detail page (`/courses/[courseId]`) - עם breadcrumb, רשימת שיעורים, סטטיסטיקות
- [x] Lesson learning page (`/courses/[courseId]/learn`) - sidebar עם רשימת שיעורים, ניווט בין שיעורים, video placeholder
- [x] Enrollments module (convex/enrollments.ts) - הרשמה/ביטול הרשמה לקורסים
- [x] Mobile responsive header עם hamburger menu
- [x] Fixed lint warnings (unused imports)
- [x] TypeScript compiles with zero errors
- [x] ESLint passes (3 non-critical img warnings only)
- [x] Convex + Clerk auth integration (ConvexProviderWithClerk)
- [x] convex.json configuration file
- [x] .env.local.example with after-auth redirect URLs
- [x] **Seed data module** (convex/seed.ts) - 3 קורסי דוגמה עם 16 שיעורים
- [x] **Dashboard upgraded** - תצוגת קורסים מ-Convex, כלי seed לפיתוח, placeholder images
- [x] **Courses page improved** - placeholder image עבור קורסים ללא תמונה

## צעדים הבאים
1. **הגדרת Environment Variables** - Clerk keys + Convex URL ב-.env.local
2. **הפעלת `npx convex dev`** - ליצור _generated types אמיתיים ולסנכרן schema
3. **הרצת seed** - לאחר חיבור Convex, ללחוץ על כפתור "צור נתוני דוגמה" בדשבורד
4. **אינטגרציית Progress tracking** - חיבור דף הלימוד למעקב התקדמות ב-Convex
5. **דשבורד דינמי** - הצגת קורסים רשומים וסטטיסטיקות אמיתיות מ-Convex
6. **Phase 2: Video player** - נגן וידאו עם מעקב זמן צפייה
7. **Phase 2: Continue where left off** - המשך מהנקודה שנעצרת
8. **Phase 3: Admin panel** - ניהול קורסים ותוכן
9. **Next.js 16 middleware deprecation** - מיגרציה מ-middleware.ts ל-proxy.ts

## החלטות שהתקבלו
- npm (לא bun) - כמתועד ב-CLAUDE.md, bun לא עובד במערכת זו
- Convex _generated stubs - נוצרו ידנית כי אין Convex deployment מוגדר
- `<img>` במקום `next/image` - כי תמונות קורסים מ-URLs חיצוניים שדורשים הגדרת domains
- RTL + Hebrew (Heebo font) מוגדר ב-layout.tsx
- Clerk localization to Hebrew via heIL
- Seed data כ-public mutation (לא internalMutation) כדי שיהיה ניתן להפעיל מהדשבורד
- clearAll כ-internalMutation (בטיחות - רק מקוד שרת)

## קורסי דוגמה שנוצרו (Seed Data)
### קורס 1: אומנות ההקשבה (6 שיעורים)
- מהי הקשבה פעילה? (12 דקות)
- שפת הגוף בהקשבה (14 דקות)
- להקשיב מעבר למילים (15 דקות)
- חסמים להקשבה ואיך להתגבר עליהם (13 דקות)
- שיקוף ותיקוף - כלים מעשיים (16 דקות)
- תרגול מסכם: שיחה מקשיבה (18 דקות)

### קורס 2: תקשורת זוגית מתקדמת (5 שיעורים)
- יסודות התקשורת הזוגית (14 דקות)
- שיחות קשות - איך לפתוח נכון (15 דקות)
- ניהול קונפליקטים בזוגיות (17 דקות)
- תקשורת רגשית - לדבר מהלב (13 דקות)
- הקשבה אמפתית בזוגיות (15 דקות)

### קורס 3: מפתחות לאינטימיות (6 שיעורים)
- מהי אינטימיות אמיתית? (12 דקות)
- בניית ביטחון רגשי (16 דקות)
- פגיעות ככוח - לפתוח את הלב (14 דקות)
- ריטואלים של חיבור (15 דקות)
- התמודדות עם ריחוק רגשי (13 דקות)
- לשמור על הניצוץ לאורך זמן (17 דקות)

## קבצים שנערכו (סשן 2026-02-14)
- `convex/seed.ts` - NEW: seed module with 3 courses and 16 lessons
- `convex/_generated/api.d.ts` - updated to include seed module
- `src/app/dashboard/page.tsx` - upgraded with Convex courses query, seed tool, placeholder images
- `src/app/courses/page.tsx` - added placeholder image for courses without imageUrl
- `PROGRESS.md` - updated with current status

## קבצים שנערכו (סשן 2026-02-13)
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
- כלי ה-seed זמין בדשבורד רק במצב פיתוח (NODE_ENV=development)
- לאחר `npx convex dev` - ניתן להפעיל seed מהדשבורד או מה-Convex dashboard

## Git History
- `3136da2` - fix: configure Convex + Clerk auth integration and project setup
- `ef57d26` - feat: add complete learning platform foundation with courses, lessons, auth, and dashboard
- `34694ea` - Initial commit from Create Next App

## Remote
- No remote configured yet. To push: create a GitHub repo and run `git remote add origin <url> && git push -u origin master`
