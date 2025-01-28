# מפרט טכני - פרויקט "הדרך" 🛠️

## 📋 סקירה כללית
"הדרך" היא פלטפורמת למידה חדשנית המתמקדת בשיפור מערכות יחסים וכישורים חברתיים. המערכת משלבת קורסים אינטראקטיביים, קהילה תומכת, וכלים מעשיים ליישום הנלמד.

## 🎯 מטרות המערכת
1. הנגשת ידע מקצועי בתחום מערכות יחסים
2. יצירת סביבת למידה אינטראקטיבית ותומכת
3. מתן כלים פרקטיים לשיפור מערכות יחסים
4. בניית קהילה תומכת ומעצימה
5. מעקב והערכת התקדמות אישית

## 👥 קהל יעד
- זוגות בתחילת דרכם
- אנשים המחפשים לשפר את מערכות היחסים שלהם
- מטפלים ויועצים זוגיים
- אנשי מקצוע בתחום הטיפול
- מנחי קבוצות וסדנאות

## 🏗️ ארכיטקטורה טכנית

### Frontend
- **Framework**: Next.js 14 עם App Router
- **שפה**: TypeScript
- **סגנון**: Tailwind CSS + shadcn/ui
- **ניהול מצב**: 
  - React Query לניהול מצב שרת
  - Redux Toolkit לניהול מצב לקוח
  - Context API למצבים גלובליים
- **ניתוב**: Next.js App Router
- **טפסים**: React Hook Form + Zod
- **אנימציות**: Framer Motion

### Backend
- **שרת**: Next.js API Routes
- **מסד נתונים**: Supabase (PostgreSQL)
- **אימות**: Supabase Auth
- **קבצים**: Supabase Storage
- **AI**: OpenAI API
- **Edge Functions**: Vercel Edge Runtime

### Database
- **מערכת**: PostgreSQL (via Supabase)
- **אבטחה**: Row Level Security (RLS)
- **עדכונים בזמן אמת**: Supabase Realtime
- **אחסון**: Supabase Storage
- **ביצועים**:
  - Indexing
  - Query Optimization
  - Connection Pooling
  - Materialized Views

## 🔧 פונקציונליות עיקרית

### מערכת משתמשים
1. **הרשמה והתחברות**
   - רישום עם אימייל וסיסמה
   - אימות דו-שלבי
   - שחזור סיסמה
   - פרופיל אישי

2. **ניהול פרופיל**
   - עדכון פרטים אישיים
   - העלאת תמונה
   - הגדרות פרטיות
   - העדפות למידה

### מערכת קורסים
1. **צפייה בקורסים**
   - רשימת קורסים
   - פרטי קורס
   - תצוגת שיעורים
   - חומרי עזר

2. **למידה**
   - צפייה בשיעורים
   - מעקב התקדמות
   - תרגילים ומשימות
   - בחנים ומבחנים

### פורום קהילתי
1. **דיונים**
   - יצירת נושאים
   - תגובות
   - חיפוש
   - תיוג

2. **ניהול תוכן**
   - מודרציה
   - דיווח על תוכן
   - ארכיון
   - סטטיסטיקות

## 🎨 ממשק משתמש

### עיצוב
- עיצוב מודרני ונקי
- תמיכה מלאה בעברית ו-RTL
- רספונסיביות מלאה
- תמיכה במצב חשוך
- נגישות לפי תקן WCAG 2.1

### חוויית משתמש
- ניווט אינטואיטיבי
- טעינה מהירה
- משוב מיידי
- אינטראקציות חלקות

## 🔒 אבטחה ופרטיות

### אבטחת מידע
- HTTPS בכל הדפים
- הצפנת מידע רגיש
- JWT לאימות
- הגנה מפני:
  - CSRF
  - XSS
  - SQL Injection
  - DDoS

### פרטיות
- תאימות GDPR
- מדיניות פרטיות ברורה
- שליטה מלאה בנתונים אישיים
- יכולת ייצוא ומחיקת מידע

## 📊 ניטור ותחזוקה

### ניטור
- Vercel Analytics למדדי ביצועים
- Sentry לניטור שגיאות
- Supabase Dashboard לניטור מסד הנתונים
- התראות אוטומטיות על תקלות

### תחזוקה
- גיבויים אוטומטיים יומיים
- עדכוני אבטחה שוטפים
- ניהול גרסאות מסודר
- תיעוד שינויים

## 📈 מדדי הצלחה
- מספר משתמשים פעילים
- זמן שימוש ממוצע
- שיעור השלמת קורסים
- דירוגי שביעות רצון
- מדדי ביצועים טכניים

## 🚀 תהליך פיתוח

### CI/CD
- GitHub Actions לבדיקות אוטומטיות
- Vercel ל-deployment אוטומטי
- בדיקות אוטומטיות לפני כל deployment
- גרסאות בטא למשתמשים נבחרים

### בדיקות
- Unit Tests
- Integration Tests
- E2E Tests
- Performance Tests
- Security Tests

