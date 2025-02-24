# HaDerech - Project Architecture Documentation

## Project Overview

HaDerech is a comprehensive learning platform designed to help educators and students with interactive learning tools, simulation environments, and collaborative features. The application is built using modern web technologies and follows a scalable architecture.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **State Management**: React Context API, TanStack Query
- **Authentication**: NextAuth.js, Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API
- **Testing**: Vitest, Jest, Playwright for E2E
- **CI/CD**: GitHub Actions, Vercel deployment

## Project Structure

```
haderech-next/
├── src/                   # Source code
│   ├── app/               # Next.js App Router pages and layouts
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   ├── constants/         # Application constants
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries and utilities
│   ├── locales/           # Internationalization files
│   ├── models/            # Data models
│   ├── providers/         # Service providers
│   ├── services/          # Business logic services
│   ├── store/             # State management
│   ├── styles/            # Global styles
│   ├── tests/             # Test files
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
├── prisma/                # Database schema and migrations
├── tests/                 # Additional tests
├── docs/                  # Documentation
└── supabase/              # Supabase configuration
```

## Core Features

1. **Authentication System**

   - User registration and login
   - Social authentication (Google)
   - Role-based access control

2. **Course Platform**

   - Course creation and management
   - Lesson organization
   - Progress tracking

3. **Simulator**

   - Interactive scenario simulations
   - Feedback and evaluation systems
   - Performance metrics

4. **Forum**

   - Discussion threads
   - Tags and categorization
   - Search functionality

5. **Profile and Progress Tracking**
   - User profile management
   - Achievement system
   - Learning progress visualization

## Development Status

### Completed

- Basic application structure and setup
- Authentication system
- Database schema and integration
- Core API routes for data access
- Simulator foundation
- Basic UI components

### In Progress

- UI/UX improvements across the application
- Enhanced forum functionality
- Scenario simulation engine refinement
- Feedback system enhancements
- Code refactoring and optimization

### Upcoming

- Advanced analytics and reporting
- Expanded course creation tools
- Additional simulation scenarios
- Improved mobile responsiveness
- Performance optimizations

## Architecture Decisions

### Server Components and Client Components

We use React Server Components (RSC) for data fetching and initial rendering, while client components are used for interactive elements. This approach reduces JavaScript bundle size and improves initial load performance.

### Data Flow

1. **API Routes**: Handle data operations and external service integration
2. **Server Actions**: Perform server-side operations securely
3. **Service Layer**: Contains business logic separated from UI
4. **UI Components**: Present data and handle user interactions

### State Management

- **Server State**: Managed through TanStack Query for API data
- **Client State**: Handled through React Context for UI state
- **Form State**: Managed with React Hook Form and Zod validation

### Database Design

- Normalized schema design for efficient data storage
- Supabase RLS (Row Level Security) for data access control
- Strategic denormalization for performance where necessary

## Performance Considerations

- Static generation for content-heavy pages
- Dynamic routes for interactive features
- Image optimization and lazy loading
- Code splitting and bundle optimization
- Server-side rendering for SEO-critical pages

## Security Measures

- Input validation with Zod
- CSRF protection
- Authentication with secure cookie handling
- Content Security Policy implementation
- Rate limiting for API routes
- Environment variable protection

## Deployment Strategy

- CI/CD with GitHub Actions
- Staging and production environments
- Automated testing before deployment
- Database migrations handling
- Monitoring and error tracking

## Future Architecture Considerations

- Microservices approach for specific features
- Edge computing for global performance
- Real-time collaboration features
- Enhanced AI integration
- Offline capabilities

---

<div dir="rtl">

# אדריכלות הפרויקט - הדרך

## סקירת הפרויקט

**הדרך** הינה פלטפורמת למידה מתקדמת המספקת חוויית לימוד אינטראקטיבית ומעשירה. הפלטפורמה כוללת מערכת קורסים, פורום קהילתי, כלי סימולציה, ומעקב התקדמות. האדריכלות תוכננה להיות מודולרית, סקיילבילית ועם ביצועים מהירים.

