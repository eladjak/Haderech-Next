# הגדרת אימות לפרויקט "הדרך" 🔐

מסמך זה מכיל הנחיות מקוצרות להגדרת אימות ב"הדרך" וכיצד להשיג את המפתחות האמיתיים לשירותי אימות חברתי. למידע מפורט יותר, ראה את [הגדרת אימות חברתי](./social-auth-setup.md).

## מפתחות נדרשים 🔑

כדי שהאימות החברתי יעבוד, אתה צריך להשיג את המפתחות הבאים:

### Google OAuth

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Facebook OAuth

- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

### Microsoft OAuth

- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`

## מדריך מהיר להשגת המפתחות 🚀

### Google OAuth

1. **צור פרויקט ב-Google Cloud Console**:

   - היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
   - צור פרויקט חדש: לחץ על שם הפרויקט בראש המסך > "New Project"
   - הזן שם לפרויקט (למשל, "HaDerech-Auth") > "Create"

2. **הגדר את מסך ההסכמה (OAuth Consent Screen)**:

   - בתפריט הצד, בחר "APIs & Services" > "OAuth consent screen"
   - בחר "External" > "Create"
   - מלא את הפרטים הנדרשים:
     - App name: "HaDerech"
     - User support email: האימייל שלך
     - Developer contact information: האימייל שלך
   - לחץ "Save and Continue"
   - תחת "Scopes", הוסף את הסקופים: `.../auth/userinfo.email`, `.../auth/userinfo.profile` ו-`openid`
   - לחץ "Save and Continue" > "Back to Dashboard"

3. **צור מזהה לקוח OAuth**:
   - בתפריט הצד, בחר "APIs & Services" > "Credentials"
   - לחץ "Create Credentials" > "OAuth client ID"
   - בחר "Web application"
   - שם: "HaDerech Web Client"
   - הוסף URIs מורשים להפניה מחדש:
     - `https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (לפיתוח מקומי)
   - לחץ "Create"
   - העתק את ה-Client ID וה-Client Secret

### Facebook OAuth

1. **צור אפליקציית Facebook**:

   - היכנס ל-[Facebook for Developers](https://developers.facebook.com/)
   - לחץ "My Apps" > "Create App"
   - בחר "Consumer" > "Next"
   - הזן שם לאפליקציה, אימייל קשר ומטרה > "Create App"

2. **הגדר את Facebook Login**:

   - לחץ "Add Products" בתפריט הצד
   - בחר "Facebook Login" > "Web"
   - הזן את כתובת האתר: `https://haderech-next.vercel.app/`
   - לחץ "Save"

3. **קבע הגדרות עבור Facebook Login**:

   - בתפריט הצד, לחץ "Facebook Login" > "Settings"
   - תחת "Valid OAuth Redirect URIs" הוסף:
     - `https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (לפיתוח מקומי)
   - לחץ "Save Changes"

4. **קבל את מזהי האפליקציה**:
   - בתפריט הצד, לחץ על "Settings" > "Basic"
   - העתק את App ID (זה ה-Client ID)
   - הצג ואז העתק את App Secret

### Microsoft OAuth

1. **הירשם לפלטפורמת הזהות של Microsoft**:

   - היכנס ל-[Azure Portal](https://portal.azure.com/)
   - בתפריט הצד, בחר "Azure Active Directory"
   - בחר "App registrations" > "New registration"

2. **הגדר את האפליקציה**:

   - שם: "HaDerech"
   - סוג חשבון נתמך: "Accounts in any organizational directory and personal Microsoft accounts"
   - URI הפניה מחדש: בחר "Web" >"https://rxxwoaxxydmwdhgdryea.supabase.co/auth/v1/callback"
   - לחץ "Register"

3. **קבל את ה-Client ID**:

   - בדף סקירת האפליקציה, העתק את "Application (client) ID"

4. **צור את ה-Client Secret**:
   - בתפריט הצד של ההרשמה, בחר "Certificates & secrets"
   - לחץ "New client secret"
   - הזן תיאור וזמן תפוגה > "Add"
   - **חשוב**: העתק מיד את ערך ה-Client secret (יוצג רק פעם אחת!)

## הגדרת Supabase עם המפתחות 🔧

1. **עדכן את Provider Settings ב-Supabase**:

   - גש ל-[Supabase Dashboard](https://app.supabase.com/)
   - בחר את הפרויקט שלך
   - לחץ על "Authentication" בתפריט הצד
   - בחר "Providers"
   - הפעל את הספקים (Google, Facebook, Microsoft) והזן את המפתחות והסודות המתאימים

2. **הגדר כתובות URL להפניה מחדש**:
   - בתפריט Authentication, בחר "URL Configuration"
   - הוסף את הכתובת: `https://haderech-next.vercel.app/auth/callback`
   - לפיתוח מקומי, הוסף גם: `http://localhost:3000/auth/callback`

## עדכון קובץ .env 📝

לאחר שהשגת את כל המפתחות, עדכן את קובץ ה-`.env` שלך ואת משתני הסביבה ב-Vercel:

1. **עדכן את קובץ `.env` המקומי**:

   ```
   GOOGLE_CLIENT_ID=your-real-google-client-id
   GOOGLE_CLIENT_SECRET=your-real-google-client-secret
   FACEBOOK_CLIENT_ID=your-real-facebook-app-id
   FACEBOOK_CLIENT_SECRET=your-real-facebook-app-secret
   MICROSOFT_CLIENT_ID=your-real-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-real-microsoft-client-secret
   ```

2. **עדכן את המשתנים ב-Vercel**:
   - גש ל-[Vercel Dashboard](https://vercel.com/)
   - בחר את הפרויקט שלך
   - גש ל-"Settings" > "Environment Variables"
   - הוסף או עדכן את המשתנים הנ"ל
   - לחץ על "Deploy" כדי ליצור פריסה מחדש של האפליקציה

## פתרון בעיות נפוצות ❓

### בעיה: שגיאת "Invalid Redirect URI"

**פתרון**: וודא שהכתובות להפניה מחדש תואמות בדיוק בין ספק האימות (Google/Facebook/Microsoft) ל-Supabase.

### בעיה: שגיאת "Invalid Client ID"

**פתרון**: בדוק שהעתקת את ה-Client ID הנכון וללא רווחים או תווים נוספים.

### בעיה: האימות מצליח אך המשתמש לא מועבר לאפליקציה

**פתרון**: וודא שהגדרת נכון את כתובות Redirect ב-Supabase וב-`GOOGLE_REDIRECT_URI`.

---

למידע נוסף והוראות מפורטות יותר, ראה את [התיעוד המלא לאימות חברתי](./social-auth-setup.md).

בהצלחה! 🌟
