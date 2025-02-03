# מדריך תרומה לפרויקט

## 👋 ברוכים הבאים

אנחנו שמחים שבחרת לתרום לפרויקט הדרך! מסמך זה יעזור לך להבין את תהליך התרומה ואת הסטנדרטים שלנו.

## 🚀 איך להתחיל

### 1. הגדרת סביבת פיתוח

```bash
# שיבוט הפרויקט
git clone https://github.com/username/haderech.git

# התקנת תלויות
pnpm install

# הגדרת משתני סביבה
cp .env.example .env.local

# הפעלת הפרויקט
pnpm dev
```

### 2. בדיקת הקוד

```bash
# בדיקת טיפוסים
pnpm type-check

# בדיקת לינטינג
pnpm lint

# הרצת טסטים
pnpm test
```

## 📝 תהליך התרומה

### 1. בחירת משימה

- בדוק את ה-Issues הפתוחים
- בחר משימה שמעניינת אותך
- הודע בתגובה שאתה עובד עליה

### 2. יצירת Branch

```bash
# יצירת branch חדש
git checkout -b feature/your-feature

# עדכון מ-main
git pull origin main
```

### 3. פיתוח

- עקוב אחר הסטנדרטים
- הוסף טסטים מתאימים
- וודא שהכל עובד

### 4. הגשת PR

```bash
# דחיפת השינויים
git add .
git commit -m "תיאור השינויים"
git push origin feature/your-feature

# יצירת PR ב-GitHub
```

## 🎯 סטנדרטים

### 1. קוד

```typescript
// שמות משמעותיים
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// תיעוד ברור
/**
 * מחשב את הסכום הכולל של הפריטים
 * @param items רשימת פריטים
 * @returns הסכום הכולל
 */
```

### 2. Commits

```bash
# פורמט ברור
feat: הוספת תכונה חדשה
fix: תיקון באג בלוגין
docs: עדכון תיעוד
test: הוספת טסטים
```

### 3. PR

- תיאור מפורט
- צילומי מסך אם רלוונטי
- רשימת שינויים
- תיוג מתאים

## 🧪 בדיקות

### 1. Unit Tests

```typescript
describe("calculateTotal", () => {
  it("should calculate total correctly", () => {
    const items = [{ price: 100 }, { price: 200 }];
    expect(calculateTotal(items)).toBe(300);
  });
});
```

### 2. Integration Tests

```typescript
describe('ShoppingCart', () => {
  it('should update total on item add', async () => {
    const { getByText, findByText } = render(<ShoppingCart />);
    await userEvent.click(getByText('הוסף פריט'));
    expect(await findByText('סה"כ: ₪300')).toBeInTheDocument();
  });
});
```

## 📚 תיעוד

### 1. קוד

```typescript
/**
 * רכיב להצגת פריט בעגלת קניות
 * @param item פריט לתצוגה
 * @param onRemove פונקציה להסרת הפריט
 */
const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  // ...
};
```

### 2. API

```typescript
/**
 * מחזיר את פרטי המשתמש
 * @param id מזהה המשתמש
 * @returns פרטי המשתמש
 * @throws אם המשתמש לא נמצא
 */
const getUser = async (id: string): Promise<User> => {
  // ...
};
```

## 🔍 Code Review

### 1. רשימת תיוג

- [ ] הקוד עובר את כל הבדיקות
- [ ] הקוד מפורמט נכון
- [ ] יש טיפוסים מלאים
- [ ] יש תיעוד מספק
- [ ] אין קוד כפול
- [ ] הקוד יעיל
- [ ] יש טיפול בשגיאות

### 2. תהליך

1. בדיקת הקוד
2. הערות בונות
3. אישור השינויים
4. מיזוג ל-main

## 🎨 עיצוב

### 1. UI

```typescript
// שימוש ב-Tailwind
const Button = styled.button`
  @apply bg-blue-500 text-white px-4 py-2 rounded;
  @apply hover:bg-blue-600;
  @apply focus:outline-none focus:ring-2;
`;
```

### 2. UX

- תגובתיות מהירה
- הודעות ברורות
- טעינה חלקה
- נגישות מלאה

## 📈 ביצועים

### 1. אופטימיזציה

```typescript
// שימוש ב-useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(prop);
}, [prop]);

// שימוש ב-useCallback
const handleClick = useCallback(() => {
  doSomething(prop);
}, [prop]);
```

### 2. טעינה

```typescript
// טעינה מושהית
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// טעינה מקדימה
<Link href="/page" prefetch>
  Go to Page
</Link>
```

## 🔒 אבטחה

### 1. אימות קלט

```typescript
// שימוש ב-Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 2. הרשאות

```typescript
// בדיקת הרשאות
const checkPermission = (user: User, action: Action): boolean => {
  return user.permissions.includes(action);
};
```

## 📝 סיכום

תודה על תרומתך! זכור:

- לעקוב אחר הסטנדרטים
- לבדוק את הקוד
- לתעד היטב
- לשתף פעולה
- ליהנות מהתהליך