## סט טכנולוגיות

הפרויקט מבוסס על מספר טכנולוגיות מתקדמות:

- **Next.js 14**: Framework לפיתוח צד שרת וצד לקוח המבוסס על React, עם תמיכה ב-App Router, Server Components, ו-API Routes
- **React 18**: ספריית UI לבניית ממשק משתמש מודרני עם תמיכה ב-React Server Components ו-Suspense
- **TypeScript**: להוספת טיפוסים סטטיים וחוזק בפיתוח
- **Tailwind CSS**: לעיצוב מהיר וגמיש
- **Shadcn UI + Radix UI**: ספריות קומפוננטות נגישות ומתקדמות
- **Supabase**: פלטפורמת Backend-as-a-Service לניהול אימות, בסיס נתונים ואחסון
- **Redux Toolkit**: לניהול מצב האפליקציה
- **OpenAI API**: לשילוב יכולות AI בסימולטור ובפיצ'רים אחרים
- **Jest + Testing Library**: לבדיקות אוטומטיות
- **ESLint + Prettier**: לאכיפת קוד נקי ועקבי

## מבנה הפרויקט

מבנה הפרויקט מאורגן לפי תחומי אחריות:

```
haderech-next/
├── docs/                   # תיעוד פרויקט
├── lib/                    # קוד משותף וספריות
├── public/                 # קבצים סטטיים
├── src/
│   ├── app/                # רכיבי דפים ונתיבי API (Next.js App Router)
│   │   ├── (course)/       # קבוצת נתיבים לקורסים
│   │   ├── api/            # נקודות קצה API
│   │   ├── auth/           # דפי אימות והרשמה
│   │   ├── community/      # דפי קהילה ופורום
│   │   ├── profile/        # דפים לפרופיל משתמש
│   │   └── simulator/      # דפי סימולטור
│   ├── components/         # רכיבי React משותפים
│   │   ├── auth/           # רכיבי אימות
│   │   ├── course/         # רכיבי קורסים
│   │   ├── forum/          # רכיבי פורום
│   │   ├── simulator/      # רכיבי סימולטור
│   │   └── ui/             # רכיבי UI כלליים
│   ├── constants/          # קבועים וערכים מוגדרים מראש
│   ├── hooks/              # React hooks מותאמים
│   ├── lib/                # פונקציות שירות וכלים
│   │   ├── services/       # שירותי אפליקציה
│   │   └── utils/          # פונקציות עזר
│   ├── store/              # Redux store וslices
│   ├── styles/             # קבצי CSS
│   ├── tests/              # בדיקות אוטומטיות
│   └── types/              # הגדרות TypeScript
```

## תכונות מרכזיות

הפרויקט כולל מספר תכונות מרכזיות:

1. **אימות והרשאות**:

   - הרשמה, כניסה, ואיפוס סיסמה באמצעות Supabase
   - הרשאות מבוססות תפקידים לגישה לתוכן

2. **ניהול קורסים**:

   - עיון וחיפוש קורסים
   - הרשמה והתקדמות בקורסים
   - מעקב אחר התקדמות

3. **סימולטור**:

   - סביבת תרגול אינטראקטיבית
   - תרחישי אימון מציאותיים
   - משוב מבוסס AI
   - ניתוח ביצועים

4. **פורום וקהילה**:

   - שיתוף שאלות ותשובות
   - דיונים קהילתיים
   - מערכת תיוג ומועדפים
   - חיפוש ופילטור תוכן

5. **מעקב התקדמות**:
   - מערכת הישגים
   - לוח מובילים
   - סטטיסטיקות משתמש
   - התראות ועדכונים

## סטטוס פיתוח

להלן סטטוס הפיתוח הנוכחי:

### הושלם:

