# פורום קהילתי - תיעוד

מסמך זה מתאר את פונקציונליות הפורום הקהילתי באפליקציית "הדרך", שמהווה את הבסיס לבניית קהילת לומדים תומכת ופעילה.

## סקירה כללית

הפורום הקהילתי מאפשר למשתמשים לתקשר זה עם זה, לשאול שאלות, לשתף תובנות וחוויות, ולדון בנושאים הקשורים לתוכן הלימודי. הפורום מעודד למידה שיתופית ותמיכה הדדית בין המשתמשים, ומהווה הרחבה משמעותית למערך הקורסים באפליקציה.

## מרכיבים עיקריים

### 1. דף ראשי (פיד)

דף הבית של הפורום מציג את הדיונים העדכניים והפופולריים:

- **פיד עדכני** - רשימת הדיונים האחרונים לפי סדר כרונולוגי
- **דיונים חמים** - דיונים פופולריים עם פעילות רבה
- **פיד מותאם אישית** - תוכן מותאם להעדפות ולפעילות המשתמש

### 2. דיונים וצפייה

תצוגת הדיונים ומערכת התגובות:

- **עמוד דיון** - תצוגת הדיון עם כל התגובות
- **תגובות מדורגות** - תמיכה בתגובות לתגובות (מדורגות)
- **סימון תוכן** - אפשרות לסמן תגובות כמועילות או לאהוב אותן
- **שיתוף** - אפשרות לשתף דיונים עם משתמשים אחרים או ברשתות חברתיות

### 3. יצירת תוכן

כלים ליצירת תוכן חדש בפורום:

- **יצירת דיון חדש** - טופס מתקדם ליצירת דיון חדש
- **עורך תוכן עשיר** - כולל עיצוב טקסט, תמונות, קישורים, וקטעי קוד
- **תגיות וקטגוריות** - סיווג הדיון לפי נושאים וקטגוריות
- **טיוטות** - שמירת טיוטות לפני פרסום

### 4. ניווט וחיפוש

כלים לאיתור מידע בפורום:

- **חיפוש מתקדם** - חיפוש במגוון פרמטרים
- **סינון וחיפוש** - סינון לפי קטגוריות, תגיות, זמן, ומחברים
- **ניווט לפי קטגוריות** - ארגון התוכן בקטגוריות נושאיות
- **סימניות וסימון לקריאה מאוחרת** - שמירת דיונים למעקב או קריאה עתידית

### 5. מערכת מוניטין וגמול

מערכת לעידוד השתתפות איכותית:

- **דירוג תגובות** - דירוג תגובות כמועילות או לא מועילות
- **ניקוד מוניטין** - צבירת נקודות על השתתפות איכותית
- **דרגות ותגים** - סמלי הכרה למשתמשים פעילים ותורמים
- **משתמשים מובילים** - הצגת המשתמשים הפעילים והמועילים ביותר

### 6. התראות ומעקב

מערכת התראות ומעקב:

- **התראות על תגובות** - קבלת התראות כאשר מישהו מגיב לדיון או לתגובה שלך
- **מעקב אחר דיונים** - אפשרות לעקוב אחר דיונים ספציפיים
- **עדכוני קטגוריות** - קבלת התראות על דיונים חדשים בקטגוריות שמעניינות אותך
- **דיוור עדכונים** - אפשרות לקבל עדכונים יומיים/שבועיים בדוא"ל

## ארכיטקטורה טכנית

### רכיבי לקוח (Client-Side)

- **ForumHome** - דף הבית של הפורום עם הפיד הראשי
- **ForumPost** - רכיב תצוגת דיון בודד
- **ForumComment** - רכיב תגובה בודדת
- **ForumEditor** - עורך תוכן ליצירת דיונים ותגובות
- **ForumFilters** - רכיבי סינון וחיפוש
- **ForumNotifications** - מערכת התראות פורום

### רכיבי שרת (Server-Side)

- **ForumService** - שירות ניהול הפורום
- **SearchService** - שירות חיפוש מתקדם
- **NotificationService** - שירות התראות
- **ReputationService** - שירות ניהול מוניטין ודירוג

### מודל נתונים

טבלאות עיקריות בבסיס הנתונים:

- `forum_categories` - קטגוריות פורום
- `forum_posts` - דיונים בפורום
- `forum_comments` - תגובות לדיונים
- `forum_tags` - תגיות לדיונים
- `forum_post_tags` - קשר בין דיונים לתגיות
- `forum_likes` - "לייקים" על דיונים ותגובות
- `forum_bookmarks` - סימניות של משתמשים
- `forum_subscriptions` - מנויים למעקב אחר דיונים וקטגוריות
- `forum_reputation` - ניקוד מוניטין למשתמשים

## תזרים עבודה

### יצירת דיון חדש

1. המשתמש לוחץ על כפתור "דיון חדש"
2. המשתמש ממלא את טופס הדיון (כותרת, תוכן, קטגוריה, תגיות)
3. המערכת מבצעת וולידציה של הטופס
4. לאחר שליחה, הדיון מתפרסם ומופיע בפיד
5. המשתמשים הרשומים למעקב בקטגוריה מקבלים התראה

### תגובה לדיון

