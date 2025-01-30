# 📚 תיעוד API - הדרך 🚀

## 🔑 אימות

כל הבקשות (למעט אם צוין אחרת) דורשות אימות באמצעות JWT token בכותרת ה-Cookie.

## 📍 נקודות קצה

### 👤 משתמשים

#### פרופיל משתמש
```http
GET /api/profile
```
מחזיר את פרטי המשתמש המחובר

```http
PUT /api/profile
```
מעדכן את פרטי המשתמש המחובר

### 📚 קורסים

#### רשימת קורסים
```http
GET /api/courses
```
מחזיר רשימת קורסים עם אפשרויות סינון:
- `category`: קטגוריה
- `level`: רמה
- `search`: חיפוש חופשי
- `instructor`: מזהה מדריך

#### קורס ספציפי
```http
GET /api/courses/{courseId}
```
מחזיר פרטי קורס מלאים

```http
PUT /api/courses/{courseId}
```
מעדכן פרטי קורס (למדריך בלבד)

```http
DELETE /api/courses/{courseId}
```
מוחק קורס (למדריך בלבד)

#### הרשמה לקורס
```http
POST /api/courses/{courseId}/enroll
```
נרשם לקורס

```http
DELETE /api/courses/{courseId}/enroll
```
מבטל הרשמה לקורס

### 📝 שיעורים

#### רשימת שיעורים בקורס
```http
GET /api/courses/{courseId}/lessons
```
מחזיר רשימת שיעורים בקורס

#### שיעור ספציפי
```http
GET /api/courses/{courseId}/lessons/{lessonId}
```
מחזיר פרטי שיעור מלאים

```http
PUT /api/courses/{courseId}/lessons/{lessonId}
```
מעדכן פרטי שיעור (למדריך בלבד)

```http
DELETE /api/courses/{courseId}/lessons/{lessonId}
```
מוחק שיעור (למדריך בלבד)

### 💬 תגובות

#### תגובות לשיעור
```http
GET /api/courses/{courseId}/lessons/{lessonId}/comments
```
מחזיר תגובות לשיעור

```http
POST /api/courses/{courseId}/lessons/{lessonId}/comments
```
מוסיף תגובה חדשה

```http
PUT /api/courses/{courseId}/lessons/{lessonId}/comments
```
מעדכן תגובה קיימת

```http
DELETE /api/courses/{courseId}/lessons/{lessonId}/comments?id={commentId}
```
מוחק תגובה

### ⭐ דירוגים

#### דירוגי קורס
```http
GET /api/courses/{courseId}/ratings
```
מחזיר דירוגים לקורס

```http
POST /api/courses/{courseId}/ratings
```
מוסיף או מעדכן דירוג

```http
DELETE /api/courses/{courseId}/ratings
```
מוחק דירוג

### 📊 סטטיסטיקות

```http
GET /api/courses/{courseId}/stats
```
מחזיר סטטיסטיקות קורס (למדריך בלבד)

### 🔍 חיפוש

```http
GET /api/search?q={query}&type={type}
```
חיפוש גלובלי עם אפשרויות:
- `type`: courses, lessons, instructors

### 🔖 סימניות

```http
GET /api/bookmarks
```
מחזיר סימניות המשתמש

```http
POST /api/bookmarks
```
מוסיף סימניה חדשה

```http
DELETE /api/bookmarks?id={bookmarkId}
```
מוחק סימניה

### 🔔 התראות

```http
GET /api/notifications
```
מחזיר התראות המשתמש

```http
POST /api/notifications
```
מוסיף התראה חדשה

```http
PATCH /api/notifications
```
מעדכן סטטוס התראה (נקרא/לא נקרא)

## 📤 העלאת קבצים

```http
POST /api/upload
```
מעלה קובץ חדש (תמונה, וידאו, מסמך)

## ⚠️ טיפול בשגיאות

כל השגיאות מוחזרות בפורמט אחיד:
```json
{
  "error": "תיאור השגיאה"
}
```

