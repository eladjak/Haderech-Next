# הדרך נקסט - מערכת לימודים - התקדמות

## סטטוס: in_progress
## עדכון אחרון: 2026-02-18

## מצב נוכחי
מערכת הלימודים בפיתוח מתקדם. Phase 1-4 הושלמו. Phase 5 הושלם: מערכת Gamification עם לוח מובילים (XP-based), 12 סוגי תגי הישגים עם SVG icons, מערכת streak יומי עם ויזואליזציה שבועית, שיתוף תעודות ברשתות חברתיות (WhatsApp/Twitter/LinkedIn) עם OG image generation, ודף פרופיל סטודנט מלא עם כל הנתונים. TypeScript מתקמפל ללא שגיאות.

## מה בוצע - Phase 1 Core (הושלם)
- [x] Landing page (דף נחיתה עם Hero, features, stats, steps, CTA, footer)
- [x] Auth pages - Clerk sign-in / sign-up
- [x] Courses list page - רשימת קורסים מ-Convex + חיפוש
- [x] Dashboard - אזור אישי עם סטטיסטיקות, קורסים רשומים, תעודות
- [x] Header component עם ניווט desktop + mobile + תעודות
- [x] Middleware - הגנה על נתיבים פרטיים (כולל /certificates, /admin)
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

## מה בוצע - Phase 3 Admin Panel (סשן 2026-02-17)
- [x] **Admin Layout** (`app/admin/layout.tsx`) - Sidebar navigation עם 3 עמודים
  - Sidebar קבועה (desktop) / drawer (mobile) עם hamburger menu
  - ניווט: דשבורד, קורסים, סטודנטים
  - Top bar עם UserButton של Clerk
  - קישור "חזרה לאתר" בתחתית ה-sidebar
  - Active state מודגש בניווט
- [x] **Admin Dashboard** (`app/admin/page.tsx`) - סקירה כללית
  - 4 כרטיסי סטטיסטיקות: סטודנטים, קורסים, ציון ממוצע, אחוז השלמה
  - 2 כרטיסי משנה: סך הרשמות, תעודות שהונפקו
  - רשימת פעילות אחרונה (10 אירועים) - הרשמות ותעודות
  - Mock data + fallback מנתוני Convex אמיתיים
- [x] **Admin Courses** (`app/admin/courses/page.tsx`) - ניהול קורסים
  - טבלת קורסים: שם, תיאור, סטודנטים, ציון ממוצע, סטטוס (מפורסם/טיוטה)
  - כפתור "הוסף קורס" → מודאל יצירה
  - כפתור עריכה → מודאל עריכה (pre-filled)
  - כפתור מחיקה → דיאלוג אישור עם אזהרה
  - טפסים עם: שם, תיאור, URL תמונה, checkbox פרסום
  - Badge component לסטטוס
- [x] **Admin Students** (`app/admin/students/page.tsx`) - ניהול סטודנטים
  - טבלת סטודנטים: שם, אימייל, קורסים רשומים, התקדמות, פעילות אחרונה
  - חיפוש לפי שם או אימייל
  - לחיצה על שורה → פאנל פרטים בצד (detail panel)
  - פאנל פרטים: אווטאר, סטטיסטיקות, תאריך הצטרפות, קורסים עם progress
  - ProgressBar ו-Badge components
- [x] **Convex Admin Module** (`convex/admin.ts`) - Backend functions
  - `listAllCourses` - כל הקורסים (כולל לא מפורסמים)
  - `getEnrollmentCount` - ספירת רשומים לקורס
  - `getStats` - סטטיסטיקות כלליות (סטודנטים, קורסים, הרשמות, תעודות, ממוצעים)
  - `getRecentActivity` - 10 פעילויות אחרונות (הרשמות + תעודות)
  - `listStudents` - סטודנטים עם נתוני הרשמות והתקדמות
  - `createCourse` - יצירת קורס חדש
  - `updateCourse` - עדכון קורס קיים
  - `deleteCourse` - מחיקת קורס + כל הנתונים הקשורים (cascading delete)
- [x] **Updated `_generated/api.d.ts`** - הוספת admin module ל-API types

