# בעיות שנותרו לתיקון

במסגרת תיקון השגיאות בפרויקט, תיקנו מספר רב של בעיות שאפשרו לנו להריץ את האפליקציה בסביבת פיתוח (`npm run dev`).
עם זאת, נותרו מספר שגיאות שעדיין מונעות בניית גרסת ייצור מלאה (`npm run build`).

## שגיאות שנותרו לתיקון

### 1. בעיות טיפוסים ב-`src/types/supabase.ts`

```
src/types/supabase.ts(1,15): error TS2305: Module '"./api"' has no exported member 'Course'.
src/types/supabase.ts(1,23): error TS2305: Module '"./api"' has no exported member 'CourseLesson'.
src/types/supabase.ts(1,37): error TS2305: Module '"./api"' has no exported member 'CourseRating'.
src/types/supabase.ts(1,51): error TS2305: Module '"./api"' has no exported member 'User'.
```

**נדרש**: לבדוק את הייבואים בקובץ ולוודא שהטיפוסים מיובאים מהמקום הנכון.

### 2. בעיות בקובץ `src/utils/validation.ts`

```
src/utils/validation.ts(4,4): error TS2339: Property 'email' does not exist on type '(params?...'
```

**נדרש**: לבדוק את השימוש בספריית Zod ולתקן בדומה לתיקון שביצענו בקובץ `auth.ts`.

### 3. בעיות ייבואים מעגליים

```
נמצאו ייבואים מעגליים
```

**נדרש**: לבדוק את מבנה הייבואים ולארגן מחדש את הקבצים כדי למנוע תלויות מעגליות.

## תיקונים שכבר בוצעו

1. תיקון `createClient` לשימוש ב-`createClientComponentClient` מ-`@supabase/auth-helpers-nextjs`
2. תיקון הגישה ל-`profiles` ע"י הוספת `[0]` בקובץ `forum.ts`
3. תיקון קובץ `recommendation-engine.ts` עם טיפוסים מתאימים לתמיכה בתכונת `tags`
4. תיקון השימוש בספריית Zod בקובץ `auth.ts`
5. תיקון קבצי ה-Redux slices:
   - הסרת ייצוא של משתנים לא קיימים ב-`forum.ts` ו-`social.ts`
   - תיקון ייבוא של `Notification` ב-`notificationSlice.ts`
   - תיקון קריאה ל-`Date.now()` ב-`uiSlice.ts`
   - הוספת ממשק מורחב של `UserPreferences` ב-`userSlice.ts`

## תוכנית עבודה מוצעת

1. **המשך פיתוח בסביבת פיתוח**: להמשיך לפתח ולבדוק פיצ'רים בסביבת הפיתוח (`npm run dev`)
2. **תיקון שגיאות בהדרגה**: לתקן את השגיאות הנותרות בהדרגה, תוך בדיקה שלא נוצרות שגיאות חדשות
3. **בדיקות מקיפות**: לפני העלאה לסביבת ייצור, לוודא שכל השגיאות נפתרו וניתן לבצע בניית ייצור מלאה