- יסודות אימות משתמשים
- מבנה נתיבי האפליקציה
- מסד נתונים בסיסי
- עיצוב UI ראשוני

### בתהליך:

- פיתוח סימולטור מלא
- שיפור מערכת ניהול קורסים
- פיתוח התראות והודעות
- עדכון פורום הקהילה

### למימוש עתידי:

- שילוב תשלומים ומנויים
- למידה אדפטיבית מבוססת AI
- כלים לניתוח ביצועים מתקדמים
- אפליקציית מובייל

## החלטות אדריכליות

### רכיבי שרת ולקוח

- שימוש ב-React Server Components למרבית הדפים לביצועים מהירים
- שימוש ב-Client Components לאינטראקציות מורכבות
- חלוקה ברורה בין לוגיקת שרת ולקוח

### זרימת נתונים

- שימוש ב-Server Actions לפעולות מאובטחות בצד השרת
- הימנעות מלקיחת נתונים רגישים לצד הלקוח
- ניהול מצב אפליקציה באמצעות Redux לנתונים גלובליים ו-React Context למידע מקומי

### ניהול מצב

- Redux לניהול מצב גלובלי (למשל, נתוני משתמש, נתוני סימולטור)
- React Context למצבים מקומיים (למשל, טפסים, מצב UI)
- Local State לניהול UI ספציפי

### עיצוב בסיס הנתונים

- שימוש בטבלאות Supabase למידע מובנה
- פירוט ממשקי API להתקשורת עם בסיס הנתונים
- ניהול הרשאות פר-טבלה

## שיקולי ביצועים

הפרויקט כולל מספר אסטרטגיות לאופטימיזציה:

- **Server-Side Rendering (SSR)** לטעינה מהירה של דפים
- **React Server Components** להפחתת JavaScript בצד הלקוח
- **Progressive Enhancement** לתמיכה בדפדפנים ומכשירים ישנים
- **Code Splitting** לטעינה מהירה של דפים ספציפיים
- **Image Optimization** באמצעות Next.js Image
- **Edge Caching** לתוכן סטטי או משתנה לעיתים רחוקות

## אמצעי אבטחה

אסטרטגיית האבטחה של הפרויקט כוללת:

- **אימות באמצעות Supabase** עם תמיכה ב-JWT
- **Row-Level Security (RLS)** בבסיס הנתונים
- **Content Security Policy (CSP)** לעיגון מקורות תוכן
- **CSRF Protection** למניעת תקיפות Cross-Site Request Forgery
- **Security Headers** נוספים
- **Input Validation** עם Zod והגנות מפני הזרקת קוד

## אסטרטגיית פריסה

תהליך ה-CI/CD והפריסה כולל:

- **GitHub Actions** לבנייה, בדיקה ופריסה אוטומטית
- **Multiple Environments** (פיתוח, בדיקות, ייצור)
- **Environment Variables** לתצורה מבוססת סביבה
- **Vercel** לפריסה אוטומטית

## שיקולים אדריכליים עתידיים

בעתיד, נשקול להרחיב את האדריכלות כדי לכלול:

- **Microservices** להפרדת היכולות השונות (קורסים, פורום, סימולטור)
- **GraphQL API** לשליפת נתונים יעילה בצד הלקוח
- **Websockets** לעדכונים בזמן אמת ושיתוף פעולה
- **Server-Sent Events** להתראות
- **Internationalization (i18n)** לתמיכה בשפות נוספות
- **Analytics & Monitoring** לניטור ביצועים וחוויית משתמש

## מנגנון הרחבה

הפרויקט תוכנן להיות מרחיב ומודולרי:

- **Plugin Architecture** לתוספות עתידיות
- **API-First Design** לאינטגרציה עם שירותים חיצוניים
- **Theming** לתמיכה בעיצובים מותאמים אישית
- **Feature Flags** לשליטה בתכונות חדשות

</div>
