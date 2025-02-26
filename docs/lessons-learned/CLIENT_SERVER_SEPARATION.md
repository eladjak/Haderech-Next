# הפרדה נכונה בין צד לקוח וצד שרת ב-Next.js 14

<div dir="rtl">

## תוכן עניינים

1. [רקע](#רקע)
2. [אתגרים שנתקלנו בהם](#אתגרים-שנתקלנו-בהם)
3. [הפתרונות שיישמנו](#הפתרונות-שיישמנו)
4. [שיטות מומלצות](#שיטות-מומלצות)
5. [כלי פיתוח וניפוי שגיאות](#כלי-פיתוח-וניפוי-שגיאות)
6. [רשימת בדיקות](#רשימת-בדיקות)

## רקע

Next.js 14 מציע מודל רנדור היברידי הכולל רכיבי שרת (Server Components) ורכיבי לקוח (Client Components). פרויקט HaDerech התחיל עם מחשבה על גישה היברידית זו, אך עם התקדמות הפיתוח נתקלנו באתגרים הקשורים להפרדה הנכונה בין קוד צד לקוח וצד שרת.

הבנה נכונה של מודל הרנדור ב-Next.js 14 היא חיונית:

- רכיבי שרת (Server Components) רצים רק בצד השרת ומאפשרים גישה ישירה למסדי נתונים וAPI ללא צורך בבקשות נוספות.
- רכיבי לקוח (Client Components) רצים גם בצד הלקוח ומאפשרים אינטראקטיביות, שימוש ב-hooks של React ואירועי משתמש.

## אתגרים שנתקלנו בהם

### 1. שגיאות הידרציה

שגיאות מסוג `Hydration failed` ו-`Cannot read properties of undefined (reading 'appendChild')` היו נפוצות בפרויקט:

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'appendChild')
```

גורמים עיקריים:

- שימוש בקוד צד לקוח (כמו `window` או `document`) בתוך רכיבי שרת
- אי התאמה בין הרנדור ההתחלתי בשרת לבין הרנדור בלקוח אחרי הידרציה
- שימוש לא עקבי ב-`use client`

### 2. בעיות בגישה למשתני סביבה

קוד צד לקוח ניסה לגשת למשתני סביבה שרת ללא הגדרות נכונות:

```
Invalid environment variables
```

### 3. ייבוא רכיבי לקוח מרכיבי שרת

ייבוא רכיבי לקוח (עם `use client`) מרכיבי שרת ללא הגדרה נכונה:

```tsx
// לא נכון - ייבוא רכיב לקוח לרכיב שרת ללא ציון use client
import ClientComponent from "@/components/ClientComponent";

// רכיב שרת שמשתמש ברכיב לקוח
export default function ServerComponent() {
  return <ClientComponent />; // שגוי - רכיב לקוח בתוך רכיב שרת ללא סימון מתאים
}
```

### 4. שימוש ב-hooks מחוץ לרכיבי לקוח

שימוש ב-hooks של React (כמו `useState`, `useEffect`) מחוץ להקשר המתאים:

```tsx
// שגוי - שימוש ב-hooks בתוך רכיב שרת
export default function ServerComponent() {
  const [count, setCount] = useState(0); // שגיאה - useState ברכיב שרת

  useEffect(() => {
    console.log("Mounted");
  }, []); // שגיאה - useEffect ברכיב שרת

  return <div>{count}</div>;
}
```

## הפתרונות שיישמנו

### 1. הפרדה נכונה בין עמודים וקומפוננטות

יצרנו מבנה ברור:

- עמודים ברמת השרת (`src/app/page.tsx`) - להגדרת מטא-דאטה ועיטוף של רכיבי לקוח
- קומפוננטות אינטראקטיביות בצד הלקוח (`src/components/HomePage.tsx`) - עם סימון `"use client"`

```tsx
// src/app/page.tsx - רכיב שרת
import { Metadata } from "next";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "HaDerech - פלטפורמת למידה",
  description: "הדרך - מערכת למידה מתקדמת עם תוכן עשיר",
};

export default function Page() {
  // רכיב שרת - מחזיר את רכיב הלקוח
  return <HomePage />;
}
```

```tsx
// src/components/HomePage.tsx - רכיב לקוח
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("HomePage mounted on client");
  }, []);

  // רנדור מינימלי לפני הידרציה
  if (!isMounted) {
    return <div>טוען...</div>;
  }

  // רנדור מלא אחרי הידרציה
  return (
    <div>
      <h1>ברוכים הבאים להדרך</h1>
      {/* תוכן אינטראקטיבי */}
    </div>
  );
}
```

### 2. מנגנון isMounted להתמודדות עם שגיאות הידרציה

יישמנו גישת `isMounted` ברכיבי לקוח כדי לוודא שהקוד פועל רק אחרי הידרציה מלאה:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function ClientComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // גרסה פשוטה יותר לרנדור צד שרת
  if (!isMounted) {
    return <div>גרסה בסיסית לפני הידרציה</div>;
  }

  // גרסה מלאה עם אינטראקטיביות
  return (
    <div>
      <button onClick={() => alert("נלחץ!")}>לחץ עלי</button>
    </div>
  );
}
```

### 3. טיפול בגישה לאובייקטים שקיימים רק בדפדפן

וידאנו שגישה לאובייקטים שקיימים רק בדפדפן (כמו `window` או `document`) מתבצעת רק אחרי הידרציה:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function WindowSizeComponent() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // קריאה לאובייקט window רק בצד הלקוח
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // הימנעות מדליפת מידע על גודל חלון לקוח בזמן רנדור שרת
  if (!isMounted) return <div>טוען...</div>;

  return (
    <div>
      <p>רוחב החלון: {windowSize.width}px</p>
      <p>גובה החלון: {windowSize.height}px</p>
    </div>
  );
}
```

### 4. בדיקות אלמנטים לפני גישה ל-DOM

הוספנו בדיקות קיום לפני גישה לאלמנטי DOM:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function SafeDOMComponent() {
  const elementRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // בדיקת קיום לפני גישה
    if (elementRef.current) {
      // פעולות על ה-DOM
      const element = elementRef.current;
      if (element && typeof element.classList !== "undefined") {
        element.classList.add("highlighted");
      }
    }
  }, []);

  return <div ref={elementRef}>אלמנט עם גישה בטוחה ל-DOM</div>;
}
```