## מה בוצע - Phase 4 Quiz Enhancement + Analytics (סשן 2026-02-18)
- [x] **Enhanced Quiz System** (`app/quiz/[id]/page.tsx`) - חוויית בוחן משופרת
  - טיימר לכל שאלה (60 שניות ברירת מחדל) עם שעון ויזואלי
  - סרגל התקדמות (progress bar) עם מספר שאלה
  - פידבק מיידי אחרי כל תשובה (נכון/שגוי + הסבר)
  - מעבר אוטומטי כשנגמר הזמן
  - דף תוצאות מסכם עם:
    - עיגול ציון SVG מונפש
    - תשובות נכונות/שגויות
    - זמן כולל שנדרש
    - מספר ניסיון
    - סקירת כל השאלות עם הסברים
  - תמיכה בניסיון חוזר
  - תמיכה בציון הכי טוב / ציון אחרון
- [x] **Convex quizResults Module** (`convex/quizResults.ts`) - Backend מורחב לבחנים
  - `getAttemptsByUserAndQuiz` - כל הניסיונות של משתמש בבוחן
  - `getAttemptsByUserAndCourse` - ניסיונות לפי קורס
  - `getAllAttemptsByUser` - כל הניסיונות של משתמש
  - `getBestScore` - ציון הכי טוב בבוחן
  - `submitEnhancedAttempt` - הגשה עם מדידת זמן
  - `getUserQuizSummary` - סיכום ביצועי בחנים
- [x] **Student Analytics Dashboard** (`app/student/analytics/page.tsx`) - דשבורד אנליטיקס
  - 4 כרטיסי סטטיסטיקות: קורסים, שיעורים, תעודות, ציון ממוצע
  - מעקב Streak (ימים רצופים) - נוכחי, שיא, סך ימים
  - התקדמות בקורסים - progress bar + mini bar chart לכל קורס
  - היסטוריית ציוני בחנים - SVG bar chart + רשימת ניסיונות אחרונים
  - מערכת הישגים (8 תגים): צעד ראשון, תלמיד חרוץ, מצטיין, בוגר, מתמיד, מעמיק, כל הכבוד, חובב למידה
  - כל הגרפים ב-SVG/CSS בלבד (ללא ספריות חיצוניות)
- [x] **Convex Analytics Module** (`convex/analytics.ts`) - Backend לאנליטיקס
  - `getStudentOverview` - סטטיסטיקות כלליות
  - `getCourseProgress` - התקדמות מפורטת בכל קורס
  - `getQuizScoreHistory` - היסטוריית ציונים עם שמות בחנים/קורסים
  - `getLearningStreak` - חישוב streak (ימים רצופים, שיא, סך ימים)
  - `getAchievements` - חישוב הישגים/תגים (8 סוגים)
- [x] **Course Content Viewer** (`app/course/[id]/lesson/[lessonId]/page.tsx`) - צפייה בתוכן שיעור
  - Markdown renderer מובנה (כותרות, bold, italic, code, blockquotes, lists, links)
  - תמיכה ב-YouTube iframe embed (זיהוי אוטומטי של URL)
  - תמיכה בוידאו ישיר (video tag)
  - ניווט prev/next lesson עם שמות
  - כפתור "סימון כהושלם"
  - progress bar של הקורס
  - רשימת שיעורים מתקפלת (collapsible)
  - Breadcrumb ניווט
- [x] **Updated middleware** - הגנה על נתיבים חדשים (/quiz, /student, /course)
- [x] **Updated `_generated/api.d.ts`** - הוספת analytics + quizResults modules

## מה בוצע - Phase 5 Gamification & Social (סשן 2026-02-18)
- [x] **Convex Gamification Module** (`convex/gamification.ts`) - Backend לגיימיפיקציה
  - `getUserXP` - חישוב XP מצטבר (שיעורים, בחנים, תעודות, ימים פעילים)
  - `getLeaderboard` - לוח מובילים (טופ 50 סטודנטים לפי XP)
  - `getUserBadges` - 12 סוגי תגי הישגים עם בדיקת threshold
  - `getDailyStreak` - מעקב streak יומי עם פעילות שבועית
  - `getStudentProfile` - פרופיל סטודנט מלא עם כל הנתונים
  - `getCertificateForSharing` - נתוני תעודה לשיתוף
- [x] **Leaderboard Page** (`app/student/leaderboard/page.tsx`) - לוח מובילים
  - טבלת דירוג עם: מיקום, שם, XP, רמה, שיעורים, תגים
  - מדליות זהב/כסף/ארד ל-3 הראשונים
  - כרטיס "הסטטוס שלי" עם XP progress bar
  - הסבר "איך צוברים XP" עם כל סוגי הניקוד
  - הדגשה של המשתמש הנוכחי בטבלה
