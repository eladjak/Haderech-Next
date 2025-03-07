# תיקון בעיות בילד ולקחים לעתיד

## רקע

בפרויקט HaDerech נתקלנו במספר בעיות תקינות קוד שמנעו את הבנייה והדיפלוי המוצלח של האפליקציה. הבעיות נחלקו למספר קטגוריות מרכזיות שטופלו במסגרת תהליך התיקון. מסמך זה מפרט את הבעיות, הפתרונות, והלקחים שהפקנו במהלך התהליך.

## הבעיות העיקריות

### 1. דירקטיבת "use client" לא תקינה

הדירקטיבה `"use client"` היתה ממוקמת במקומות לא נכונים בקבצים רבים:

- ממוקמת אחרי קוד אחר (אחרי imports) במקום בתחילת הקובץ
- עטופה בסוגריים: `("use client")` במקום `"use client"`
- חסרה בחלק מהקבצים שדורשים אותה

קבצים עם בעיות כאלה:

- `src/app/error.tsx`
- `src/app/community/[postId]/page.tsx`
- `src/app/community/new/page.tsx`
- `src/app/forum/[id]/page.tsx`
- `src/app/(course)/courses/[id]/lessons/[lessonId]/components/lesson-content.tsx`
- `src/app/(course)/courses/[id]/lessons/[lessonId]/components/lesson-video.tsx`

### 2. שגיאות תחביר בייבוא

- ייבוא שורות ארוכות שנפסקו באמצע
- ייבוא של רכיבים לא קיימים
- ייבוא ללא ציון ישיר של מה מייבאים: `import "@/lib/utils"`

### 3. אי-התאמה בטיפוסים

- הגדרות טיפוסים שונות בקבצים שונים (לדוגמה, הטיפוס `Author` הוגדר בצורה שונה בקבצים שונים)
- חוסר התאמה בין הטיפוסים המוגדרים ב-types לבין אלה המוגדרים ב-services
- פרמטרים חסרים בקריאות לפונקציות

### 4. שימוש לא נכון ב-API Route עם Next.js 14

- API Routes בגרסה 14 של Next.js דורשים התייחסות מיוחדת, כפי שתוקן במסמך [api-client-directive-fixes.md](api-client-directive-fixes.md)

## הפתרונות שיושמו

### 1. תיקון דירקטיבות "use client"

- העברה לתחילת הקובץ (לפני כל קוד אחר)
- הסרת סוגריים מיותרים
- וידוא שהדירקטיבה נוכחת בכל הקבצים שדורשים אותה

### 2. תיקון ייבואים

- תיקון ייבואים שגויים
- הוספת ייבואים חסרים
- הסדרה נאותה של ייבוא קומפוננטות UI

### 3. האחדת טיפוסים

- עדכון והאחדת טיפוסים במערכת הקבצים:
  - טיפוס `Author`
  - טיפוס `ForumComment`
  - טיפוס `ForumPost`
- התאמת הפרמטרים בקריאות לפונקציות לפי הממשק המוגדר

### 4. יצירת סקריפט בדיקה

הוספנו סקריפט בדיקה אוטומטי שיזהה אם דירקטיבות "use client" נמצאות במקומות הלא נכונים:
`scripts/check-api-directives.js`

## לקחים והמלצות

### 1. ארכיטקטורה והפרדה ברורה

- **הפרדה ברורה בין client ל-server**: יש להקפיד על סימון ברור של רכיבי client ו-server
- **ריכוז הגדרות טיפוסים**: הגדרת טיפוסים צריכה להיות מרוכזת במקום אחד עם ייצוא מסודר
- **מניעת כפילויות**: למנוע הגדרות מרובות של אותו טיפוס במקומות שונים

### 2. תהליכי פיתוח משופרים

- **בדיקות לפני commit**: להוסיף בדיקות אוטומטיות שירוצו לפני כל commit
- **בדיקות טיפוסים**: לוודא שבדיקות טיפוסים מתבצעות באופן שוטף
- **linting מחמיר**: להגדיר כללי linting מחמירים שימנעו בעיות כאלה

### 3. כלים חדשים שהטמענו

- **סקריפטים לבדיקת קוד**: הוספנו סקריפטים אוטומטיים לזיהוי בעיות נפוצות
- **שיפור תהליך הבילד**: עדכנו את תהליך הבילד כך שיזהה בעיות מוקדם יותר
- **תיעוד שינויים**: שיפרנו את התיעוד של שינויים והחלטות ארכיטקטוניות

### 4. המלצות לעתיד

- **הגדרת סטנדרטים ברורים**: ליצור מסמך סטנדרטים ברור לכל צוות הפיתוח
- **סקירות קוד מובנות**: להטמיע תהליך סקירות קוד מובנה לכל שינוי משמעותי
- **הכשרה והדרכה**: לבצע הדרכות תקופתיות בנושאי ארכיטקטורה ותיקני קוד
- **אוטומציה**: להגדיל את רמת האוטומציה בבדיקות ותיקוני קוד
- **מניעת שגיאות קומפילציה**: מניעת דחיפה לגיט של קוד שלא עובר קומפילציה