## שיטות מומלצות

### 1. מתי להשתמש ברכיבי שרת

רכיבי שרת מתאימים ל:

- דפים סטטיים או עם מעט אינטראקטיביות
- קבלת נתונים ממסדי נתונים או API
- הגדרת מטא-דאטה לעמודים
- רנדור של תוכן סטטי מורכב

```tsx
// דוגמה לרכיב שרת - אין "use client"
import { db } from "@/lib/db";

export default async function ProductList() {
  // גישה ישירה למסד נתונים בצד השרת
  const products = await db.product.findMany();

  return (
    <div>
      <h2>מוצרים זמינים</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. מתי להשתמש ברכיבי לקוח

רכיבי לקוח מתאימים ל:

- רכיבים אינטראקטיביים (טפסים, כפתורים, תפריטים)
- שימוש ב-hooks של React (`useState`, `useEffect`, וכו')
- גישה לאובייקטים שקיימים רק בדפדפן (`window`, `document`)
- אירועים (`onClick`, `onChange`, וכו')

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>ספירה: {count}</p>
      <button onClick={() => setCount(count + 1)}>הגדל</button>
    </div>
  );
}
```

### 3. שיטת "עיטוף רכיבי לקוח"

שיטה מומלצת: רכיבי שרת מעטפים רכיבי לקוח.

```tsx
// src/app/products/page.tsx - רכיב שרת
import ProductInterface from "@/components/ProductInterface";
import { db } from "@/lib/db";

export default async function ProductsPage() {
  // קוד צד שרת - גישה לנתונים
  const products = await db.product.findMany();

  // העברת הנתונים כ-props לרכיב לקוח
  return <ProductInterface initialProducts={products} />;
}
```