## 📝 הערות
- המפרט הטכני הזה הוא מסמך חי שמתעדכן באופן שוטף
- כל שינוי משמעותי במערכת צריך להיות מתועד כאן
- יש לשמור על עקביות בין המפרט לבין היישום בפועל 

## 🔌 ממשקי API

### אימות והרשאות
```typescript
/**
 * הרשמת משתמש חדש
 * @route POST /api/auth/register
 */
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

/**
 * התחברות משתמש
 * @route POST /api/auth/login
 */
interface LoginRequest {
  email: string;
  password: string;
}
```

### ניהול משתמשים
```typescript
/**
 * קבלת פרטי משתמש
 * @route GET /api/users/:id
 */
interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
  profile?: UserProfile;
}

/**
 * עדכון פרטי משתמש
 * @route PUT /api/users/:id
 * @auth required
 */
interface UpdateUserRequest {
  fullName?: string;
  avatarUrl?: string;
  profile?: Partial<UserProfile>;
}
```

### ניהול קורסים
```typescript
/**
 * קבלת רשימת קורסים
 * @route GET /api/courses
 * @query page: number
 * @query limit: number
 * @query level?: 'beginner' | 'intermediate' | 'advanced'
 * @query search?: string
 */
interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

/**
 * קבלת פרטי קורס
 * @route GET /api/courses/:id
 */
interface CourseResponse extends Course {
  lessons: Lesson[];
  author: UserResponse;
  rating: number;
  studentsCount: number;
}
```

### ניהול שיעורים
```typescript
/**
 * יצירת שיעור חדש
 * @route POST /api/courses/:courseId/lessons
 * @auth required
 */
interface CreateLessonRequest {
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  duration?: number;
  orderIndex: number;
  isFree?: boolean;
}
```

### פורום ותקשורת
```typescript
/**
 * קבלת רשימת פוסטים
 * @route GET /api/forum/posts
 * @query page: number
 * @query limit: number
 * @query tag?: string
 * @query search?: string
 */
interface PostsResponse {
  posts: ForumPost[];
  total: number;
  page: number;
  limit: number;
}

/**
 * הוספת תגובה
 * @route POST /api/forum/posts/:postId/comments
 * @auth required
 */
interface CreateCommentRequest {
  content: string;
  parentId?: string;
}
```

### מעקב התקדמות
```typescript
/**
 * עדכון התקדמות בשיעור
 * @route POST /api/progress
 * @auth required
 */
interface UpdateProgressRequest {
  courseId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  lastPosition?: number;
}
```

### חיפוש
```typescript
/**
 * חיפוש בכל המערכת
 * @route GET /api/search
 * @query q: string
 * @query type?: 'course' | 'post' | 'user'
 */
interface SearchResponse {
  courses?: Course[];
  posts?: ForumPost[];
  users?: UserResponse[];
  total: number;
}
```

## 📊 ביצועים ואופטימיזציה

### מדדי ביצועים מרכזיים
- **זמני טעינה**:
  - דף ראשי: < 2 שניות
  - דפי תוכן: < 1.5 שניות
  - API Endpoints: < 200ms

- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

### אופטימיזציות
- **Frontend**:
  - Code Splitting
  - Lazy Loading
  - Image Optimization
  - Bundle Size Optimization

- **Backend**:
  - Query Optimization
  - Caching Strategies
  - Connection Pooling
  - Load Balancing

### ניטור וניתוח
- **כלי ניטור**:
  - Vercel Analytics
  - Google Analytics
  - Sentry
  - LogRocket

- **מדדים לניטור**:
  - זמני תגובה
  - שימוש במשאבים
  - שגיאות ותקלות
  - התנהגות משתמשים 

## 🤖 תכונות מתקדמות

### מערכת AI
```typescript
interface AISystem {
  // המלצות תוכן
  async getRecommendations(
    userId: string,
    context: UserContext
  ): Promise<Recommendation[]>;
  
  // עוזר וירטואלי
  async getAssistantResponse(
    query: string,
    history: ChatHistory
  ): Promise<AIResponse>;
  
  // ניתוח התקדמות
  async analyzeProgress(
    userId: string,
    courseId: string
  ): Promise<ProgressAnalysis>;
}
```

### פקודות קוליות
```typescript
interface VoiceSystem {
  // זיהוי פקודות
  async recognizeCommand(
    audioInput: AudioStream
  ): Promise<Command>;
  
  // המרת טקסט לדיבור
  async textToSpeech(
    text: string,
    preferences: VoicePreferences
  ): Promise<Audio>;
  
  // נגישות קולית
  accessibility: {
    screenReader: boolean;
    voiceNavigation: boolean;
    autoCaption: boolean;
  };
}
```

### למידה חברתית
```typescript
interface SocialLearning {
  // קבוצות למידה
  groups: {
    create(): Group;
    join(groupId: string): void;
    share(content: Content): void;
  };
  
  // מנטורינג
  mentoring: {
    findMentor(): Mentor[];
    scheduleMeeting(): Meeting;
    provideFeedback(): Feedback;
  };
  
  // תגמול ומוטיבציה
  rewards: {
    points: PointSystem;
    badges: BadgeSystem;
    achievements: AchievementSystem;
  };
} 