קודי שגיאה נפוצים:
- `400`: בקשה לא תקינה
- `401`: לא מחובר
- `403`: אין הרשאה
- `404`: לא נמצא
- `500`: שגיאת שרת

## 🔒 אבטחה

- כל הבקשות חייבות להיות מאובטחות ב-HTTPS
- יש להשתמש ב-CORS
- Rate limiting מופעל על כל הנקודות
- ולידציה קפדנית של כל הקלט
- הרשאות מבוססות תפקידים

## 📈 ביצועים

- Cache מופעל על בקשות GET
- Pagination חובה בכל הרשימות
- אופטימיזציה של שאילתות
- דחיסת תוכן
- מניעת N+1 queries 

## מבוא

תיעוד זה מתאר את נקודות הקצה של ה-API של פלטפורמת "הדרך". כל הנקודות דורשות אימות משתמש אלא אם צוין אחרת.

## נקודות קצה

### קורסים

#### קבלת רשימת קורסים
```http
GET /api/courses
```

**פרמטרים אופציונליים:**
- `category` - סינון לפי קטגוריה
- `level` - סינון לפי רמה
- `search` - חיפוש טקסט חופשי
- `instructor` - סינון לפי מדריך

#### קבלת קורס ספציפי
```http
GET /api/courses/{id}
```

#### עדכון קורס
```http
PATCH /api/courses/{id}
```
דורש הרשאות מדריך.

#### מחיקת קורס
```http
DELETE /api/courses/{id}
```
דורש הרשאות מדריך או מנהל.

### שיעורים

#### קבלת רשימת שיעורים בקורס
```http
GET /api/courses/{id}/lessons
```

#### קבלת שיעור ספציפי
```http
GET /api/courses/{id}/lessons/{lessonId}
```

#### עדכון שיעור
```http
PUT /api/courses/{id}/lessons/{lessonId}
```
דורש הרשאות מדריך.

#### מחיקת שיעור
```http
DELETE /api/courses/{id}/lessons/{lessonId}
```
דורש הרשאות מדריך.

### התקדמות בשיעורים

#### קבלת התקדמות בשיעור
```http
GET /api/courses/{id}/lessons/{lessonId}/progress
```

#### עדכון התקדמות בשיעור
```http
PUT /api/courses/{id}/lessons/{lessonId}/progress
```

### תגובות

#### קבלת תגובות לשיעור
```http
GET /api/courses/{id}/lessons/{lessonId}/comments
```

#### הוספת תגובה לשיעור
```http
POST /api/courses/{id}/lessons/{lessonId}/comments
```

### דירוגים

#### קבלת דירוגים לקורס
```http
GET /api/courses/{id}/ratings
```

#### הוספת דירוג לקורס
```http
POST /api/courses/{id}/ratings
```

### הרשמה לקורס

#### הרשמה לקורס
```http
POST /api/courses/{id}/enroll
```

#### ביטול הרשמה לקורס
```http
DELETE /api/courses/{id}/enroll
```

### חיפוש

#### חיפוש גלובלי
```http
GET /api/search?q={query}&type={type}
```
**פרמטרים:**
- `q` - מחרוזת החיפוש (חובה)
- `type` - סוג התוצאות (אופציונלי): courses, lessons, instructors

### פרופיל

#### קבלת פרופיל משתמש
```http
GET /api/profile
```

#### עדכון פרופיל משתמש
```http
PUT /api/profile
```

### התראות

#### קבלת התראות
```http
GET /api/notifications
```

#### סימון התראה כנקראה
```http
PATCH /api/notifications/{id}
```

## דוגמאות

### דוגמה לבקשת הרשמה לקורס
```javascript
const response = await fetch(`/api/courses/${courseId}/enroll`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payment_method_id: 'pm_123',
    coupon_code: 'WELCOME10'
  })
})
```

### דוגמה לעדכון התקדמות
```javascript
const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    completed: true,
    progress: 100
  })
})
``` 