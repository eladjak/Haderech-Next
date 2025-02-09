# סטנדרטים והנחיות פרויקט - "הדרך" 📋

## סקירה כללית 📝

הדרך היא פלטפורמת למידה מקיפה הבנויה באמצעות Next.js, המתמקדת במתן חוויה חינוכית אינטראקטיבית ומעניינת באמצעות סימולציות מבוססות AI ואינטראקציה קהילתית. מסמך זה מגדיר את הסטנדרטים, הנהלים והפרקטיקות המומלצות לפיתוח הפרויקט.

## טכנולוגיות ליבה 🛠️

- **Frontend**: Next.js 14 עם App Router
- **UI Components**: Tailwind CSS + shadcn/ui
- **ניהול מצב**: React Hooks + Context + Redux Toolkit
- **בסיס נתונים**: Supabase (PostgreSQL)
- **אימות**: Supabase Auth
- **אינטגרציית AI**: OpenAI GPT-4
- **בדיקות**: Jest, Cypress, Playwright
- **ניטור**: Sentry, PostHog

## סטנדרטים טכניים 🔧

### 1. שפות ופריימוורקים

- TypeScript 5.x
- Next.js 14
- React 18
- Node.js 20 LTS

### 2. מבנה פרויקט

```
src/
├── app/             # דפי האפליקציה (App Router)
├── components/      # קומפוננטות
│   ├── ui/         # קומפוננטות UI בסיסיות (shadcn/ui)
│   ├── forms/      # קומפוננטות טפסים
│   ├── courses/    # קומפוננטות קורסים
│   ├── forum/      # קומפוננטות פורום
│   ├── auth/       # קומפוננטות אותנטיקציה
│   ├── layout/     # קומפוננטות מבנה
│   └── shared/     # קומפוננטות משותפות
├── lib/            # ספריות ופונקציות עזר
├── hooks/          # Custom Hooks
├── types/          # טיפוסי TypeScript
├── utils/          # פונקציות שירות
├── constants/      # קבועים
├── config/         # הגדרות
├── styles/         # סגנונות גלובליים
├── store/          # Redux store וslices
├── providers/      # React context providers
├── services/       # שירותי API
└── locales/        # קבצי תרגום
```

### 3. סגנון קוד

#### שמות ומזהים

```typescript
// קומפוננטות: PascalCase
const UserProfile = () => {...}

// פונקציות ומשתנים: camelCase
const getUserData = () => {...}

// קבועים: UPPER_SNAKE_CASE
const MAX_ITEMS = 100;

// טיפוסים וממשקים: PascalCase
interface UserData {...}
type AuthState = {...}

// קבצים:
// - PascalCase לקומפוננטות
// - camelCase לפונקציות ומודולים
// - kebab-case לסגנונות
// - UPPERCASE לקבועים
```

#### תיעוד קוד

````typescript
/**
 * תיאור הפונקציה והמטרה שלה
 * @param {string} param1 - תיאור הפרמטר
 * @param {number} param2 - תיאור הפרמטר
 * @returns {Promise<T>} - תיאור הערך המוחזר
 * @throws {Error} - תיאור השגיאות האפשריות
 *
 * @example
 * ```typescript
 * const result = await someFunction('test', 123);
 * console.log(result); // { success: true }
 * ```
 */
````

#### טיפול בשגיאות

```typescript
try {
  // קוד שעלול לזרוק שגיאה
  await riskyOperation();
} catch (error) {
  // לוג מפורט
  console.error("Operation failed:", {
    error,
    context: "riskyOperation",
    timestamp: new Date(),
  });
  // זריקת שגיאה מותאמת
  throw new CustomError("Operation failed", { cause: error });
}
```

### 4. ניהול מצב

- Redux Toolkit לניהול מצב גלובלי
- React Query לניהול מצב שרת
- Context API למצבים מקומיים
- Local Storage לנתונים מתמידים

## בדיקות 🧪

### 1. סוגי בדיקות

#### בדיקות יחידה

```typescript
describe('UserComponent', () => {
  it('should render user name correctly', () => {
    const user = { name: 'ישראל' };
    render(<UserComponent user={user} />);
    expect(screen.getByText('ישראל')).toBeInTheDocument();
  });

  it('should handle empty user data', () => {
    render(<UserComponent user={null} />);
    expect(screen.getByText('משתמש לא נמצא')).toBeInTheDocument();
  });
});
```

#### בדיקות אינטגרציה

```typescript
describe('AuthFlow', () => {
  it('should complete login process', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('אימייל'), 'test@example.com');
    await user.type(screen.getByLabelText('סיסמה'), 'password123');
    await user.click(screen.getByRole('button', { name: 'התחבר' }));

    expect(await screen.findByText('התחברת בהצלחה')).toBeInTheDocument();
  });
});
```

#### בדיקות E2E

```typescript
describe("User Journey", () => {
  test("complete course registration", async ({ page }) => {
    await page.goto("/");
    await page.fill("[name=email]", "user@example.com");
    await page.fill("[name=password]", "password123");
    await page.click('button:has-text("התחבר")');
    await page.click("text=קורסים");
    await page.click("text=קורס לדוגמה");
    await page.click('button:has-text("הרשם עכשיו")');
    await expect(page.locator("text=נרשמת בהצלחה")).toBeVisible();
  });
});
```

### 2. כיסוי בדיקות

- מינימום 80% כיסוי
- בדיקות לכל קומפוננטה
- בדיקות לכל שירות
- בדיקות לכל הוק

### 3. בדיקות מקומיות

```bash
# בדיקת טיפוסים
npx tsc --noEmit

# בדיקות יחידה
pnpm test

# בדיקות אינטגרציה
pnpm test:integration

# בדיקות E2E
pnpm test:e2e

# בדיקת לינטינג
pnpm lint
```