## סיכום

השינויים שביצענו מייצבים את הפרויקט ומאפשרים לו לעבור בבילד ולהתבצע דיפלוי בהצלחה. התהליך העלה מספר נקודות חשובות שצריך להתייחס אליהן בהמשך הפיתוח כדי לשמור על איכות קוד גבוהה ולמנוע בעיות דומות בעתיד.

המסמך הזה ישמש כמדריך לצוות כדי להימנע מבעיות דומות בעתיד ולשפר את תהליכי העבודה באופן מתמיד.

# פתרון שגיאות בילד נפוצות

מסמך זה מתעד את השגיאות הנפוצות ביותר במהלך בניית הפרויקט והדרכים לטיפול בהן.

## שגיאות דירקטיבות "use client"

### 1. דירקטיבה במקום הלא נכון

**שגיאה:**

```
The "use client" directive must be placed before other expressions. Move it to the top of the file to resolve this issue.
```

**פתרון:**
הדירקטיבה `"use client"` חייבת להיות בשורה הראשונה בקובץ, לפני כל הייבואים וקוד אחר.

✅ **נכון:**

```jsx
"use client";

import React from "react";

// שאר הקוד
```

❌ **לא נכון:**

```jsx
import React from "react";

("use client"); // במיקום שגוי
// שאר הקוד
```

❌ **לא נכון:**

```jsx
import React from "react";

("use client"); // בתוך סוגריים ובמיקום שגוי
// שאר הקוד
```

### 2. שימוש ב-hooks בקומפוננטת שרת

**שגיאה:**

```
You're importing a component that needs useState/useEffect. It only works in a Client Component but none of its parents are marked with "use client".
```

**פתרון:**
כאשר משתמשים ב-hooks כמו `useState`, `useEffect`, `useRouter` וכו', חייבים להוסיף דירקטיבת `"use client"` בתחילת הקובץ.

```jsx
"use client";

import { useEffect, useState } from "react";

export default function MyComponent() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // קוד
  }, []);

  return <div>...</div>;
}
```

### 3. דירקטיבת "use client" בקבצי API

**שגיאה:**
דירקטיבת "use client" בקובץ API Route (בתוך `app/api/`) גורמת לשגיאות בנייה.

**פתרון:**
קבצי API הם קבצי שרת בלבד ולכן אין להשתמש בדירקטיבת `"use client"` בהם.

✅ **נכון:**

```ts
// src/app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // קוד
  return NextResponse.json({ data: [] });
}
```

❌ **לא נכון:**

```ts
// src/app/api/users/route.ts
"use client";

// לא צריך בקבצי API
import { NextResponse } from "next/server";

export async function GET() {
  // קוד
  return NextResponse.json({ data: [] });
}
```

## שגיאות TypeScript

### 1. שגיאות תחביר בסיסיות

**שגיאה:**

```
Expected ';' but found '.'
```

**פתרון:**
בדוק את התחביר של הקוד, במיוחד סימני פיסוק חסרים או מיותרים.

### 2. טיפוסים לא מתאימים

**שגיאה:**

```
Type '...' is not assignable to type '...'
```

**פתרון:**
ודא שהערכים שאתה מעביר לפונקציות או משייך למשתנים תואמים את הטיפוסים המוגדרים.

## שגיאות Supabase Client

### 1. createServerClient במקום createRouteHandlerClient

**שגיאה:**

```
'createServerClient' is deprecated. Use 'createRouteHandlerClient' instead for Route Handlers.
```

**פתרון:**
עבור קבצי API Routes, יש להשתמש ב-`createRouteHandlerClient` במקום ב-`createServerClient`:

```ts
// src/app/api/example/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  // המשך הקוד
}
```

## כלים וסקריפטים לעזרה

לפרויקט נוספו כלים שיעזרו לזהות ולתקן את השגיאות הנפוצות:

### 1. בדיקת דירקטיבות API

```bash
node scripts/check-api-directives.js
```

זיהוי של דירקטיבות "use client" בקבצי API.

### 2. בדיקת דירקטיבות עם תיקון אוטומטי

```bash
node scripts/check-api-directives.js --fix
```

זיהוי ותיקון אוטומטי של דירקטיבות "use client" בעייתיות.

### 3. בדיקת דירקטיבות בקומפוננטות

```bash
node scripts/check-api-directives.js --check-components
```

זיהוי של דירקטיבות "use client" בעייתיות גם בקבצי קומפוננטות.

### 4. ניטור בנייה מפורט

```bash
node scripts/monitor-build.js
```

ניטור מפורט של תהליך הבנייה עם זיהוי והסבר על שגיאות נפוצות.

### 5. בנייה במצב "רך"

```bash
SKIP_TYPE_CHECK=1 pnpm build
# או
node scripts/build-checks.js --soft
```

בנייה במצב "רך" שמתעלם משגיאות טיפוסים לא קריטיות.
