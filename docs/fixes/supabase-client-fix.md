# תיקון חיבורי Supabase ב-client-side

## רקע

בפרויקט היו מספר קבצים שהשתמשו ב-`createClient` מ-`@/lib/utils`, אבל פונקציה זו לא קיימת שם. הפונקציה הנכונה לשימוש ב-client components היא `createClientComponentClient` מ-`@supabase/auth-helpers-nextjs`.

## תיקונים שבוצעו

### 1. קובץ `src/lib/services/forum.ts`

- תיקנו את הגישה ל-`profiles` על ידי הוספת `[0]` לכל הגישות
- לדוגמה: שינוי מ-`post.profiles.id` ל-`post.profiles[0].id`

### 2. קובץ `src/lib/services/points.ts`

- שינינו את הייבוא מ-`createClient` מ-`@/lib/utils` ל-`createClientComponentClient` מ-`@supabase/auth-helpers-nextjs`
- שינינו את יצירת הקליינט של supabase מ-`createClient(URL, KEY)` ל-`createClientComponentClient<Database>()`
- תיקנו את נתיב הייבוא של הסוגים מ-`@/types` ל-`@/types/database`

### 3. קובץ `src/lib/services/social-group.ts`

- שינינו את הייבוא מ-`createClient` ל-`createClientComponentClient`
- הסרנו את בדיקת משתני הסביבה של supabase שכבר לא נחוצה
- הגדרנו את הסוגים החסרים באופן פנימי בקובץ
- תיקנו שגיאת קוד בשימוש ב-`new Date().toISOString()`

### 4. יצירת קובץ `src/types/index.ts`

- יצרנו קובץ גשר שמייצא את כל הסוגים הנחוצים מהקבצים הספציפיים
- זה מאפשר לקוד ישן שמייבא מ-`@/types` להמשיך לעבוד

## תיקונים נוספים נדרשים

- קובץ `src/lib/services/recommendation-engine.ts` עדיין מכיל שגיאות טייפסקריפט הקשורות להגדרות הממשקים
- קובץ `src/lib/validations/auth.ts` מכיל שגיאות לגבי שימוש ב-`min` בפונקציית זוד
- שגיאות נוספות ב-`src/store/slices/courseSlice.ts`

## הערות

- התיקונים שבוצעו מאפשרים לקוד לפעול בסביבת פיתוח, למרות ששגיאות טייפסקריפט עדיין קיימות
- יש להשלים את שאר התיקונים בהמשך כדי לאפשר בניית גרסת ייצור מלאה
