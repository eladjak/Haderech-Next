# הגדרת אימות חברתי (OAuth) 🔑

מסמך זה מפרט את השלבים הדרושים להגדרת אימות באמצעות חשבונות חברתיים (גוגל, פייסבוק, מייקרוסופט) עבור פרויקט "הדרך".

## תוכן עניינים

1. [מבוא](#מבוא)
2. [הגדרת Google OAuth](#הגדרת-google-oauth)
3. [הגדרת Facebook OAuth](#הגדרת-facebook-oauth)
4. [הגדרת Microsoft OAuth](#הגדרת-microsoft-oauth)
5. [הגדרת Supabase](#הגדרת-supabase)
6. [עדכון קובץ .env](#עדכון-קובץ-env)
7. [בדיקות והתאמות נוספות](#בדיקות-והתאמות-נוספות)

## מבוא

אימות חברתי (Social Authentication) מאפשר למשתמשים להתחבר לאפליקציה באמצעות חשבונות קיימים כמו Google, Facebook ו-Microsoft. הדבר משפר את חווית המשתמש ומגביר את האבטחה.

בפרויקט "הדרך" אנו משתמשים ב-Supabase לניהול האימות, המאפשר אינטגרציה פשוטה עם ספקי אימות חברתיים.

## הגדרת Google OAuth

1. **גש ל-Google Cloud Console**:

   - היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
   - צור פרויקט חדש או בחר פרויקט קיים

2. **הגדר את מסך ההסכמה (OAuth Consent Screen)**:

   - גש ל-"APIs & Services" > "OAuth consent screen"
   - בחר סוג משתמש (חיצוני/פנימי)
   - הזן פרטי אפליקציה: שם אפליקציה, אימייל תמיכה, לוגו (אופציונלי)
   - הוסף דומיינים מורשים: `haderech-next.vercel.app`
   - שמור והמשך

3. **צור מזהה OAuth 2.0**:
   - גש ל-"APIs & Services" > "Credentials"
   - לחץ על "Create Credentials" > "OAuth client ID"
   - בחר סוג אפליקציה: "Web application"
   - הזן שם לסוג המזהה
   - הוסף URI להפניה מחדש: `https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback`
   - לחץ "Create"
   - העתק את Client ID ואת Client Secret

## הגדרת Facebook OAuth

1. **צור אפליקציית Facebook**:

   - גש ל-[Facebook Developers](https://developers.facebook.com/)
   - לחץ על "My Apps" > "Create App"
   - בחר סוג אפליקציה: "Consumer" או "Business"
   - הזן שם לאפליקציה ופרטי יצירת קשר
   - לחץ "Create App"

2. **הוסף מוצר Facebook Login**:

   - בתפריט הצד, בחר ב-"Products" > "+" > "Facebook Login"
   - בחר "Web"
   - הזן את כתובת האתר: `https://haderech-next.vercel.app/`
   - שמור

3. **קבע הגדרות Facebook Login**:

   - בתפריט הצד, לחץ על "Facebook Login" > "Settings"
   - תחת "Valid OAuth Redirect URIs" הוסף: `https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback`
   - שמור שינויים

4. **קבל את App ID ו-App Secret**:
   - גש ל-"Settings" > "Basic"
   - העתק את App ID ו-App Secret

## הגדרת Microsoft OAuth

1. **הירשם ל-Microsoft Identity Platform**:

   - גש ל-[Azure Portal](https://portal.azure.com/)
   - נווט ל-"Azure Active Directory" > "App registrations"
   - לחץ על "New registration"

2. **הגדר את האפליקציה**:

   - הזן שם לאפליקציה
   - בחר "Accounts in any organizational directory and personal Microsoft accounts"
   - תחת "Redirect URI", בחר "Web" והזן: `https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback`
   - לחץ "Register"

3. **קבל מזהה אפליקציה וסוד**:
   - העתק את "Application (client) ID"
   - גש ל-"Certificates & secrets" > "Client secrets" > "New client secret"
   - הזן תיאור, בחר תוקף (Expiry), ולחץ "Add"
   - העתק את ערך הסוד (זמין רק פעם אחת)

## הגדרת Supabase

1. **גש לפרויקט Supabase**:

   - היכנס ל-[Supabase Dashboard](https://app.supabase.io/)
   - בחר את הפרויקט "Haderech-Next"

2. **הגדר ספקי אימות**:

   - גש ל-"Authentication" > "Providers"
   - הפעל את הספקים הרצויים (Google, Facebook, Microsoft) והזן את המזהים והסודות שהשגת

3. **הגדר נתיבי Redirect**:
   - גש ל-"Authentication" > "URL Configuration"
   - תחת "Redirect URLs" הוסף: `https://haderech-next.vercel.app/auth/callback`
   - שמור שינויים

## עדכון קובץ .env

עדכן את קובץ ה-`.env` עם המפתחות והסודות שהשגת:

```env
# Google Auth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook Auth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Microsoft Auth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

הוסף גם את ערכי הסביבה הבאים ל-Vercel:

1. גש ל-[Vercel Dashboard](https://vercel.com/)
2. בחר את פרויקט "Haderech-Next"
3. גש ל-"Settings" > "Environment Variables"
4. הוסף את המשתנים שצוינו לעיל

## בדיקות והתאמות נוספות

לאחר הגדרת האימות החברתי, מומלץ לבצע את הבדיקות הבאות:

1. **בדוק את תהליך ההתחברות**:

   - נסה להתחבר באמצעות כל אחד מהספקים
   - וודא שהמשתמש מועבר בהצלחה לאפליקציה לאחר האימות

2. **בדוק את הרשאות המשתמש**:

   - וודא שמשתמשים שהתחברו באמצעות אימות חברתי מקבלים את ההרשאות המתאימות

3. **בדוק את תהליך ההתנתקות**:

   - וודא שהמשתמש יכול להתנתק בהצלחה

4. **בדיקת שגיאות**:
   - בדוק את התנהגות האפליקציה במקרה של שגיאות אימות
   - וודא שיש הודעות שגיאה ברורות למשתמש

---

למידע נוסף, ראה את התיעוד הרשמי:

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login/)
- [Microsoft Authentication](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