- [x] **Achievement Badges System** - 12 סוגי תגים
  - צעד ראשון (הרשמה ראשונה), חוקר (3 הרשמות)
  - תלמיד חרוץ (5 שיעורים), אלוף השיעורים (15 שיעורים)
  - מצטיין (ציון 100), לוחם הבחנים (5 בחנים), אלוף הבחנים (5 מעברים)
  - בוגר (תעודה ראשונה), מלומד (3 תעודות)
  - מתמיד (3 ימים רצופים), שבוע למידה (7 ימים), מסור (30 ימים)
  - כל תג עם SVG icon ייחודי, מצב locked/earned, תאריך השגה
- [x] **Badge Icon Component** (`components/gamification/badge-icon.tsx`)
  - 12 SVG icons ייחודיים: rocket, book, bookOpen, star, sword, trophy, medal, fire, flame, crown, compass, shield
  - BadgeCard component - כרטיס הישג מעוצב
  - StreakDisplay component - ויזואליזציה שבועית של streak
- [x] **Daily Streak System** - מעקב ימי למידה רצופים
  - חישוב streak נוכחי ושיא
  - ויזואליזציה שבועית (7 ימים אחרונים)
  - הודעת מוטיבציה אם לא למדת היום
  - ספירת סך ימי למידה
- [x] **Social Sharing** - שיתוף תעודות
  - כפתור "שתף תעודה" עם dropdown menu
  - שיתוף ב-WhatsApp, Twitter/X, LinkedIn
  - העתקת קישור
  - OG Image generation API route (`app/api/og/route.tsx`)
  - תמונת שיתוף מעוצבת עם שם הסטודנט, קורס, מספר תעודה ותאריך
- [x] **Student Profile Page** (`app/student/profile/page.tsx`)
  - כרטיס פרופיל עם אווטאר, שם, אימייל, תאריך הצטרפות
  - רמה ו-XP עם progress bar לרמה הבאה
  - 4 כרטיסי סטטיסטיקות: קורסים, שיעורים, תעודות, ציון ממוצע
  - תצוגת streak יומי עם ויזואליזציה שבועית
  - כל 12 ההישגים עם progress bar כולל
  - רשימת קורסים עם progress ולינק להמשך
  - רשימת תעודות עם שיתוף חברתי
- [x] **XP & Level System**
  - חישוב XP: שיעור=10, ניסיון בוחן=5, מעבר=15, ציון מושלם=25, תעודה=50, יום פעיל=3
  - נוסחת רמה: level = floor(sqrt(XP/25)) + 1
  - Progress bar לרמה הבאה
- [x] **Updated `_generated/api.d.ts`** - הוספת gamification module

## צעדים הבאים
1. **הגדרת Environment Variables** - Clerk keys + Convex URL ב-.env.local
2. **הפעלת `npx convex dev`** - ליצור _generated types אמיתיים ולסנכרן schema
3. **הרצת seed** - לאחר חיבור Convex, ללחוץ על כפתור "צור נתוני דוגמה" בדשבורד
4. **Phase 2 Remaining:** Video player עם מעקב זמן צפייה
5. **Phase 2 Remaining:** Continue where left off - מעבר אוטומטי לשיעור האחרון
6. **Phase 3 Remaining:** ניהול שיעורים (CRUD) בתוך כל קורס
7. **Phase 3 Remaining:** ניהול בחנים (CRUD) - יצירת/עריכת בחנים ושאלות
8. **Phase 3 Remaining:** Role-based access - בדיקת role=admin לפני גישה לפאנל
9. **Phase 6:** Discussion forum / comments on lessons
10. **Phase 6:** Study groups
11. **Next.js 16 middleware deprecation** - מיגרציה מ-middleware.ts ל-proxy.ts
12. **`next build` requires valid Clerk keys** - Build fails without real `.env.local`

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
- Admin pages use mock data with Convex fallback (no env vars required for development)
- Admin sidebar: fixed on desktop, drawer with overlay on mobile
- deleteCourse performs cascading delete (enrollments, progress, quizzes, questions, attempts, lessons, certificates)
- Enhanced quiz: טיימר 60 שניות ברירת מחדל, פידבק מיידי, auto-advance on timeout
- Analytics charts: SVG/CSS only, no external chart libraries
- Markdown renderer: built-in, supports headings, bold, italic, code, blockquotes, lists, links
- YouTube detection: automatic from URL patterns (youtube.com, youtu.be)
- Achievements: 8 types with earned/locked states
- Streak: counts both lesson progress and quiz attempts as activity
- XP system: calculated from activity (not stored), no schema change needed
- Level formula: level = floor(sqrt(XP/25)) + 1, gives smooth progression
- Badge system: 12 types (enrollment, lessons, quiz, certificate, streak categories)
- OG Image: Next.js Edge runtime, SVG-based, no external font loading
- Social sharing: WhatsApp, Twitter/X, LinkedIn, copy link
- Leaderboard: top 50 users by XP, real-time calculation
- Did NOT modify existing Phase 1-4 files (except api.d.ts stub)

