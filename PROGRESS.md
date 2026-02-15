# הדרך נקסט - מערכת לימודים - התקדמות

## סטטוס: in_progress
## עדכון אחרון: 2026-02-15

## מצב נוכחי
מערכת הלימודים בפיתוח מתקדם. Phase 1 הושלם: כל התשתית הבסיסית + Phase 2 פיצ'רים: מעקב התקדמות, הרשמה לקורסים, סימון שיעורים כהושלמו, מערכת בחנים (quizzes), תעודות סיום, UI משופר עם חיפוש קורסים, דף תעודות, sidebar ניידת בדף הלימוד. TypeScript מתקמפל ללא שגיאות. ESLint עובר (2 אזהרות img בלבד).

## מה בוצע - Phase 1 Core (הושלם)
- [x] Landing page (דף נחיתה עם Hero, features, stats, steps, CTA, footer)
- [x] Auth pages - Clerk sign-in / sign-up
- [x] Courses list page - רשימת קורסים מ-Convex + חיפוש
- [x] Dashboard - אזור אישי עם סטטיסטיקות, קורסים רשומים, תעודות
- [x] Header component עם ניווט desktop + mobile + תעודות
- [x] Middleware - הגנה על נתיבים פרטיים (כולל /certificates)
- [x] Convex schema (courses, lessons, users, enrollments, progress, quizzes, quizQuestions, quizAttempts, certificates)
- [x] Convex functions: courses, lessons, users, progress, enrollments, quizzes, certificates
- [x] Convex _generated stubs (לאפשר compilation ללא Convex backend)
- [x] Course detail page (`/courses/[courseId]`) - עם enrollment, progress tracking, certificates
- [x] Lesson learning page (`/courses/[courseId]/learn`) - sidebar עם progress, mark complete, quiz integration
- [x] Enrollments module (convex/enrollments.ts) - הרשמה/ביטול הרשמה לקורסים
- [x] Mobile responsive header עם hamburger menu
- [x] TypeScript compiles with zero errors
- [x] ESLint passes (2 non-critical img warnings)
- [x] Convex + Clerk auth integration (ConvexProviderWithClerk)
- [x] Seed data module - 3 קורסי דוגמה עם 16 שיעורים + בחנים

## מה בוצע - Phase 2 Features (סשן 2026-02-15)
- [x] **הרשמה לקורסים (Enrollment)** - כפתור הרשמה/ביטול בדף הקורס
- [x] **מעקב התקדמות** - סימון שיעורים כהושלמו + progress bar בסיידבר ובדף הקורס
- [x] **מערכת בחנים (Quizzes)** - Schema + Convex functions + QuizPlayer UI component
  - בוחן עם שאלות רב-ברירה
  - מעבר בין שאלות, ניווט חופשי
  - תצוגת תוצאות עם הסברים
  - ניסיונות חוזרים
  - seed data עם 3 בחנים (אחד לכל קורס)
- [x] **תעודות סיום (Certificates)** - Schema + Convex functions + CertificateCard UI
  - הנפקת תעודה אוטומטית ב-80%+ השלמה
  - מספר תעודה ייחודי
  - דף תעודות (/certificates) עם רשימת כל התעודות
  - תצוגת תעודה בדשבורד
  - אימות תעודה לפי מספר
- [x] **UI Components חדשים:**
  - `ProgressBar` - סרגל התקדמות עם sizes ו-labels
  - `Badge` - תגיות סטטוס (default, success, warning, info)
  - `CourseCard` - כרטיס קורס משופר עם metadata ו-progress
  - `EnrollButton` - כפתור הרשמה עם אישור ביטול
  - `LessonCompleteButton` - כפתור סימון שיעור כהושלם
  - `QuizPlayer` - נגן בחנים מלא (intro, playing, review)
  - `CertificateCard` - תצוגת תעודה מעוצבת
- [x] **דף קורסים משופר** - חיפוש, תוצאות ריקות, CourseCard component
- [x] **דשבורד משופר** - קורסים רשומים, תעודות, קישורים
- [x] **דף נחיתה משופר** - Stats section, How it works, CTA section, footer עם ניווט
- [x] **Mobile UX** - sidebar ניידת (drawer) בדף הלימוד, נגישות משופרת
- [x] **נגישות** - aria-labels, roles, aria-current, aria-expanded, navigation landmarks

## צעדים הבאים
1. **הגדרת Environment Variables** - Clerk keys + Convex URL ב-.env.local
2. **הפעלת `npx convex dev`** - ליצור _generated types אמיתיים ולסנכרן schema
3. **הרצת seed** - לאחר חיבור Convex, ללחוץ על כפתור "צור נתוני דוגמה" בדשבורד
4. **Phase 2 Remaining:** Video player עם מעקב זמן צפייה
5. **Phase 2 Remaining:** Continue where left off - מעבר אוטומטי לשיעור האחרון
6. **Phase 3: Admin panel** - ניהול קורסים, שיעורים, ובחנים
7. **Phase 3: User management** - ניהול משתמשים ותפקידים
8. **Next.js 16 middleware deprecation** - מיגרציה מ-middleware.ts ל-proxy.ts