```tsx
// src/components/ProductInterface.tsx - רכיב לקוח
"use client";

import { useState } from "react";
import type { Product } from "@/types";

export default function ProductInterface({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState("");

  // לוגיקת צד לקוח - סינון מוצרים
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="סנן מוצרים..."
      />

      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. העברת נתונים בין שרת ולקוח

המלצות להעברת נתונים מהשרת ללקוח:

- העברת נתונים כ-props לרכיבי לקוח
- שימוש במערכי פיענוח של Next.js (unstable_cache, generateMetadata)
- מניעת העברת נתונים רגישים לצד הלקוח

```tsx
// src/app/user/page.tsx - רכיב שרת
import UserProfile from "@/components/UserProfile";
import { auth } from "@/lib/auth";

export default async function UserPage() {
  // קוד צד שרת - קבלת נתוני משתמש
  const user = await auth.getUser();

  // העברה ללקוח רק של נתונים שאינם רגישים
  const safeUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    // לא כולל סיסמאות, טוקנים וכו'
  };

  return <UserProfile user={safeUserData} />;
}
```

## כלי פיתוח וניפוי שגיאות

### 1. זיהוי שגיאות הידרציה

שיטות לזיהוי שגיאות הידרציה:

- בדוק את הקונסול בדפדפן לאזהרות כמו `Hydration failed...`
- חפש שגיאות `Cannot read properties of undefined`
- בדוק הבדלים בין מצב ההתחלתי (שרת) למצב אחרי הידרציה (לקוח)

### 2. ניתוח הפריסה של רכיבי השרת והלקוח

שימוש ב-Next.js DevTools (או תוספים דומים) לוויזואליזציה של הפרדת רכיבים:

- זיהוי רכיבי שרת (כחול) ורכיבי לקוח (צהוב)
- ניתוח גרף התלויות בין רכיבים
- בדיקת גבולות ההידרציה

### 3. שיטות דיבאג מתקדמות

```bash
# הפעלת Next.js במצב דיבאג מלא
DEBUG=* next dev
```

```tsx
// הוספת דיבאג נקודתי לפונקציות רכיב
useEffect(() => {
  console.log("Component mounted", { props, state });
  console.log("Window object available:", typeof window !== "undefined");
  console.log("DOM ready:", document.readyState);
}, []);
```

## רשימת בדיקות

✅ **בדיקות הפרדת שרת-לקוח**:

1. **כללי**:

   - [ ] כל רכיב לקוח מסומן ב-`"use client"` בתחילת הקובץ
   - [ ] רכיבי שרת לא מנסים להשתמש ב-hooks כמו `useState` או `useEffect`
   - [ ] אין גישה ישירה לאובייקטי `window` או `document` ברכיבי שרת

2. **מניעת שגיאות הידרציה**:

   - [ ] טכניקת `isMounted` מיושמת ברכיבי לקוח מורכבים
   - [ ] רכיבים שמציגים תאריך/שעה משתמשים ב-`suppressHydrationWarning`
   - [ ] רכיבים אינטראקטיביים מוצגים רק לאחר הידרציה מלאה

3. **תכנון נכון**:

   - [ ] עמודים (`pages`) מיישמים בעיקר לוגיקת שרת וקבלת נתונים
   - [ ] קומפוננטות אינטראקטיביות נמצאות בתיקיית `components` ומוגדרות כרכיבי לקוח
   - [ ] שירותים ופונקציות עזר מופרדים לפי צד שרת/לקוח

4. **ביצועים**:
   - [ ] ממזערים את גודל חבילת הלקוח ע"י סימון מינימלי של `"use client"`
   - [ ] נתונים סטטיים מועברים מרכיבי שרת לרכיבי לקוח באופן יעיל
   - [ ] טכניקות Suspense ו-React.lazy מיושמות לטעינה מתאימה

</div>

# Proper Client-Server Separation in Next.js 14

<div dir="ltr">

## Table of Contents

1. [Background](#background)
2. [Challenges We Faced](#challenges-we-faced)
3. [Solutions Implemented](#solutions-implemented)
4. [Best Practices](#best-practices)
5. [Development and Debugging Tools](#development-and-debugging-tools)
6. [Checklist](#checklist)

## Background

Next.js 14 offers a hybrid rendering model that includes Server Components and Client Components. The HaDerech project started with this hybrid approach in mind, but as development progressed, we encountered challenges related to the proper separation of client-side and server-side code.

A correct understanding of the rendering model in Next.js 14 is essential:

- Server Components run only on the server and allow direct access to databases and APIs without additional requests.
- Client Components run on both the client and server and enable interactivity, React hooks usage, and user events.

## Challenges We Faced

### 1. Hydration Errors

Errors like `Hydration failed` and `Cannot read properties of undefined (reading 'appendChild')` were common in the project:

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'appendChild')
```

