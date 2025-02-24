# מערכת קורסים - תיעוד

מסמך זה מתאר את פונקציונליות מערכת הקורסים באפליקציית "הדרך", המהווה את הליבה של חווית הלמידה באפליקציה.

## סקירה כללית

מערכת הקורסים מאפשרת למשתמשים לצפות, להירשם וללמוד מגוון קורסים בנושאים שונים. המערכת בנויה לתמוך בחוויית למידה אינטראקטיבית ומותאמת אישית, עם תמיכה במגוון סוגי תוכן ומעקב התקדמות מתקדם.

## מרכיבים עיקריים

### 1. קטלוג קורסים

ממשק המציג את היצע הקורסים הזמינים:

- **דף קורסים ראשי** - תצוגת קורסים עם סינון וחיפוש
- **קטגוריות וסיווג** - ארגון קורסים לפי נושאים ותחומים
- **תצוגת קורס** - דף פרטי קורס עם מידע מפורט, סילבוס, וביקורות
- **המלצות אישיות** - קורסים מומלצים בהתאם להעדפות המשתמש והתקדמותו

### 2. צפייה ולמידה

חווית הלמידה עצמה:

- **נגן תוכן** - צפייה בשיעורי וידאו, הרצאות, ותכנים אחרים
- **חומרי עזר** - קבצים להורדה, מצגות, ומקורות נוספים
- **תרגולים מובנים** - תרגילים ומשימות משולבים בקורס
- **שיתוף הערות** - אפשרות להוסיף הערות אישיות ולשתף עם אחרים

### 3. מעקב והתקדמות

מערכת למעקב אחר התקדמות הלמידה:

- **סימון התקדמות** - סימון שיעורים שהושלמו
- **מדדי התקדמות** - תצוגה ויזואלית של אחוזי התקדמות
- **לוח זמנים** - יעדי למידה ותזכורות לפי לוח זמנים אישי
- **תעודות וסיום** - קבלת תעודות ואישורים בסיום קורסים

### 4. אינטראקציה ודיונים

מרכיבים חברתיים ואינטראקטיביים:

- **שאלות ותשובות** - אפשרות לשאול שאלות במהלך הקורס
- **דיונים לפי שיעור** - חלל דיון ספציפי לכל שיעור או יחידת לימוד
- **קהילת קורס** - תקשורת בין משתתפי קורס ספציפי
- **משוב מרצים** - אינטראקציה ישירה עם מרצי הקורס

### 5. ניהול וארגון

כלים לניהול הלמידה האישית:

- **רשימת קורסים** - ריכוז הקורסים שהמשתמש רשום אליהם
- **סימניות** - סימון נקודות ספציפיות בקורס לחזרה
- **היסטוריית צפייה** - מעקב אחר תכנים שנצפו
- **הורדות** - ניהול תכנים שהורדו לצפייה לא מקוונת

## ארכיטקטורה טכנית

### רכיבי לקוח (Client-Side)

- **CourseList** - רכיב תצוגת רשימת קורסים
- **CourseCard** - רכיב תצוגת קורס בודד בתצוגת רשימה
- **CourseDetails** - דף פרטי קורס מלאים
- **VideoPlayer** - נגן וידאו מותאם עם תכונות לימוד
- **CourseProgress** - רכיבי הצגת התקדמות
- **LessonContent** - רכיב תצוגת תוכן שיעור
- **CourseDiscussion** - רכיבי דיון ושאלות

### רכיבי שרת (Server-Side)

- **CourseService** - שירות לניהול נתוני קורסים
- **EnrollmentService** - שירות לניהול הרשמה והשתתפות בקורסים
- **ProgressService** - שירות מעקב התקדמות והישגים
- **ContentDeliveryService** - שירות להעברת תוכן מדיה
- **DiscussionService** - שירות לניהול דיונים ותגובות

### מודל נתונים

טבלאות עיקריות בבסיס הנתונים:

- `courses` - מידע על קורסים
- `course_chapters` - פרקים בקורס
- `course_lessons` - שיעורים בקורס
- `course_materials` - חומרי עזר וקבצים נלווים
- `course_enrollments` - הרשמות משתמשים לקורסים
- `course_progress` - מעקב התקדמות
- `course_comments` - תגובות ודיונים
- `course_ratings` - דירוגים וביקורות

## תזרים עבודה

### רישום לקורס