## החלטות שהתקבלו
- npm (לא bun) - כמתועד ב-CLAUDE.md, bun לא עובד במערכת זו
- Convex _generated stubs - נוצרו ידנית כי אין Convex deployment מוגדר
- `<img>` במקום `next/image` - כי תמונות קורסים מ-URLs חיצוניים שדורשים הגדרת domains
- RTL + Hebrew (Heebo font) מוגדר ב-layout.tsx
- Clerk localization to Hebrew via heIL
- Seed data כ-public mutation (לא internalMutation) כדי שיהיה ניתן להפעיל מהדשבורד
- clearAll כ-internalMutation (בטיחות - רק מקוד שרת)
- Quiz passing score: 60% (ניתן לשינוי per-quiz)
- Certificate threshold: 80% השלמת קורס
- Certificate number format: HD-{timestamp_base36}-{random_4chars}
- SVG icons inline (ללא תלות חיצונית ב-icon library)

## קבצים שנערכו/נוצרו (סשן 2026-02-15)

### Convex Backend (חדש):
- `convex/schema.ts` - UPDATED: added quizzes, quizQuestions, quizAttempts, certificates tables
- `convex/quizzes.ts` - NEW: getByLesson, getQuestions, getLastAttempt, submitAttempt, create
- `convex/certificates.ts` - NEW: getByUserAndCourse, listByUser, verifyByCertificateNumber, issue
- `convex/seed.ts` - UPDATED: added quiz seed data (3 quizzes with 9 questions), updated clearAll
- `convex/_generated/api.d.ts` - UPDATED: added quizzes and certificates modules

### UI Components (חדש):
- `src/components/ui/progress-bar.tsx` - NEW: accessible progress bar component
- `src/components/ui/badge.tsx` - NEW: status badge component
- `src/components/course/course-card.tsx` - NEW: reusable course card with metadata
- `src/components/course/enroll-button.tsx` - NEW: enrollment button with confirm
- `src/components/course/lesson-complete-button.tsx` - NEW: mark lesson complete
- `src/components/quiz/quiz-player.tsx` - NEW: full quiz player (intro, playing, review)
- `src/components/certificate/certificate-card.tsx` - NEW: certificate display card

### Pages (עדכון):
- `src/app/page.tsx` - UPDATED: added stats, how-it-works, CTA sections, improved footer
- `src/app/courses/page.tsx` - UPDATED: search, CourseCard component, improved empty states
- `src/app/courses/[courseId]/page.tsx` - REWRITTEN: enrollment, progress, certificates, badges
- `src/app/courses/[courseId]/learn/page.tsx` - REWRITTEN: progress tracking, mark complete, quiz, mobile sidebar
- `src/app/dashboard/page.tsx` - REWRITTEN: enrolled courses, certificates, improved stats
- `src/app/certificates/page.tsx` - NEW: user certificates page

### Other:
- `src/components/layout/header.tsx` - UPDATED: added certificates link, aria-label
- `src/middleware.ts` - UPDATED: added /certificates to protected routes
- `PROGRESS.md` - UPDATED

## קורסי דוגמה (Seed Data)
### קורס 1: אומנות ההקשבה (6 שיעורים + בוחן)
### קורס 2: תקשורת זוגית מתקדמת (5 שיעורים + בוחן)
### קורס 3: מפתחות לאינטימיות (6 שיעורים + בוחן)

כל בוחן מכיל 3 שאלות רב-ברירה עם הסברים, ציון מעבר 60%.

## Git History
- `1bfdf14` - feat: add seed data with 3 Hebrew courses and improve dashboard UI
- `3136da2` - fix: configure Convex + Clerk auth integration and project setup
- `ef57d26` - feat: add complete learning platform foundation with courses, lessons, auth, and dashboard
- `34694ea` - Initial commit from Create Next App

## Remote
- No remote configured yet. To push: create a GitHub repo and run `git remote add origin <url> && git push -u origin master`

## הערות לסשן הבא
- קרא CLAUDE.md לפני התחלה
- נדרש לחבר Clerk ו-Convex (ראה .env.local.example)
- Next.js 16 מזהיר על middleware deprecation - לשקול מיגרציה ל-proxy
- _generated files הם stubs - `npx convex dev` יחליף אותם באמיתיים
- כלי ה-seed זמין בדשבורד רק במצב פיתוח (NODE_ENV=development)
- לאחר `npx convex dev` - ניתן להפעיל seed מהדשבורד
- בחנים נוצרים רק לשיעור הראשון של כל קורס (ניתן להוסיף עוד דרך admin panel)
- Phase 3 (Admin) עדיין לא התחיל - דורש UI לניהול קורסים, שיעורים ובחנים
