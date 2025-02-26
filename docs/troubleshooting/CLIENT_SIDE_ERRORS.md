# פתרון שגיאות צד לקוח ב-Next.js 14

<div dir="rtl">

## תוכן עניינים

1. [סוגי שגיאות נפוצות](#סוגי-שגיאות-נפוצות)
2. [שגיאות הידרציה](#שגיאות-הידרציה)
3. [שגיאות משתני סביבה](#שגיאות-משתני-סביבה)
4. [שגיאות תצורה](#שגיאות-תצורה)
5. [שיטות מומלצות לפיתוח](#שיטות-מומלצות-לפיתוח)
6. [כלי ניפוי שגיאות](#כלי-ניפוי-שגיאות)
7. [רשימת פתרונות נפוצים](#רשימת-פתרונות-נפוצים)

## סוגי שגיאות נפוצות

שגיאות צד לקוח מתרחשות כאשר האפליקציה כבר נבנתה בהצלחה, אך ישנן בעיות בזמן ריצה בדפדפן. ניתן לחלק אותן למספר קטגוריות:

### שגיאות הידרציה

שגיאות הידרציה מתרחשות כאשר יש אי-התאמה בין ה-HTML שנוצר בשרת לבין המבנה שנוצר בזמן הידרציה בצד הלקוח.

דוגמאות נפוצות:

- `Uncaught TypeError: Cannot read properties of undefined (reading 'appendChild')`
- `Hydration failed because the initial UI does not match what was rendered on the server`
- `Text content does not match server-rendered HTML`

### שגיאות משתני סביבה

שגיאות הקשורות למשתני סביבה מתרחשות כאשר הקוד מנסה לגשת למשתני סביבה שאינם זמינים בצד הלקוח או שיש בעיות בקריאה שלהם.

דוגמאות נפוצות:

- `Invalid environment variables`
- `ReferenceError: process is not defined`
- `Cannot read properties of undefined (reading 'NEXT_PUBLIC_...')`

### שגיאות תצורה

שגיאות תצורה מתרחשות כאשר יש בעיות בהגדרות של Next.js או ספריות אחרות.

דוגמאות נפוצות:

- `Invalid next.config.js options detected`
- `Invalid literal value, expected false at "i18n.localeDetection"`

## שגיאות הידרציה

### הבעיה

הידרציה היא התהליך שבו React "מחיה" את ה-HTML הסטטי שנוצר בשרת. שגיאות הידרציה מתרחשות כאשר יש הבדל בין מה שנוצר בשרת לבין מה שנוצר בצד הלקוח.

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'appendChild')
```

### הפתרון

1. **הפרדת קומפוננטות לצד לקוח וצד שרת**:

   ```tsx
   // שימוש ב-server component לחלק הסטטי
   // src/app/page.tsx
   import AboutPage from "@/components/AboutPage";

   export default function Page() {
     return <AboutPage />;
   }

   // שימוש ב-client component לחלק האינטראקטיבי
   // src/components/AboutPage.tsx
   ("use client");

   import { useState, useEffect } from "react";

   export default function AboutPage() {
     // ...
   }
   ```

2. **שימוש ב-isMounted גישה**:

   ```tsx
   "use client";

   import { useEffect, useState } from "react";

   export default function Component() {
     const [isMounted, setIsMounted] = useState(false);

     useEffect(() => {
       setIsMounted(true);
     }, []);

     // רנדור פשוט יותר בצד השרת
     if (!isMounted) {
       return <div>גרסה פשוטה...</div>;
     }

     // רנדור מלא בצד הלקוח
     return <div>גרסה מלאה...</div>;
   }
   ```

3. **שימוש ב-suppressHydrationWarning**:

   ```tsx
   <div suppressHydrationWarning>
     {typeof window !== "undefined" ? new Date().toLocaleTimeString() : ""}
   </div>
   ```

4. **בדיקות קיום לפני גישה**:

   ```tsx
   // במקום
   element.appendChild(child);

   // להשתמש ב
   if (element && typeof element.appendChild === "function") {
     element.appendChild(child);
   }
   ```

## שגיאות משתני סביבה

### הבעיה

משתני סביבה בצד השרת (עם הקידומת `NEXT_PUBLIC_`) אמורים להיות נגישים גם בצד הלקוח, אך לעתים יש בעיות גישה אליהם.

```
Invalid environment variables: ...
```

### הפתרון

1. **שימוש ב-optionalInBuild**:

   ```ts
   // src/env.mjs
   const optionalInBuild = (schema) => {
     return process.env.VERCEL_ENV === "preview" ||
       process.env.VERCEL_ENV === "production"
       ? schema.optional()
       : schema;
   };

   // ...
   export const env = createEnv({
     server: {
       // ...
       GOOGLE_CLIENT_ID: optionalInBuild(z.string().min(1)),
     },
   });
   ```

2. **טיפול בבעיות גישה למשתני סביבה**:

   ```ts
   // פונקציית עזר לגישה למשתני סביבה
   function getEnvironmentVariable(key) {
     try {
       return env[key] || "";
     } catch (error) {
       try {
         return process.env[key] || "";
       } catch (e) {
         console.error(`Failed to access env var: ${key}`);
         return "";
       }
     }
   }
   ```

3. **יצירת גיבוי למקרה של משתני סביבה חסרים**:

   ```ts
   // יצירת אובייקט דמה לשירותים כגון Supabase
   function createDummyClient() {
     return {
       auth: {
         getSession: async () => ({ data: { session: null }, error: null }),
         // ...יתר המתודות עם ערכי ברירת מחדל
       },
       // ...יתר האובייקטים עם ערכי ברירת מחדל
     };
   }

   // שימוש באובייקט הדמה כאשר חסרים משתני סביבה
   export const client =
     apiKey && apiUrl ? createRealClient(apiKey, apiUrl) : createDummyClient();
   ```

## שגיאות תצורה

### הבעיה

שגיאות תצורה מתרחשות כאשר הגדרות ה-Next.js שגויות או לא תואמות לדרישות.

```
Invalid next.config.js options detected:
Invalid literal value, expected false at "i18n.localeDetection"
```

### הפתרון

1. **וידוא שערכי ה-next.config.js הם מהסוג הנכון**:

   ```js
   // שגוי
   i18n: {
     locales: ["he", "en"],
     defaultLocale: "he",
     localeDetection: "true", // מחרוזת במקום boolean
   }

   // נכון
   i18n: {
     locales: ["he", "en"],
     defaultLocale: "he",
     localeDetection: false, // ערך בוליאני
   }
   ```

2. **בדיקת התאמה לגרסת Next.js**:

   ```js
   // בגרסאות ישנות
   module.exports = {
     future: {
       webpack5: true,
     },
     // ...
   };

   // בגרסאות חדשות (14+)
   module.exports = {
     // webpack5 כבר ברירת מחדל, הסרת ההגדרה
     // ...
   };
   ```

## שיטות מומלצות לפיתוח

### הפרדת קומפוננטות

1. **הפרדה נכונה בין שרת ולקוח**:

   - שרת: נתונים, מטא-דאטה, רנדור ראשוני
   - לקוח: אינטראקציה, אנימציות, טפסים

2. **פיקוח על "use client"**:
   - השתמש רק בקומפוננטות שממש צריכות להיות בצד הלקוח
   - צמצם את גודל ה"חבילה" של צד הלקוח

### שימוש נבון במשתני סביבה

1. **שמות נכונים**:

   - `NEXT_PUBLIC_` רק למשתנים שצריכים להיות נגישים בצד הלקוח
   - הגדרת משתנים אופציונליים בסביבות ייצור ופיתוח

2. **הגנה מפני שגיאות**:
   - תמיד בדוק אם משתנה סביבה קיים לפני השימוש בו
   - ספק ערכי ברירת מחדל הגיוניים
   - הימנע מהזרקת משתני סביבה ישירות לתוך JSX

### בדיקות הידרציה

1. **בדיקת הידרציה בסביבת פיתוח**:

   - השתמש ב-`next build && next start` לבדיקת בעיות הידרציה
   - בדוק מצבים שונים (עם/בלי JavaScript)

2. **מפרים סביבתיים לחיקוי סביבת ייצור**:
   - `NODE_ENV=production` בסביבת פיתוח
   - הגדרת כל משתני הסביבה הנדרשים

## כלי ניפוי שגיאות

### כלי ניפוי שגיאות קליינט

1. **React DevTools**:

   - מאפשר לבדוק היררכיית קומפוננטות
   - מאפשר לזהות רנדורים מיותרים

2. **קונסול הדפדפן**:

   - בדיקת שגיאות בזמן אמת
   - מיפוי של בעיות הידרציה

3. **Network Tab**:
   - בדיקת בקשות API
   - בדיקת גודל חבילות JavaScript

### כלי ניפוי שגיאות שרת

1. **יומני Vercel**:

   - בדיקת שגיאות בזמן בנייה
   - בדיקת שגיאות בזמן ריצה בשרת

2. **תכונת `DEBUG`**:
   ```bash
   DEBUG=* next dev
   ```

## רשימת פתרונות נפוצים

1. **שגיאת `Cannot read properties of undefined (reading 'appendChild')`**:

   - טיפול: השתמש בטכניקת `isMounted` ובדוק קיום אלמנטים לפני גישה
   - מניעה: הפרד בין קומפוננטות שרת ולקוח, הימנע מקוד DOM ישיר ב-SSR

2. **שגיאת `Invalid environment variables`**:

   - טיפול: הוסף `SKIP_ENV_VALIDATION=true`, השתמש ב-`optionalInBuild`
   - מניעה: הגדר את כל משתני הסביבה הנדרשים בסביבות השונות

3. **שגיאת `Invalid next.config.js options`**:

   - טיפול: וודא שסוגי הערכים בקובץ התצורה נכונים (מספרים, בוליאנים, מחרוזות)
   - מניעה: בדוק בדיקות סוג לפני הפריסה, השתמש ב-TypeScript גם לקבצי תצורה

4. **שגיאות בטעינת דפי `about` או עמודים חסרים**:
   - טיפול: צור את הדפים החסרים, וודא שהנתיבים המוגדרים ב-router קיימים במערכת הקבצים
   - מניעה: צור רשימת כל הנתיבים הנדרשים ווידא שהם קיימים לפני הפריסה

</div>

# Fixing Client-Side Errors in Next.js 14

<div dir="ltr">

## Table of Contents

1. [Common Error Types](#common-error-types)
2. [Hydration Errors](#hydration-errors)
3. [Environment Variable Errors](#environment-variable-errors)
4. [Configuration Errors](#configuration-errors)
5. [Best Development Practices](#best-development-practices)
6. [Debugging Tools](#debugging-tools)
7. [Common Solutions Checklist](#common-solutions-checklist)

## Common Error Types

Client-side errors occur when the application has built successfully, but there are runtime issues in the browser. They can be categorized into several types:

### Hydration Errors

Hydration errors occur when there is a mismatch between the HTML generated on the server and the structure created during hydration on the client.

Common examples:

- `Uncaught TypeError: Cannot read properties of undefined (reading 'appendChild')`
- `Hydration failed because the initial UI does not match what was rendered on the server`
- `Text content does not match server-rendered HTML`

### Environment Variable Errors

Errors related to environment variables occur when the code attempts to access environment variables that are not available on the client side or there are issues reading them.

Common examples:

- `Invalid environment variables`
- `ReferenceError: process is not defined`
- `Cannot read properties of undefined (reading 'NEXT_PUBLIC_...')`

### Configuration Errors

Configuration errors occur when there are issues with Next.js settings or other libraries.

Common examples:

- `Invalid next.config.js options detected`
- `Invalid literal value, expected false at "i18n.localeDetection"`

## Hydration Errors

### The Problem

Hydration is the process where React "brings to life" the static HTML generated on the server. Hydration errors occur when there is a difference between what was generated on the server and what is created on the client side.

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'appendChild')
```

### The Solution

1. **Separate Components into Client and Server**:

   ```tsx
   // Use server component for static part
   // src/app/page.tsx
   import AboutPage from "@/components/AboutPage";

   export default function Page() {
     return <AboutPage />;
   }

   // Use client component for interactive part
   // src/components/AboutPage.tsx
   ("use client");

   import { useState, useEffect } from "react";

   export default function AboutPage() {
     // ...
   }
   ```

2. **Use the isMounted Approach**:

   ```tsx
   "use client";

   import { useEffect, useState } from "react";

   export default function Component() {
     const [isMounted, setIsMounted] = useState(false);

     useEffect(() => {
       setIsMounted(true);
     }, []);

     // Simpler render on server
     if (!isMounted) {
       return <div>Simple version...</div>;
     }

     // Full render on client
     return <div>Full version...</div>;
   }
   ```

3. **Use suppressHydrationWarning**:

   ```tsx
   <div suppressHydrationWarning>
     {typeof window !== "undefined" ? new Date().toLocaleTimeString() : ""}
   </div>
   ```

4. **Check Existence Before Access**:

   ```tsx
   // Instead of
   element.appendChild(child);

   // Use
   if (element && typeof element.appendChild === "function") {
     element.appendChild(child);
   }
   ```

## Environment Variable Errors

### The Problem

Server-side environment variables (prefixed with `NEXT_PUBLIC_`) should be accessible on the client side, but sometimes there are access issues.

```
Invalid environment variables: ...
```

### The Solution

1. **Use optionalInBuild**:

   ```ts
   // src/env.mjs
   const optionalInBuild = (schema) => {
     return process.env.VERCEL_ENV === "preview" ||
       process.env.VERCEL_ENV === "production"
       ? schema.optional()
       : schema;
   };

   // ...
   export const env = createEnv({
     server: {
       // ...
       GOOGLE_CLIENT_ID: optionalInBuild(z.string().min(1)),
     },
   });
   ```

2. **Handle Access Issues to Environment Variables**:

   ```ts
   // Helper function for accessing environment variables
   function getEnvironmentVariable(key) {
     try {
       return env[key] || "";
     } catch (error) {
       try {
         return process.env[key] || "";
       } catch (e) {
         console.error(`Failed to access env var: ${key}`);
         return "";
       }
     }
   }
   ```

3. **Create Fallbacks for Missing Environment Variables**:

   ```ts
   // Create dummy object for services like Supabase
   function createDummyClient() {
     return {
       auth: {
         getSession: async () => ({ data: { session: null }, error: null }),
         // ...other methods with default values
       },
       // ...other objects with default values
     };
   }

   // Use dummy object when environment variables are missing
   export const client =
     apiKey && apiUrl ? createRealClient(apiKey, apiUrl) : createDummyClient();
   ```

## Configuration Errors

### The Problem

Configuration errors occur when Next.js settings are incorrect or do not match requirements.

```
Invalid next.config.js options detected:
Invalid literal value, expected false at "i18n.localeDetection"
```

### The Solution

1. **Ensure next.config.js Values Are of the Correct Type**:

   ```js
   // Incorrect
   i18n: {
     locales: ["he", "en"],
     defaultLocale: "he",
     localeDetection: "true", // string instead of boolean
   }

   // Correct
   i18n: {
     locales: ["he", "en"],
     defaultLocale: "he",
     localeDetection: false, // boolean value
   }
   ```

2. **Check Compatibility with Next.js Version**:

   ```js
   // In older versions
   module.exports = {
     future: {
       webpack5: true,
     },
     // ...
   };

   // In newer versions (14+)
   module.exports = {
     // webpack5 is already default, remove setting
     // ...
   };
   ```

## Best Development Practices

### Component Separation

1. **Proper Separation Between Server and Client**:

   - Server: Data, metadata, initial rendering
   - Client: Interaction, animations, forms

2. **Control "use client"**:
   - Use only in components that really need to be on the client side
   - Minimize the size of the client "bundle"

### Wise Use of Environment Variables

1. **Correct Names**:

   - `NEXT_PUBLIC_` only for variables that need to be accessible on the client side
   - Define optional variables in production and development environments

2. **Protection Against Errors**:
   - Always check if an environment variable exists before using it
   - Provide sensible default values
   - Avoid injecting environment variables directly into JSX

### Hydration Testing

1. **Testing Hydration in Development Environment**:

   - Use `next build && next start` to check for hydration issues
   - Test different states (with/without JavaScript)

2. **Environmental Parameters to Simulate Production Environment**:
   - `NODE_ENV=production` in development environment
   - Set all required environment variables

## Debugging Tools

### Client-Side Debugging Tools

1. **React DevTools**:

   - Allows checking component hierarchy
   - Allows identifying unnecessary renders

2. **Browser Console**:

   - Real-time error checking
   - Mapping of hydration issues

3. **Network Tab**:
   - API request checking
   - JavaScript bundle size checking

### Server-Side Debugging Tools

1. **Vercel Logs**:

   - Check for errors during build
   - Check for runtime errors on the server

2. **DEBUG Feature**:
   ```bash
   DEBUG=* next dev
   ```

## Common Solutions Checklist

1. **Error `Cannot read properties of undefined (reading 'appendChild')`**:

   - Fix: Use the `isMounted` technique and check element existence before access
   - Prevention: Separate server and client components, avoid direct DOM code in SSR

2. **Error `Invalid environment variables`**:

   - Fix: Add `SKIP_ENV_VALIDATION=true`, use `optionalInBuild`
   - Prevention: Define all required environment variables in different environments

3. **Error `Invalid next.config.js options`**:

   - Fix: Ensure value types in the configuration file are correct (numbers, booleans, strings)
   - Prevention: Check type checking before deployment, use TypeScript for configuration files too

4. **Errors loading `about` pages or missing pages**:
   - Fix: Create the missing pages, ensure that paths defined in the router exist in the file system
   - Prevention: Create a list of all required paths and verify they exist before deployment

</div>