1. המשתמש מחפש קורס דרך הקטלוג או ההמלצות
2. המשתמש צופה בדף פרטי הקורס עם מידע מלא
3. המשתמש נרשם לקורס (בחינם או בתשלום)
4. הקורס מתווסף לרשימת הקורסים של המשתמש
5. המשתמש מקבל גישה מלאה לתוכן הקורס

### צפייה ולמידה

1. המשתמש בוחר קורס מרשימת הקורסים שלו
2. המשתמש בוחר שיעור או ממשיך מהנקודה האחרונה
3. המשתמש צופה בתוכן השיעור
4. המערכת מסמנת את השיעור כנצפה ומעדכנת את ההתקדמות
5. המשתמש יכול להתקדם לשיעור הבא או לבצע פעולות נוספות (תרגול, דיון, וכו')

### השתתפות בדיונים

1. המשתמש מזהה נקודה בה הוא רוצה לשאול שאלה
2. המשתמש מפעיל את ממשק הדיונים בשיעור הרלוונטי
3. המשתמש יכול לצפות בשאלות קיימות או לפרסם שאלה חדשה
4. המשתמש יכול להגיב לתשובות או לסמן תשובה כמועילה
5. התראות נשלחות למשתמש כאשר יש תגובות חדשות לשאלות שלו

## תכונות מתקדמות

### 1. למידה מותאמת אישית

מערכת התאמה אישית לשיפור חווית הלמידה:

- **מסלולי למידה דינמיים** - התאמת מסלול הלמידה בהתאם לביצועים
- **קצב אישי** - התאמת קצב הלמידה ליכולות ולזמן הפנוי של המשתמש
- **תוכן מותאם** - הצגת תוכן נוסף בהתאם לתחומי העניין והקשיים
- **המלצות חכמות** - המלצות על קורסים נוספים בהתבסס על דפוסי למידה

### 2. אינטראקטיביות מתקדמת

הגברת האינטראקטיביות והמעורבות:

- **שאלות מובנות** - שאלות ובחנים משולבים בתוכן
- **תרגילים אינטראקטיביים** - תרגול מעשי עם משוב מיידי
- **פרויקטים מעשיים** - משימות ארוכות טווח ותרגול מתקדם
- **למידה שיתופית** - פרויקטים ומשימות בקבוצות

### 3. שילוב עם מרכיבי פלטפורמה נוספים

אינטגרציה עם מרכיבים אחרים באפליקציה:

- **אינטגרציה עם סימולטור** - קישור לתרחישי תרגול רלוונטיים
- **אינטגרציה עם פורום** - קישור לדיונים רלוונטיים בפורום
- **אינטגרציה עם בוט** - סיוע מותאם אישית בהתאם לתוכן הנלמד
- **אינטגרציה עם הישגים** - הישגים וגמול על התקדמות והשלמה

## סטטוס פיתוח

- [x] מערכת בסיסית להצגת קורסים
- [x] נגן וידאו עם תמיכה בתכונות למידה
- [x] מעקב התקדמות בסיסי
- [x] מערכת הרשמה ותשלום
- [ ] פיצ'רים מתקדמים לאינטראקטיביות
- [ ] למידה מותאמת אישית מלאה
- [ ] אינטגרציה מלאה עם כל מרכיבי הפלטפורמה
- [ ] תמיכה בלמידה לא מקוונת

## התקנה ושימוש למפתחים

### קבצים רלוונטיים

- `src/components/course/` - רכיבי מערכת הקורסים
- `src/app/courses/` - דפי הקורסים
- `src/lib/services/courses.ts` - שירות הקורסים
- `src/app/api/courses/` - API endpoints של מערכת הקורסים
- `src/constants/courses.ts` - קבועים והגדרות של הקורסים

### הוספת סוג תוכן חדש

1. הגדר את הטיפוס החדש ב-`src/types/courses.ts`
2. הוסף רכיב תצוגה מתאים ב-`src/components/course/content-types/`
3. עדכן את רכיב התוכן המרכזי ב-`src/components/course/LessonContent.tsx`
4. הוסף לוגיקת מעקב התקדמות מתאימה ב-`src/lib/services/progress.ts`

### הוספת תכונה חדשה לנגן הוידאו

1. עדכן את רכיב הנגן ב-`src/components/course/VideoPlayer.tsx`
2. הוסף את האירועים והפונקציות הדרושים לתכונה החדשה
3. עדכן את הסגנון והממשק בהתאם לתכונה
4. וודא שהתכונה עובדת בכל הדפדפנים והמכשירים הנתמכים

## שאלות נפוצות למפתחים

### איך להוסיף תמיכה בסוג תוכן חדש?

1. הגדר את מבנה הנתונים של סוג התוכן ב-`types/courses.ts`
2. הוסף רכיב React לתצוגת סוג התוכן ב-`components/course/content-types/`
3. עדכן את החלק הרלוונטי בשירות הקורסים (`services/courses.ts`)
4. עדכן את הסכמה בבסיס הנתונים במידת הצורך

### איך לשפר את ביצועי הזרמת הוידאו?

1. שימוש בCDN איכותי להפצת וידאו
2. יישום טכניקות Adaptive Bitrate Streaming
3. אופטימיזציה של קבצי וידאו במגוון רזולוציות וגדלים
4. טעינה מקדימה (preloading) של תוכן וידאו
5. יישום מנגנוני caching יעילים

## נספחים

### מודל נתונים מפורט

```sql
-- טבלת קורסים
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  cover_image TEXT,
  instructor_id UUID REFERENCES auth.users,
  duration INTEGER, -- בדקות
  difficulty TEXT,
  price INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- טבלת פרקים בקורס
CREATE TABLE course_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- טבלת שיעורים בקורס
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES course_chapters NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  content_url TEXT,
  content_data JSONB,
  duration INTEGER, -- בדקות
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- טבלת הרשמות לקורסים
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES courses NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_id TEXT,
  status TEXT DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

-- טבלת מעקב התקדמות
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  lesson_id UUID REFERENCES course_lessons NOT NULL,
  progress FLOAT NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_position FLOAT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
```

### דוגמה ליצירת קורס

```typescript
// services/courses.ts
async function createCourse(courseData: CreateCourseInput): Promise<Course> {
  try {
    // הוספת הקורס לבסיס הנתונים
    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title: courseData.title,
        slug: generateSlug(courseData.title),
        description: courseData.description,
        short_description: courseData.shortDescription,
        cover_image: courseData.coverImage,
        instructor_id: courseData.instructorId,
        duration: courseData.duration,
        difficulty: courseData.difficulty,
        price: courseData.price,
        is_published: courseData.isPublished || false,
      })
      .select()
      .single();

    if (error) throw error;

    // יצירת פרקים וסידורם
    if (courseData.chapters && courseData.chapters.length > 0) {
      for (let i = 0; i < courseData.chapters.length; i++) {
        const chapter = courseData.chapters[i];
        await createChapter({
          courseId: course.id,
          title: chapter.title,
          description: chapter.description,
          sortOrder: i,
          isPublished: chapter.isPublished,
          lessons: chapter.lessons,
        });
      }
    }

    return course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }
}
```

### דוגמה לרכיב תצוגת שיעור

```tsx
// components/course/LessonContent.tsx
function LessonContent({ lesson, onComplete }: LessonContentProps) {
  const { updateProgress } = useProgress();
  const [progress, setProgress] = useState(0);

  // מעדכן את ההתקדמות כשהמשתמש צופה בתוכן
  const handleProgressUpdate = async (newProgress: number) => {
    setProgress(newProgress);
    await updateProgress({
      lessonId: lesson.id,
      progress: newProgress,
      completed: newProgress >= 0.9, // מסמן כהושלם אם ההתקדמות מעל 90%
    });

    if (newProgress >= 0.9 && onComplete) {
      onComplete(lesson.id);
    }
  };

  // מציג את סוג התוכן המתאים בהתאם ל-content_type של השיעור
  const renderContent = () => {
    switch (lesson.content_type) {
      case "video":
        return (
          <VideoPlayer
            url={lesson.content_url}
            onProgress={handleProgressUpdate}
            initialPosition={lesson.last_position || 0}
          />
        );
      case "article":
        return (
          <ArticleContent
            content={lesson.content_data}
            onRead={handleProgressUpdate}
          />
        );
      case "quiz":
        return (
          <QuizContent
            quiz={lesson.content_data}
            onComplete={handleProgressUpdate}
          />
        );
      case "assignment":
        return (
          <AssignmentContent
            assignment={lesson.content_data}
            onSubmit={handleProgressUpdate}
          />
        );
      default:
        return <div>סוג תוכן לא נתמך</div>;
    }
  };

  return (
    <div className="lesson-content">
      <h2 className="mb-4 text-2xl font-bold">{lesson.title}</h2>
      <div className="lesson-description mb-4">{lesson.description}</div>
      <div className="content-container">{renderContent()}</div>
      <ProgressBar progress={progress} />
      <LessonDiscussion lessonId={lesson.id} />
    </div>
  );
}
```