## תהליכי עבודה 🔄

### 1. Git

#### ענפים

- `main` - ענף ראשי, יציב
- `develop` - ענף פיתוח
- `feature/*` - פיתוח תכונות
- `bugfix/*` - תיקון באגים
- `release/*` - הכנה לשחרור

#### Commits

- הודעות בעברית
- תיאור ממוקד ותמציתי
- קישור ל-Issue
- שימוש באימוג'י מתאים

### 2. Code Review

#### תהליך

1. יצירת Pull Request
2. סקירה על ידי שני מפתחים
3. בדיקות אוטומטיות
4. מיזוג לאחר אישור

#### קריטריונים

- איכות קוד
- כיסוי בדיקות
- ביצועים
- אבטחה

### 3. CI/CD

#### בדיקות אוטומטיות

- Lint
- Type Check
- Unit Tests
- Build

#### פריסה

- Staging אוטומטי
- Production ידני
- Rollback אוטומטי
- ניטור

## סטנדרטים עיצוביים 🎨

### 1. עיצוב

#### צבעים

- שימוש בפלטה מוגדרת
- משתני CSS
- תמיכה בדארק מוד
- קונטרסט נגיש

#### טיפוגרפיה

- פונט Heebo
- גדלים מוגדרים
- משקלים מוגדרים
- ריווח עקבי

### 2. נגישות

#### סטנדרטים

- WCAG 2.1 AA
- WAI-ARIA
- תמיכה בקורא מסך
- ניווט מקלדת

#### בדיקות

- בדיקות נגישות אוטומטיות
- בדיקות ידניות
- בדיקות עם קורא מסך
- בדיקות קונטרסט

## תיעוד 📝

### 1. תיעוד קוד

#### JSDoc

- תיעוד לכל פונקציה
- תיעוד לכל קומפוננטה
- תיעוד לכל טיפוס
- דוגמאות שימוש

#### README

- הוראות התקנה
- הוראות הרצה
- מבנה פרויקט
- קישורים חשובים

### 2. תיעוד API

#### OpenAPI

- תיעוד לכל נקודת קצה
- סכמות מפורטות
- דוגמאות בקשה ותגובה
- קודי שגיאה

#### Postman

- אוסף בקשות
- סביבות
- בדיקות
- דוגמאות

## ביצועים ⚡

### 1. אופטימיזציה

#### Frontend

- Code Splitting
- Lazy Loading
- Image Optimization
- Bundle Size

#### Backend

- Caching
- Database Indexing
- Query Optimization
- Rate Limiting

### 2. ניטור

#### מדדים

- Core Web Vitals
- Server Response Time
- Error Rate
- User Metrics

#### כלים

- Vercel Analytics
- Sentry
- LogRocket
- Google Analytics

## ארכיטקטורת המערכת 🏗️

### תכונות מרכזיות

#### 1. מערכת למידה

- מסלולי למידה אדפטיביים
- מעקב התקדמות
- מערכת הישגים
- תרגילים אינטראקטיביים
- משוב בזמן אמת

#### 2. מערכת פורום

- יצירה וניהול פוסטים
- תגובות ואינטראקציות
- עדכונים בזמן אמת
- כלי מודרציה
- סינון תוכן

#### 3. סימולטור צ'אט

- תרחישים אינטראקטיביים
- תגובות מבוססות AI
- מעקב התקדמות
- אימון אינטליגנציה רגשית
- משוב בזמן אמת
- ניהול תרחישים

#### 4. עוזר צ'אטבוט

- עזרה מודעת הקשר
- המלצות משאבים
- הכוונת מסלול למידה
- תמיכה מותאמת אישית
- תמיכה רב-לשונית

### ארכיטקטורת רכיבים

#### רכיבי UI

כל רכיבי ה-UI מקיימים את העקרונות הבאים:

- טיפוסים מלאים עם TypeScript
- תיעוד עם הערות JSDoc
- תמיכה ב-RTL
- עיצוב עקבי עם Tailwind
- תאימות נגישות
- ביצועים מותאמים
- כיסוי בדיקות

#### רכיבי למידה

- `Course`: תצוגה וניהול קורס
- `Lesson`: תוכן ואינטראקציה בשיעור
- `Exercise`: תרגילים אינטראקטיביים
- `Progress`: מעקב התקדמות
- `Achievement`: תצוגת הישגים

#### רכיבי פורום

- `ForumPost`: תצוגת פוסט ראשי
- `ForumComment`: טיפול בתגובות
- `CreatePost`: טופס יצירת פוסט
- `Forum`: מכל פורום ראשי
- `Moderation`: כלי מודרציה

## מפת דרכים עתידית 🚀

### 1. שיפורים טכניים

- אינטגרציית GraphQL
- תמיכת PWA
- אפליקציית מובייל
- מצב לא מקוון
- אופטימיזציית ביצועים

### 2. שיפורי תכונות

- שיפור מערכת הלמידה האדפטיבית
- הרחבת יכולות AI
- שיפור חווית משתמש
- הוספת כלי ניתוח מתקדמים
- הרחבת אפשרויות התרגול

## סיכום 📌

הנחיות וסטנדרטים אלו מהווים בסיס לפיתוח איכותי ואחיד. יש לעקוב אחריהם ולעדכן אותם בהתאם לצרכים המשתנים ולמשוב הצוות. חשוב לזכור:

1. עקביות בכל הקוד והתיעוד
2. שימוש ב-linters ו-formatters אוטומטיים
3. ביצוע Code Review לפי הסטנדרטים
4. עדכון מתמיד של הסטנדרטים לפי צרכי הפרויקט
5. שמירה על איכות ומקצועיות