Main causes:

- Using client-side code (like `window` or `document`) inside Server Components
- Mismatch between initial server render and client render after hydration
- Inconsistent use of `use client`

### 2. Issues Accessing Environment Variables

Client-side code attempted to access server environment variables without proper setup:

```
Invalid environment variables
```

### 3. Importing Client Components from Server Components

Importing Client Components (with `use client`) from Server Components without proper setup:

```tsx
// Incorrect - importing a Client Component to a Server Component without specifying use client
import ClientComponent from "@/components/ClientComponent";

// Server Component using a Client Component
export default function ServerComponent() {
  return <ClientComponent />; // Incorrect - Client Component inside a Server Component without proper marking
}
```

### 4. Using Hooks Outside Client Components

Using React hooks (like `useState`, `useEffect`) outside the appropriate context:

```tsx
// Incorrect - using hooks inside a Server Component
export default function ServerComponent() {
  const [count, setCount] = useState(0); // Error - useState in Server Component

  useEffect(() => {
    console.log("Mounted");
  }, []); // Error - useEffect in Server Component

  return <div>{count}</div>;
}
```

## Solutions Implemented

### 1. Proper Separation Between Pages and Components

We created a clear structure:

- Server-level pages (`src/app/page.tsx`) - for defining metadata and wrapping Client Components
- Interactive components on the client side (`src/components/HomePage.tsx`) - marked with `"use client"`

```tsx
// src/app/page.tsx - Server Component
import { Metadata } from "next";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "HaDerech - Learning Platform",
  description: "HaDerech - Advanced learning system with rich content",
};

export default function Page() {
  // Server Component - returns the Client Component
  return <HomePage />;
}
```

```tsx
// src/components/HomePage.tsx - Client Component
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("HomePage mounted on client");
  }, []);

  // Minimal render before hydration
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  // Full render after hydration
  return (
    <div>
      <h1>Welcome to HaDerech</h1>
      {/* Interactive content */}
    </div>
  );
}
```

### 2. isMounted Mechanism to Handle Hydration Errors

We implemented the `isMounted` approach in Client Components to ensure that code runs only after full hydration:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function ClientComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simpler version for server-side rendering
  if (!isMounted) {
    return <div>Basic version before hydration</div>;
  }

  // Full version with interactivity
  return (
    <div>
      <button onClick={() => alert("Clicked!")}>Click me</button>
    </div>
  );
}
```

### 3. Handling Access to Browser-Only Objects

We ensured that access to browser-only objects (like `window` or `document`) is performed only after hydration:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function WindowSizeComponent() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Calling window object only on client side
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Avoid leaking client window size information during server render
  if (!isMounted) return <div>Loading...</div>;

  return (
    <div>
      <p>Window width: {windowSize.width}px</p>
      <p>Window height: {windowSize.height}px</p>
    </div>
  );
}
```

### 4. Element Checks Before DOM Access

