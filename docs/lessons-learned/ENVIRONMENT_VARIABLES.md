# ניהול משתני סביבה ב-Next.js

<div dir="rtl">

## תוכן עניינים

1. [רקע](#רקע)
2. [אתגרים שנתקלנו בהם](#אתגרים-שנתקלנו-בהם)
3. [פתרונות שיישמנו](#פתרונות-שיישמנו)
4. [שיטות מומלצות](#שיטות-מומלצות)
5. [כלים ותשתיות](#כלים-ותשתיות)
6. [תיעוד תשתיות](#תיעוד-תשתיות)

## רקע

פרויקט HaDerech משתמש במספר שירותים חיצוניים הדורשים מפתחות API ומשתני סביבה שונים, ביניהם:

- מערכת אימות עם Google
- ממשק Supabase לאחסון הנתונים והגדרות
- מערכות תשלום ואימייל

בתחילת הפרויקט, לא היתה הפרדה מספקת בין המשתנים הנדרשים לסביבת הפיתוח, סביבת הטסטים וסביבת הייצור. כמו כן, לא היה מנגנון תקין לטיפול במקרים בהם משתנים מסוימים לא היו זמינים.

## אתגרים שנתקלנו בהם

### 1. שגיאות בנייה בסביבת Vercel

בניית הפרויקט ב-Vercel נכשלה פעמים רבות עקב חוסר במשתני סביבה. הבעיות העיקריות היו:

- שגיאות מסוג `Invalid environment variables`
- עצירה של תהליך הבנייה במהלך הפעולה `Collecting page data`
- חוסר בהגדרת משתני סביבה חיוניים כמו `GOOGLE_CLIENT_ID` ו-`GOOGLE_CLIENT_SECRET`

### 2. שגיאות בצד הלקוח

גם לאחר שהבנייה הצליחה, התקבלו שגיאות בצד הלקוח:

- חוסר יכולת לגשת למשתני סביבה בצד הלקוח
- שגיאות בטעינת שירותים כמו Supabase בגלל חוסר במשתני הסביבה המתאימים

### 3. הגדרות קשיחות מדי

ההגדרות ב-`src/env.mjs` דרשו שכל המשתנים יהיו מוגדרים, ללא הבחנה בין:

- משתנים הכרחיים שבלעדיהם האפליקציה לא יכולה לתפקד כלל
- משתנים שנדרשים רק בסביבות מסוימות
- משתנים שנדרשים רק לתכונות מסוימות שאינן חלק מהליבה

## פתרונות שיישמנו

### 1. הגדרת משתנים אופציונליים בסביבות ייצור

יצרנו פונקציית עזר `optionalInBuild` שמגדירה משתנים כאופציונליים בסביבת הייצור:

```js
// src/env.mjs
const optionalInBuild = (schema) => {
  return process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "production"
    ? schema.optional()
    : schema;
};

export const env = createEnv({
  server: {
    // משתנים חיוניים תמיד נדרשים
    DATABASE_URL: z.string().url(),

    // משתנים שאינם נדרשים בסביבת הייצור
    GOOGLE_CLIENT_ID: optionalInBuild(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: optionalInBuild(z.string().min(1)),
    // ...
  },
});
```

### 2. מנגנוני גיבוי ואיתור שגיאות

בתוך השירותים השונים, הוספנו מנגנוני גיבוי שיצרו גרסאות "דמה" של השירות במקרה שמשתני הסביבה הנדרשים אינם זמינים:

```js
// src/lib/services/supabase.ts
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

const supabaseUrl = getEnvironmentVariable("SUPABASE_URL");
const supabaseKey = getEnvironmentVariable("SUPABASE_ANON_KEY");

// יצירת גרסת דמה של הלקוח במקרה שהמפתחות אינם זמינים
function createDummyClient() {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Using dummy Supabase client due to missing environment variables"
    );
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      // יתר המתודות עם ערכי ברירת מחדל
    },
    // יתר האובייקטים עם ערכי ברירת מחדל
  };
}

export const client =
  supabaseKey && supabaseUrl
    ? createRealClient(supabaseKey, supabaseUrl)
    : createDummyClient();
```

### 3. הגדרת משתנים בסביבת Vercel

הוספנו את המשתנים הנדרשים בממשק הניהול של Vercel בהתאם לצורכי הסביבה:

- הגדרת משתנים שונים לסביבות פיתוח, בדיקות וייצור
- וידוא שמשתנים רגישים נשמרים כמשתנים מוצפנים

## שיטות מומלצות

### 1. סימון והבחנה בין סוגי משתנים

```js
// משתנים בסיסיים שנדרשים תמיד בכל הסביבות
REQUIRED_CORE: z.string(),

// משתנים שנדרשים רק בסביבת פיתוח
requiredInDev(z.string()),

// משתנים שנדרשים רק בסביבת ייצור
requiredInProd(z.string()),

// משתנים אופציונליים בכל הסביבות
OPTIONAL_VAR: z.string().optional(),
```

### 2. תיעוד משתני הסביבה

יצירת קובץ `.env.example` שמכיל את כל המשתנים הנדרשים עם הסברים:

```
# Core Database
DATABASE_URL="postgresql://..."                # חיבור לבסיס הנתונים המרכזי

# Authentication Services
GOOGLE_CLIENT_ID="..."                         # מזהה לקוח של Google (נדרש לסביבת פיתוח בלבד)
GOOGLE_CLIENT_SECRET="..."                     # מפתח סודי של Google (נדרש לסביבת פיתוח בלבד)

# Optional Services
EMAIL_SERVER="..."                             # שרת אימייל (אופציונלי, נדרש רק לשליחת אימיילים)
```

### 3. בדיקות אוטומטיות למשתני סביבה

יצירת בדיקות אוטומטיות שמוודאות שכל המשתנים הנדרשים קיימים בסביבה:

```js
// scripts/validate-env.js
const requiredVars = [
  "DATABASE_URL",
  // ...
];

function validateEnv() {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }
}

validateEnv();
```

## כלים ותשתיות

### 1. שימוש ב-@t3-oss/env-nextjs

הספרייה `@t3-oss/env-nextjs` מספקת פתרון מצוין לוולידציה של משתני סביבה:

```js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // משתני צד שרת
  },
  client: {
    // משתני צד לקוח (רק עם NEXT_PUBLIC_)
  },
  runtimeEnv: process.env,
});
```

### 2. שימוש ב-GitHub Secrets

לאחסון מאובטח של סודות ומשתני סביבה בתהליך ה-CI/CD:

- הגדרת סודות ב-GitHub Repository Settings
- שימוש בסודות ב-GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          # ...
```

## תיעוד תשתיות

| סביבה       | משתני סביבה נדרשים               | מיקום הגדרות                      |
| ----------- | -------------------------------- | --------------------------------- |
| פיתוח מקומי | כל המשתנים בקובץ `.env.local`    | קובץ `.env.local` בתיקיית הפרויקט |
| בדיקות CI   | משתנים חיוניים בלבד              | GitHub Secrets                    |
| קדם-ייצור   | משתנים חיוניים + משתני קדם-ייצור | ממשק Vercel (סביבת Preview)       |
| ייצור       | משתנים חיוניים + משתני ייצור     | ממשק Vercel (סביבת Production)    |

</div>

# Managing Environment Variables in Next.js

<div dir="ltr">

## Table of Contents

1. [Background](#background)
2. [Challenges We Faced](#challenges-we-faced)
3. [Solutions Implemented](#solutions-implemented)
4. [Best Practices](#best-practices)
5. [Tools and Infrastructure](#tools-and-infrastructure)
6. [Infrastructure Documentation](#infrastructure-documentation)

## Background

The HaDerech project uses several external services that require API keys and various environment variables, including:

- Google authentication system
- Supabase interface for data storage and settings
- Payment and email systems

At the beginning of the project, there was not sufficient separation between variables required for the development environment, testing environment, and production environment. Additionally, there was no proper mechanism for handling cases where certain variables were not available.

## Challenges We Faced

### 1. Build Errors in Vercel Environment

Building the project in Vercel failed many times due to missing environment variables. The main issues were:

- Errors of type `Invalid environment variables`
- Halting of the build process during the `Collecting page data` operation
- Lack of definition for essential environment variables such as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 2. Client-Side Errors

Even after the build was successful, errors were received on the client side:

- Inability to access environment variables on the client side
- Errors loading services such as Supabase due to missing appropriate environment variables

### 3. Overly Rigid Definitions

The definitions in `src/env.mjs` required that all variables be defined, without distinguishing between:

- Essential variables without which the application cannot function at all
- Variables required only in certain environments
- Variables required only for certain features that are not part of the core

## Solutions Implemented

### 1. Defining Optional Variables in Production Environments

We created a helper function `optionalInBuild` that defines variables as optional in the production environment:

```js
// src/env.mjs
const optionalInBuild = (schema) => {
  return process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "production"
    ? schema.optional()
    : schema;
};

export const env = createEnv({
  server: {
    // Essential variables are always required
    DATABASE_URL: z.string().url(),

    // Variables not required in the production environment
    GOOGLE_CLIENT_ID: optionalInBuild(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: optionalInBuild(z.string().min(1)),
    // ...
  },
});
```

### 2. Backup Mechanisms and Error Detection

Within the various services, we added backup mechanisms that created "dummy" versions of the service in case the required environment variables were not available:

```js
// src/lib/services/supabase.ts
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

const supabaseUrl = getEnvironmentVariable("SUPABASE_URL");
const supabaseKey = getEnvironmentVariable("SUPABASE_ANON_KEY");

// Creating a dummy version of the client in case the keys are not available
function createDummyClient() {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Using dummy Supabase client due to missing environment variables"
    );
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      // Other methods with default values
    },
    // Other objects with default values
  };
}

export const client =
  supabaseKey && supabaseUrl
    ? createRealClient(supabaseKey, supabaseUrl)
    : createDummyClient();
```

### 3. Setting Variables in Vercel Environment

We added the required variables in the Vercel management interface according to the environment needs:

- Setting different variables for development, testing, and production environments
- Ensuring sensitive variables are stored as encrypted variables

## Best Practices

### 1. Marking and Distinguishing Between Types of Variables

```js
// Basic variables that are always required in all environments
REQUIRED_CORE: z.string(),

// Variables required only in the development environment
requiredInDev(z.string()),

// Variables required only in the production environment
requiredInProd(z.string()),

// Optional variables in all environments
OPTIONAL_VAR: z.string().optional(),
```

### 2. Documenting Environment Variables

Creating a `.env.example` file that contains all required variables with explanations:

```
# Core Database
DATABASE_URL="postgresql://..."                # Connection to the central database

# Authentication Services
GOOGLE_CLIENT_ID="..."                         # Google client ID (required for development environment only)
GOOGLE_CLIENT_SECRET="..."                     # Google secret key (required for development environment only)

# Optional Services
EMAIL_SERVER="..."                             # Email server (optional, required only for sending emails)
```

### 3. Automatic Tests for Environment Variables

Creating automatic tests that verify that all required variables exist in the environment:

```js
// scripts/validate-env.js
const requiredVars = [
  "DATABASE_URL",
  // ...
];

function validateEnv() {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }
}

validateEnv();
```

## Tools and Infrastructure

### 1. Using @t3-oss/env-nextjs

The `@t3-oss/env-nextjs` library provides an excellent solution for validating environment variables:

```js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Server-side variables
  },
  client: {
    // Client-side variables (only with NEXT_PUBLIC_)
  },
  runtimeEnv: process.env,
});
```

### 2. Using GitHub Secrets

For secure storage of secrets and environment variables in the CI/CD process:

- Setting secrets in GitHub Repository Settings
- Using secrets in GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          # ...
```

## Infrastructure Documentation

| Environment       | Required Environment Variables                 | Definition Location                       |
| ----------------- | ---------------------------------------------- | ----------------------------------------- |
| Local Development | All variables in `.env.local` file             | `.env.local` file in project directory    |
| CI Tests          | Essential variables only                       | GitHub Secrets                            |
| Pre-production    | Essential variables + pre-production variables | Vercel interface (Preview environment)    |
| Production        | Essential variables + production variables     | Vercel interface (Production environment) |

</div>
