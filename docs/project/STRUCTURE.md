# מבנה הפרויקט - HaDerech Next 📁

## מבנה תיקיות

```
haderech-next/
├── .github/                    # הגדרות GitHub Actions וworkflows
├── .vscode/                    # הגדרות VS Code
├── public/                     # קבצים סטטיים
│   ├── images/                 # תמונות
│   └── locales/               # קבצי תרגום
├── src/                       # קוד המקור
│   ├── app/                   # App Router של Next.js
│   │   ├── (auth)/           # דפי אימות
│   │   ├── (course)/         # דפי קורסים
│   │   │   ├── courses/      # רשימת קורסים
│   │   │   └── [id]/         # דף קורס בודד
│   │   ├── (dashboard)/      # דפי לוח בקרה
│   │   ├── (forum)/          # דפי פורום
│   │   ├── (marketing)/      # דפי שיווק
│   │   └── api/              # נקודות קצה של API
│   │       ├── auth/         # אימות
│   │       ├── bot/          # בוט
│   │       ├── courses/      # קורסים
│   │       ├── forum/        # פורום
│   │       └── users/        # משתמשים
│   ├── components/           # קומפוננטות משותפות
│   │   ├── ui/              # קומפוננטות UI בסיסיות
│   │   ├── forms/           # טפסים
│   │   ├── layout/          # קומפוננטות מבנה
│   │   └── shared/          # קומפוננטות משותפות
│   ├── config/              # קבצי קונפיגורציה
│   ├── hooks/               # React Hooks
│   ├── lib/                 # ספריות וכלים
│   ├── store/               # ניהול מצב (Redux)
│   ├── styles/              # סגנונות גלובליים
│   ├── types/               # טיפוסי TypeScript
│   └── utils/               # פונקציות עזר
├── tests/                   # בדיקות
│   ├── e2e/                # בדיקות קצה לקצה
│   ├── integration/        # בדיקות אינטגרציה
│   └── unit/               # בדיקות יחידה
├── docs/                   # תיעוד
└── scripts/                # סקריפטים
```

## קבצי תצורה

- `.env.local` # משתני סביבה מקומיים
- `.env.production` # משתני סביבה לייצור
- `.eslintrc.json` # הגדרות ESLint
- `.prettierrc` # הגדרות Prettier
- `jest.config.js` # הגדרות Jest
- `next.config.js` # הגדרות Next.js
- `package.json` # תלויות ותסריטים
- `pnpm-lock.yaml` # נעילת גרסאות
- `tailwind.config.js` # הגדרות Tailwind
- `tsconfig.json` # הגדרות TypeScript

## קבצים חשובים

### קבצי תצורה

- `next.config.js` - הגדרות Next.js
- `tailwind.config.js` - הגדרות Tailwind CSS
- `tsconfig.json` - הגדרות TypeScript
- `.env.local` - משתני סביבה מקומיים

### קבצי אפליקציה

- `src/app/layout.tsx` - Layout ראשי
- `src/app/page.tsx` - דף הבית
- `src/app/providers.tsx` - ספקי Context

### קבצי API

- `src/app/api/auth/[...nextauth]/route.ts` - אימות
- `src/app/api/courses/route.ts` - ניהול קורסים
- `src/app/api/forum/route.ts` - ניהול פורום

### קומפוננטות חשובות

- `src/components/ui/button.tsx` - כפתור בסיסי
- `src/components/layout/header.tsx` - כותרת עליונה
- `src/components/layout/sidebar.tsx` - תפריט צד

### טיפוסים

- `src/types/supabase.ts` - טיפוסי Supabase
- `src/types/next-auth.d.ts` - טיפוסי NextAuth
- `src/types/api.ts` - טיפוסי API

## הערות

- כל הקבצים מאורגנים לפי תחומי אחריות
- שימוש ב-TypeScript לכל הקבצים
- תמיכה מלאה ב-RTL
- שימוש ב-CSS Modules או Tailwind
