# הנחיות לסקירת קוד - HaDerech Next 👀

## מטרות סקירת קוד 🎯

### 1. איכות קוד

- בדיקת איכות הקוד
- זיהוי באגים פוטנציאליים
- שיפור ביצועים
- שמירה על סטנדרטים

### 2. שיתוף ידע

- למידה הדדית
- שיתוף פתרונות
- העברת ידע
- שיפור מיומנויות

## רשימת תיוג לסקירה ✅

### 1. כללי

- [ ] הקוד עומד בסטנדרטים
- [ ] התיעוד מעודכן
- [ ] יש בדיקות מתאימות
- [ ] הקוד קריא ומובן
- [ ] אין קוד כפול

### 2. פונקציונליות

- [ ] הקוד מבצע את המשימה
- [ ] טיפול בשגיאות
- [ ] תנאי קצה מטופלים
- [ ] ביצועים סבירים
- [ ] אבטחה נשמרת

### 3. תחזוקתיות

- [ ] הקוד מודולרי
- [ ] שמות משמעותיים
- [ ] אין קוד מת
- [ ] תלויות מעודכנות
- [ ] לוגיקה ברורה

## דוגמאות לסקירה 📝

### 1. טיפוסים

```typescript
// ❌ לא טוב
function getData(id) {
  return fetch(`/api/data/${id}`);
}

// ✅ טוב
async function getData(id: string): Promise<Data> {
  const response = await fetch(`/api/data/${id}`);
  if (!response.ok) {
    throw new APIError("Failed to fetch data");
  }
  return response.json();
}
```

### 2. טיפול בשגיאות

```typescript
// ❌ לא טוב
try {
  await saveData(data);
} catch (error) {
  console.log(error);
}

// ✅ טוב
try {
  await saveData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    toast.error("נתונים לא תקינים");
  } else if (error instanceof NetworkError) {
    toast.error("בעיית תקשורת");
  } else {
    logger.error(error);
    toast.error("שגיאה לא צפויה");
  }
}
```

### 3. ביצועים

```typescript
// ❌ לא טוב
const data = users.map((user) => {
  const posts = getPosts(user.id); // בקשת API לכל משתמש
  return { ...user, posts };
});

// ✅ טוב
const userIds = users.map((user) => user.id);
const posts = await getPostsByUsers(userIds); // בקשת API אחת
const data = users.map((user) => ({
  ...user,
  posts: posts.filter((post) => post.userId === user.id),
}));
```

## תהליך הסקירה 🔄

### 1. לפני הסקירה

```typescript
// בדיקת לינטינג
npm run lint

// בדיקת טיפוסים
npm run type-check

// הרצת בדיקות
npm run test
```

### 2. במהלך הסקירה

```typescript
// דוגמה להערה בונה
/**
 * הצעה לשיפור:
 * אפשר להשתמש ב-useMemo כאן כדי למנוע חישובים מיותרים
 *
 * const memoizedValue = useMemo(
 *   () => computeExpensiveValue(a, b),
 *   [a, b],
 * );
 */
```

### 3. אחרי הסקירה

```typescript
// דוגמה לסיכום סקירה
/**
 * סיכום סקירה:
 * ✅ הקוד עובד כמצופה
 * ✅ הבדיקות מכסות את המקרים העיקריים
 * ⚠️ כדאי לשפר את הביצועים בפונקציית החיפוש
 * ⚠️ חסר תיעוד ל-API
 */
```

## תבניות תגובה 💬

### 1. בקשת שינויים

```
נראה טוב! כמה הערות קטנות:
1. אפשר להוסיף טיפוסים ל-props
2. כדאי להוסיף בדיקות ל-edge cases
3. חסר תיעוד לפונקציה החדשה
```

### 2. אישור שינויים

```
מעולה! הקוד נקי ומאורגן היטב.
- ✅ הטיפוסים מוגדרים היטב
- ✅ הבדיקות מקיפות
- ✅ התיעוד ברור
LGTM 👍
```

## כלים מומלצים 🛠️

### 1. לינטינג

```json
// .eslintrc
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### 2. פורמטינג

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3. Git Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## סיכום 📝

### מטרות

1. שיפור איכות הקוד
2. מניעת באגים
3. שיתוף ידע
4. שמירה על סטנדרטים
5. למידה מתמדת

### המלצות

1. סקירה יסודית
2. משוב בונה
3. תיעוד הערות
4. מעקב אחר תיקונים
5. שיתוף פעולה
