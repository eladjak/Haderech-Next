# 🗄️ Prisma - תיעוד מסד הנתונים

## מבוא

פרויקט HaDerech משתמש ב-Prisma כ-ORM לניהול בסיס הנתונים. Prisma מספק ממשק נוח וטיפוסים מובנים לעבודה עם PostgreSQL.

## סכמה

הסכמה של בסיס הנתונים מוגדרת בקובץ `prisma/schema.prisma`. הסכמה כוללת את המודלים הבאים:

### User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## פקודות שימושיות

### יצירת מיגרציה חדשה

```bash
pnpm prisma migrate dev --name <migration-name>
```

### הרצת מיגרציות

```bash
pnpm prisma migrate deploy
```

### עדכון הטיפוסים

```bash
pnpm prisma generate
```

### צפייה בנתונים

```bash
pnpm prisma studio
```

## שימוש ב-Prisma Client

### יצירת מופע

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

### דוגמאות לשאילתות

#### שליפת משתמש

```typescript
const user = await prisma.user.findUnique({
  where: {
    email: "example@email.com",
  },
});
```

#### יצירת משתמש

```typescript
const user = await prisma.user.create({
  data: {
    email: "example@email.com",
    name: "Example User",
  },
});
```

## מיגרציות

כל שינוי בסכמה דורש יצירת מיגרציה חדשה. המיגרציות נשמרות בתיקייה `prisma/migrations`.

### תהליך עדכון הסכמה:

1. ערוך את קובץ `schema.prisma`
2. צור מיגרציה חדשה:
   ```bash
   pnpm prisma migrate dev --name <migration-name>
   ```
3. בדוק את קובץ המיגרציה שנוצר
4. הרץ את המיגרציה בסביבת הפיתוח

## סידים

הפרויקט כולל נתוני סיד בסיסיים. ניתן להריץ אותם באמצעות:

```bash
pnpm prisma db seed
```

## שגיאות נפוצות

### בעיות חיבור

אם מתקבלת שגיאת חיבור, וודא:

1. שה-DATABASE_URL תקין
2. שהשרת פועל
3. שיש הרשאות מתאימות

### שגיאות מיגרציה

במקרה של שגיאות מיגרציה:

1. בדוק את לוג השגיאות
2. נסה לאפס את בסיס הנתונים:
   ```bash
   pnpm prisma migrate reset
   ```

## טיפים והמלצות

1. השתמש ב-transactions לפעולות מורכבות
2. הגדר אינדקסים לשדות שמחפשים בהם
3. השתמש ב-relations לקשרים בין טבלאות
4. הימנע משאילתות מקוננות עמוקות

## אבטחה

1. לעולם אל תחשוף את ה-DATABASE_URL
2. השתמש בהרשאות מינימליות
3. וודא שכל הקלט מטוהר
4. השתמש ב-prepared statements

## ביצועים

1. השתמש ב-select לבחירת שדות ספציפיים
2. הגדר אינדקסים לשיפור ביצועים
3. השתמש ב-pagination
4. הימנע מ-N+1 queries