## קבצים שנערכו/נוצרו (סשן 2026-02-18 - Phase 5)

### Convex Backend (חדש):
- `convex/gamification.ts` - NEW: gamification module (6 functions: getUserXP, getLeaderboard, getUserBadges, getDailyStreak, getStudentProfile, getCertificateForSharing)
- `convex/_generated/api.d.ts` - UPDATED: added gamification module

### Pages (חדש):
- `src/app/student/leaderboard/page.tsx` - NEW: leaderboard page with ranking table
- `src/app/student/profile/page.tsx` - NEW: student profile page with badges, streak, courses, certificates
- `src/app/api/og/route.tsx` - NEW: OG image generation API for certificate sharing

### Components (חדש):
- `src/components/gamification/badge-icon.tsx` - NEW: BadgeIcon (12 SVG icons), BadgeCard, StreakDisplay components

## קבצים שנערכו/נוצרו (סשן 2026-02-18 - Phase 4)

### Convex Backend (חדש):
- `convex/quizResults.ts` - NEW: enhanced quiz results module (6 functions)
- `convex/analytics.ts` - NEW: student analytics module (5 functions)
- `convex/_generated/api.d.ts` - UPDATED: added analytics + quizResults modules

### Pages (חדש):
- `src/app/quiz/[id]/page.tsx` - NEW: enhanced quiz taking experience
- `src/app/student/analytics/page.tsx` - NEW: student analytics dashboard
- `src/app/course/[id]/lesson/[lessonId]/page.tsx` - NEW: course content viewer

### Other:
- `src/middleware.ts` - UPDATED: added /quiz, /student, /course to protected routes
- `PROGRESS.md` - UPDATED

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

## קבצים שנערכו/נוצרו (סשן 2026-02-17 - Phase 3 Admin)

### Convex Backend:
- `convex/admin.ts` - NEW: Admin queries + mutations (listAllCourses, getStats, getRecentActivity, listStudents, createCourse, updateCourse, deleteCourse)
- `convex/_generated/api.d.ts` - UPDATED: added admin module import + type

### Admin Pages (חדש):
- `src/app/admin/layout.tsx` - NEW: Admin layout with sidebar navigation (desktop fixed + mobile drawer)
- `src/app/admin/page.tsx` - NEW: Admin dashboard with stats cards + recent activity list
- `src/app/admin/courses/page.tsx` - NEW: Courses table with create/edit modal + delete confirmation
- `src/app/admin/students/page.tsx` - NEW: Students table with search + detail panel

### Other:
- `PROGRESS.md` - UPDATED

## קורסי דוגמה (Seed Data)
### קורס 1: אומנות ההקשבה (6 שיעורים + בוחן)
### קורס 2: תקשורת זוגית מתקדמת (5 שיעורים + בוחן)
### קורס 3: מפתחות לאינטימיות (6 שיעורים + בוחן)

כל בוחן מכיל 3 שאלות רב-ברירה עם הסברים, ציון מעבר 60%.

## Git History
- `b6f1404` - feat: add quizzes, certificates, progress tracking, and enrollment system
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
- `next build` דורש .env.local עם Clerk keys תקינים (pre-existing issue)
- Admin pages עובדים עם mock data כשאין Convex backend
- Admin panel נגיש רק למשתמשים מחוברים (middleware)
- בעתיד: יש להוסיף בדיקת role=admin בכל עמודי ה-admin
