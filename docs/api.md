# 📚 תיעוד API - הדרך

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