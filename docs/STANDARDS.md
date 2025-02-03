# סטנדרטים ונהלי עבודה - פרויקט "הדרך" 📋

## 🎯 סטנדרט כתיבת קוד

### מבנה פרויקט

```
src/
├── app/             # App Router Routes
├── components/      # React Components
│   ├── ui/         # UI Components (shadcn/ui)
│   ├── forms/      # Form Components
│   └── shared/     # Shared Components
├── lib/            # Utility Functions
├── hooks/          # Custom React Hooks
├── store/          # Redux Store
│   └── slices/     # Redux Slices
├── styles/         # Global Styles
├── types/          # TypeScript Types
└── utils/          # Helper Functions
```

### נהלי כתיבת קוד

1. **שפות ותשתיות**:

   ```typescript
   // שימוש ב-TypeScript בלבד
   const example: string = "דוגמה";

   // שימוש ב-ES6+ Features
   const { prop1, prop2 } = object;
   const newArray = [...oldArray];

   // Async/Await במקום Promises
   async function getData() {
     try {
       const data = await fetchData();
       return data;
     } catch (error) {
       console.error("Error:", error);
       throw error;
     }
   }
   ```

2. **שמות ומזהים**:

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
   ```

3. **תיעוד קוד**:

   ```typescript
   /**
    * תיאור הפונקציה והמטרה שלה
    * @param {string} param1 - תיאור הפרמטר
    * @param {number} param2 - תיאור הפרמטר
    * @returns {Promise<Result>} - תיאור הערך המוחזר
    * @throws {Error} - תיאור השגיאות האפשריות
    */
   ```

4. **טיפול בשגיאות**:
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

## 📝 סטנדרט תיעוד

### תיעוד קוד

1. **תיעוד פונקציות**:

   ````typescript
   /**
    * מחזיר נתוני משתמש לפי מזהה
    *
    * @example
    * ```typescript
    * const user = await getUserById('123');
    * console.log(user.name); // "ישראל ישראלי"
    * ```
    */
   ````

2. **תיעוד קומפוננטות**:
   ````typescript
   /**
    * קומפוננטת כפתור מותאמת אישית
    *
    * @example
    * ```tsx
    * <CustomButton
    *   variant="primary"
    *   onClick={() => console.log('clicked')}
    * >
    *   לחץ כאן
    * </CustomButton>
    * ```
    */
   ````

### תיעוד מסמכים

1. **מבנה מסמך**:

   ```markdown
   # שם המסמך 📑

   ## 📋 סקירה כללית

   תיאור קצר של המסמך ומטרתו

   ## 🎯 מטרות

   - מטרה 1
   - מטרה 2

   ## 📝 פירוט

   תוכן מפורט...
   ```

2. **שימוש באימוג'ים**:
   - 📋 למסמכים ותיעוד
   - 🎯 למטרות ויעדים
   - 🔧 לכלים ותצורה
   - ⚠️ לאזהרות והערות חשובות

## 🧪 סטנדרט בדיקות

### בדיקות יחידה

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

### בדיקות אינטגרציה

```typescript
describe('AuthFlow', () => {
  it('should complete login process', async () => {
    // הכנת הנתונים
    const user = userEvent.setup();

    // רינדור הקומפוננטה
    render(<LoginForm />);

    // ביצוע פעולות
    await user.type(screen.getByLabelText('אימייל'), 'test@example.com');
    await user.type(screen.getByLabelText('סיסמה'), 'password123');
    await user.click(screen.getByRole('button', { name: 'התחבר' }));

    // בדיקת התוצאה
    expect(await screen.findByText('התחברת בהצלחה')).toBeInTheDocument();
  });
});
```

### בדיקות E2E

```typescript
describe("User Journey", () => {
  test("complete course registration", async ({ page }) => {
    // כניסה לאתר
    await page.goto("/");

    // התחברות
    await page.fill("[name=email]", "user@example.com");
    await page.fill("[name=password]", "password123");
    await page.click('button:has-text("התחבר")');

    // הרשמה לקורס
    await page.click("text=קורסים");
    await page.click("text=קורס לדוגמה");
    await page.click('button:has-text("הרשם עכשיו")');

    // וידוא הרשמה
    await expect(page.locator("text=נרשמת בהצלחה")).toBeVisible();
  });
});
```

## 📝 הערות

- יש לעדכן סטנדרטים אלו בהתאם לצרכי הפרויקט
- חשוב לשמור על עקביות בכל הקוד והתיעוד
- יש לבצע Code Review לפי סטנדרטים אלו
- מומלץ להשתמש ב-linters ו-formatters אוטומטיים

# סטנדרטים לפיתוח

## תהליך עבודה

### בדיקות מקומיות לפני דחיפת שינויים

לפני כל דחיפת שינויים לגיטהאב, יש לבצע את הבדיקות הבאות:

1. בדיקות טייפסקריפט:

```bash
npx tsc --noEmit
```

2. בדיקת שימוש בטיפוסים לא בטוחים:

- חיפוש שימוש ב-`any` ו-`unknown`
- וידוא שכל השימושים הכרחיים ומתועדים

3. בדיקת עקביות טיפוסים:

- כל הטיפוסים מוגדרים ב-`src/types/api.ts`
- אין כפילויות או סתירות בטיפוסים
- כל הטיפוסים מתועדים כראוי

4. בדיקת תיעוד:

- תיעוד מעודכן לכל השינויים
- תיעוד API מעודכן
- מסמכי פרויקט מעודכנים

### סגנון קוד

#### טייפסקריפט

- שימוש בטיפוסים מדויקים
- הימנעות משימוש ב-`any` ו-`unknown`
- הגדרת טיפוסים בקובץ מרכזי אחד
- תיעוד ברור של ממשקים וטיפוסים

#### פורמט קוד

- שימוש ב-Prettier
- הגדרות עקביות בכל הפרויקט
- שמירה על מבנה קוד אחיד

#### שמות

- שמות משתנים בקמל קייס
- שמות פונקציות בקמל קייס
- שמות קבצים בקבאב קייס
- שמות טיפוסים בפסקל קייס

### תיעוד

#### תיעוד קוד

- תיעוד JSDoc לכל פונקציה ציבורית
- תיעוד טיפוסים וממשקים
- תיעוד קבצים ומודולים

#### תיעוד API

- תיעוד מלא של כל נקודות הקצה
- דוגמאות לבקשות ותגובות
- תיעוד שגיאות וקודי סטטוס

#### תיעוד פרויקט

- מסמכי ארכיטקטורה מעודכנים
- מדריכי התקנה והפעלה
- תיעוד החלטות ושינויים

### בדיקות

#### בדיקות יחידה

- בדיקות לכל קומפוננטה
- בדיקות לכל שירות
- בדיקות לכל נקודת קצה

#### בדיקות אינטגרציה

- בדיקות בין קומפוננטות
- בדיקות מול בסיס הנתונים
- בדיקות תהליכים מלאים

#### בדיקות קצה לקצה

- בדיקות תרחישי משתמש
- בדיקות ביצועים
- בדיקות אבטחה

### ניהול גרסאות

#### גיט

- מיזוגים רק דרך Pull Request
- בדיקות קוד לפני מיזוג
- תיאור ברור של שינויים

#### גרסאות

- שימוש ב-Semantic Versioning
- תיעוד שינויים ב-CHANGELOG
- תיוג גרסאות בגיט

### אבטחה

#### אימות

- שימוש ב-JWT
- הצפנת סיסמאות
- ניהול הרשאות

#### הצפנה

- HTTPS בכל התקשורת
- הצפנת מידע רגיש
- שמירת מפתחות בסביבה מאובטחת

#### הגנה

- סינון קלט
- מניעת XSS
- מניעת SQL Injection

### ביצועים

#### אופטימיזציה

- מינימום בקשות רשת
- שימוש ב-caching
- אופטימיזציה של תמונות

#### מדדים

- זמני טעינה
- שימוש בזיכרון
- עומס על השרת

#### ניטור

- ניטור שגיאות
- ניטור ביצועים
- ניטור זמינות

### תחזוקה

#### קוד

- ריפקטורינג תקופתי
- עדכון תלויות
- ניקוי קוד מת

#### תיעוד

- עדכון תיעוד
- תחזוקת מדריכים
- תיעוד שינויים

#### תשתית

- גיבויים
- עדכוני אבטחה
- תחזוקת שרתים