We added existence checks before accessing DOM elements:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function SafeDOMComponent() {
  const elementRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Existence check before access
    if (elementRef.current) {
      // DOM operations
      const element = elementRef.current;
      if (element && typeof element.classList !== "undefined") {
        element.classList.add("highlighted");
      }
    }
  }, []);

  return <div ref={elementRef}>Element with safe DOM access</div>;
}
```

## Best Practices

### 1. When to Use Server Components

Server Components are suitable for:

- Static pages or pages with minimal interactivity
- Fetching data from databases or APIs
- Setting page metadata
- Rendering complex static content

```tsx
// Example of a Server Component - no "use client"
import { db } from "@/lib/db";

export default async function ProductList() {
  // Direct database access on the server side
  const products = await db.product.findMany();

  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. When to Use Client Components

Client Components are suitable for:

- Interactive components (forms, buttons, menus)
- Using React hooks (`useState`, `useEffect`, etc.)
- Accessing browser-only objects (`window`, `document`)
- Events (`onClick`, `onChange`, etc.)

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 3. "Client Component Wrapping" Method

Recommended approach: Server Components wrap Client Components.

```tsx
// src/app/products/page.tsx - Server Component
import ProductInterface from "@/components/ProductInterface";
import { db } from "@/lib/db";

export default async function ProductsPage() {
  // Server-side code - data access
  const products = await db.product.findMany();

  // Passing data as props to Client Component
  return <ProductInterface initialProducts={products} />;
}
```

```tsx
// src/components/ProductInterface.tsx - Client Component
"use client";

import { useState } from "react";
import type { Product } from "@/types";

export default function ProductInterface({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState("");

  // Client-side logic - filtering products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter products..."
      />

      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Passing Data Between Server and Client

Recommendations for passing data from server to client:

- Passing data as props to Client Components
- Using Next.js streaming utilities (unstable_cache, generateMetadata)
- Preventing sensitive data from being passed to the client side

```tsx
// src/app/user/page.tsx - Server Component
import UserProfile from "@/components/UserProfile";
import { auth } from "@/lib/auth";

export default async function UserPage() {
  // Server-side code - getting user data
  const user = await auth.getUser();

  // Passing only non-sensitive data to the client
  const safeUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    // Not including passwords, tokens, etc.
  };

  return <UserProfile user={safeUserData} />;
}
```

## Development and Debugging Tools

### 1. Identifying Hydration Errors

Methods for identifying hydration errors:

- Check the browser console for warnings like `Hydration failed...`
- Look for errors like `Cannot read properties of undefined`
- Check differences between initial state (server) and state after hydration (client)

### 2. Analyzing the Layout of Server and Client Components

Using Next.js DevTools (or similar add-ons) for component separation visualization:

- Identifying Server Components (blue) and Client Components (yellow)
- Analyzing the dependency graph between components
- Checking hydration boundaries

### 3. Advanced Debugging Methods

```bash
# Running Next.js in full debug mode
DEBUG=* next dev
```

```tsx
// Adding targeted debugging to component functions
useEffect(() => {
  console.log("Component mounted", { props, state });
  console.log("Window object available:", typeof window !== "undefined");
  console.log("DOM ready:", document.readyState);
}, []);
```

## Checklist

✅ **Server-Client Separation Tests**:

1. **General**:

   - [ ] Every Client Component is marked with `"use client"` at the beginning of the file
   - [ ] Server Components don't try to use hooks like `useState` or `useEffect`
   - [ ] No direct access to `window` or `document` objects in Server Components

2. **Preventing Hydration Errors**:

   - [ ] The `isMounted` technique is implemented in complex Client Components
   - [ ] Components displaying date/time use `suppressHydrationWarning`
   - [ ] Interactive components are displayed only after full hydration

3. **Proper Design**:

   - [ ] Pages (`pages`) mainly implement server logic and data fetching
   - [ ] Interactive components are in the `components` directory and defined as Client Components
   - [ ] Services and helper functions are separated by server/client side

4. **Performance**:
   - [ ] Minimizing client bundle size by minimal `"use client"` marking
   - [ ] Static data is efficiently passed from Server Components to Client Components
   - [ ] Suspense and React.lazy techniques are implemented for appropriate loading

</div>