1. המשתמש פותח דיון קיים
2. המשתמש לוחץ על "הגב" ומזין את התגובה
3. לאחר שליחה, התגובה מופיעה בעמוד הדיון
4. המערכת שולחת התראה ליוצר הדיון ולמשתמשים אחרים שעוקבים אחריו

### חיפוש מידע

1. המשתמש מזין מילות מפתח בתיבת החיפוש
2. המערכת מציגה תוצאות חיפוש רלוונטיות
3. המשתמש יכול לסנן את התוצאות לפי קטגוריות, זמן, ועוד
4. המשתמש בוחר בתוצאה הרצויה ומועבר לדיון המבוקש

## תכונות מתקדמות

### 1. זיהוי תוכן דומה

טכנולוגיה המזהה דיונים דומים:

- זיהוי דיונים דומים בזמן יצירת דיון חדש
- המלצה על דיונים קיימים שעשויים לענות על שאלת המשתמש
- הפחתת כפילויות ושיפור איכות התוכן

### 2. מודרציה ודיווח

מערכת ניהול איכות התוכן:

- אפשרות לדווח על תוכן לא הולם
- מערכת מודרציה אוטומטית וידנית
- הנחיות קהילה ברורות ואכיפה עקבית
- תהליך ערעור על החלטות מודרציה

### 3. מנטורים וקהילה

תפקידים מיוחדים בקהילה:

- מנטורים - משתמשים מנוסים שעוזרים לאחרים
- מומחי תוכן - משתמשים עם ידע מעמיק בתחומים ספציפיים
- מובילי קהילה - יוצרי תוכן ומארגני פעילויות

### 4. אינטגרציה עם תוכן הקורס

חיבור הפורום למערכת הקורסים:

- קישור ישיר מתוכן קורס לדיונים רלוונטיים
- הצגת שאלות נפוצות מהפורום בתוך חומרי הקורס
- הצגת דיונים רלוונטיים בסוף כל שיעור

## סטטוס פיתוח

- [x] פורום בסיסי עם דיונים ותגובות
- [x] מערכת קטגוריות ותגיות
- [x] חיפוש בסיסי בפורום
- [ ] מערכת מוניטין ותגמול מלאה
- [ ] זיהוי תוכן דומה מתקדם
- [ ] אינטגרציה מלאה עם מערכת הקורסים
- [ ] תמיכה בקהילות משנה וקבוצות דיון

## התקנה ושימוש למפתחים

### קבצים רלוונטיים

- `src/components/forum/` - רכיבי הפורום
- `src/app/forum/` - דפי הפורום
- `src/app/community/` - דפי קהילה נוספים
- `src/lib/services/forum.ts` - שירות הפורום
- `src/app/api/forum/` - API endpoints של הפורום

### הוספת תכונה חדשה לפורום

1. הגדר את הטיפוסים הדרושים ב-`src/types/forum.ts`
2. הוסף לוגיקת שרת ב-`src/lib/services/forum.ts`
3. צור/עדכן את ה-API endpoint ב-`src/app/api/forum/`
4. הוסף את הרכיבים החדשים ב-`src/components/forum/`
5. שלב את הרכיבים בדפי הפורום המתאימים

## שאלות נפוצות למפתחים

### כיצד להוסיף סוג תוכן חדש בפורום?

1. הוסף את סוג התוכן החדש ב-`src/types/forum.ts`
2. הרחב את מודל הנתונים בבסיס הנתונים
3. עדכן את שירות הפורום לתמיכה בסוג התוכן החדש
4. צור רכיבי UI חדשים או הרחב את הקיימים לתמיכה בסוג החדש

### כיצד לשפר את ביצועי הפורום במקרה של תוכן רב?

1. יישם פאג'ינציה יעילה ב-API ובממשק המשתמש
2. השתמש ב-Virtualized Lists לתצוגת רשימות ארוכות
3. הוסף מטמון (Cache) לשאילתות נפוצות
4. יישם טעינה עצלה (Lazy Loading) לתכנים
5. הקפד על אופטימיזציה של שאילתות מסד הנתונים

## נספחים

### מודל נתונים מפורט

```sql
-- טבלת קטגוריות
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES forum_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- טבלת דיונים
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES forum_categories NOT NULL,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- טבלת תגובות
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES forum_posts NOT NULL,
  parent_id UUID REFERENCES forum_comments(id),
  is_answer BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### דוגמה לשימוש באינטגרציה עם קורסים

בתוך תוכן הקורס, ניתן לשלב הפניות לדיונים רלוונטיים:

```tsx
// components/course/lesson-discussion-links.tsx
function LessonDiscussionLinks({ lessonId }: { lessonId: string }) {
  const { data: relatedPosts, isLoading } = useRelatedForumPosts(lessonId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mt-6 rounded-lg border p-4">
      <h3 className="text-lg font-medium">דיונים קשורים בפורום</h3>
      {relatedPosts?.length ? (
        <ul className="mt-2 space-y-2">
          {relatedPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/forum/${post.slug}`}
                className="text-blue-600 hover:underline"
              >
                {post.title} ({post.comments_count} תגובות)
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-2">
          אין דיונים קשורים כרגע.{" "}
          <Link href="/forum/new" className="text-blue-600 hover:underline">
            פתח דיון חדש!
          </Link>
        </p>
      )}
    </div>
  );
}
```
