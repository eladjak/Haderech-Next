# 🚀 מדריך פתרון בעיות דיפלוי (Deployment Troubleshooting)

## 📋 רשימת בדיקות מהירה

לפני דיפלוי, ודא ש:

- [ ] יש לך `.nvmrc` עם Node 18.20.0
- [ ] יש לך `vercel.json` עם הגדרות נכונות
- [ ] כל משתני הסביבה (Environment Variables) מוגדרים ב-Vercel
- [ ] הפרויקט בונה בהצלחה לוקאלית (`pnpm run build`)
- [ ] אין שגיאות TypeScript (`pnpm run type-check`)
- [ ] אין שגיאות Lint (`pnpm run lint`)

---

## 🔧 בעיות נפוצות ופתרונות

### 1. **שגיאת Node Version Mismatch**

**תסמינים:**
```
Error: The engine "node" is incompatible with this module.
Expected version ">=18.x <21.x". Got "22.x.x"
```

**פתרון:**
1. ודא שיש קובץ `.nvmrc` בשורש הפרויקט:
```bash
cat .nvmrc
# אמור להציג: 18.20.0
```

2. אם אתה רץ לוקאלית, החלף גרסת Node:
```bash
nvm install 18
nvm use 18
pnpm install
```

3. ב-Vercel, הגרסה תילקח אוטומטית מ-`.nvmrc`

---

### 2. **שגיאות Build**

**תסמינים:**
```
Error: Build failed
Module not found
Type errors
```

**פתרון:**
1. נסה לבנות לוקאלית:
```bash
pnpm run build
```

2. אם יש שגיאות TypeScript:
```bash
pnpm run type-check
```

3. תקן את השגיאות לפני push

**שגיאות נפוצות:**
- **Missing imports**: ודא שכל ה-imports קיימים
- **Type errors**: הרץ `pnpm run type-check` ותקן
- **Missing env variables**: ודא שכל המשתנים מוגדרים

---

### 3. **שגיאות משתני סביבה (Environment Variables)**

**תסמינים:**
```
Error: Missing environment variable
Database connection failed
API key not found
```

**פתרון:**

1. **ודא שכל המשתנים הבאים מוגדרים ב-Vercel Dashboard:**

**Required Environment Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
DATABASE_URL=postgresql://xxx

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# OpenAI (for chatbot and simulator)
OPENAI_API_KEY=sk-xxx

# Site Info
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=HaDerech
```

2. **בדוק ב-Vercel Dashboard:**
   - עבור ל-Settings → Environment Variables
   - ודא שכל המשתנים מוגדרים
   - שים לב: משתני `NEXT_PUBLIC_*` חייבים להיות זמינים גם ב-Production וגם ב-Preview

---

### 4. **שגיאות Prisma/Database**

**תסמינים:**
```
Error: Prisma Client not generated
Database schema out of sync
```

**פתרון:**

1. ודא ש-`postinstall` script רץ:
```json
"postinstall": "prisma generate && husky install"
```

2. אם צריך לרוץ migrations:
```bash
pnpm run db:migrate
```

3. ב-Vercel, ודא ש-DATABASE_URL מוגדר נכון

---

### 5. **שגיאות Pnpm/Package Manager**

**תסמינים:**
```
Error: No pnpm-lock.yaml found
npm ERR! missing script
```

**פתרון:**

1. ודא ש-`vercel.json` מוגדר להשתמש ב-pnpm:
```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install"
}
```

2. אם אין `pnpm-lock.yaml`, צור אותו:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

### 6. **שגיאות Service Worker/PWA**

**תסמינים:**
```
Error: Service Worker registration failed
manifest.json not found
```

**פתרון:**

1. ודא ש-`public/sw.js` קיים
2. ודא ש-`public/manifest.json` קיים
3. בדוק headers ב-`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

---

### 7. **שגיאות CI/CD (GitHub Actions)**

**תסמינים:**
```
CI build failed
Test failed
Lint errors
```

**פתרון:**

1. בדוק את ה-CI logs ב-GitHub Actions
2. הרץ את אותן פקודות לוקאלית:
```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

3. תקן שגיאות לפני push

**שגיאות נפוצות ב-CI:**
- Missing test script (הוסרנו `test:integration` שלא קיים)
- Wrong package manager (שינינו מ-npm ל-pnpm)
- Missing environment variables (הוסף ב-GitHub Secrets)

---

### 8. **שגיאות Vercel Build Timeout**

**תסמינים:**
```
Error: Build exceeded maximum duration
Build timeout after 15 minutes
```

**פתרון:**

1. אופטמז את זמן הבנייה:
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

2. השתמש ב-cache:
```bash
# בדוק שיש pnpm-lock.yaml
ls -la pnpm-lock.yaml
```

3. שקול להשתמש ב-Turbo (אופציונלי):
```bash
pnpm add -D turbo
```

---

## 🔍 איך לבדוק לוגים ב-Vercel

### דרך 1: Vercel Dashboard
1. עבור ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. בחר את הפרויקט
3. לחץ על הדיפלוי האחרון
4. עבור ל-"Build Logs" או "Runtime Logs"

### דרך 2: Vercel CLI
```bash
# התקן Vercel CLI
npm i -g vercel

# התחבר
vercel login

# צפה בלוגים
vercel logs [deployment-url]
```

### דרך 3: MCP Vercel (אם זמין)
אם יש לך גישה ל-MCP של vercel-labs, תוכל לשאול את Claude לבדוק logs:
```
"Check the latest deployment logs for this project"
```

---

## 📊 בדיקות לפני דיפלוי

הרץ את הפקודות הבאות **לפני כל push**:

```bash
# 1. בדיקת טיפוסים
pnpm run type-check

# 2. בדיקת lint
pnpm run lint

# 3. בדיקת פורמט
pnpm run format:check

# 4. הרצת טסטים
pnpm run test

# 5. בנייה
pnpm run build

# 6. אם הכל עבר, push
git push
```

**או השתמש בפקודה המשולבת:**
```bash
pnpm run validate
```

---

## 🎯 Checklist לדיפלוי ראשון

- [ ] **הגדרת Vercel Project**
  - [ ] צור פרויקט חדש ב-Vercel Dashboard
  - [ ] חבר את ה-GitHub repository
  - [ ] בחר Branch: `main` (או `claude/analyze-project-...`)

- [ ] **Environment Variables**
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] OPENAI_API_KEY
  - [ ] NEXT_PUBLIC_SITE_URL

- [ ] **Build Settings**
  - [ ] Framework Preset: Next.js
  - [ ] Build Command: `pnpm run build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `pnpm install`
  - [ ] Node Version: 18.x (אוטומטי מ-.nvmrc)

- [ ] **Domain Settings**
  - [ ] הגדר domain מותאם (אופציונלי)
  - [ ] עדכן NEXTAUTH_URL ו-NEXT_PUBLIC_SITE_URL

- [ ] **Database Setup**
  - [ ] ודא ש-Supabase database פעיל
  - [ ] הרץ migrations: `pnpm run db:migrate`
  - [ ] (אופציונלי) הרץ seed: `pnpm run db:seed`

---

## 🆘 עזרה נוספת

### אם כלום לא עובד:

1. **בדוק את הקבצים החדשים שנוספו:**
   - `.nvmrc` - גרסת Node
   - `vercel.json` - הגדרות Vercel
   - `.github/workflows/ci.yml` - CI pipeline (מתוקן)

2. **הרץ build נקי:**
```bash
# נקה הכל
rm -rf .next node_modules pnpm-lock.yaml

# התקן מחדש
pnpm install

# נסה לבנות
pnpm run build
```

3. **בדוק TypeScript errors:**
```bash
# הרץ type-check עם verbose
pnpm run type-check --pretty
```

4. **שאל עזרה ספציפית:**
   - העתק את שגיאת הבנייה המלאה
   - העתק את ה-deployment logs מ-Vercel
   - ספק מידע על Environment Variables (בלי לחשוף סודות!)

---

## 📝 קבצים שנוצרו/עודכנו

### קבצים חדשים:
1. **`.nvmrc`** - מגדיר Node 18.20.0 ל-Vercel
2. **`vercel.json`** - הגדרות Vercel (pnpm, env vars, functions)
3. **`DEPLOYMENT_TROUBLESHOOTING.md`** - המסמך הזה

### קבצים מעודכנים:
1. **`.github/workflows/ci.yml`** - תוקן להשתמש ב-pnpm, הוסר test:integration

---

## ✅ מה הלאה?

1. **Commit את השינויים:**
```bash
git add .nvmrc vercel.json .github/workflows/ci.yml DEPLOYMENT_TROUBLESHOOTING.md
git commit -m "fix: add Vercel configuration and fix CI workflow"
git push
```

2. **נסה לדפלוי שוב ב-Vercel**

3. **אם עדיין יש בעיה:**
   - העתק את ה-deployment logs
   - בדוק את הצ'קליסט למעלה
   - שתף את הלוגים כדי שנוכל לעזור

---

**נוצר ב:** Phase 4.5 - Deployment Fixes
**מטרה:** תיקון בעיות דיפלוי ו-CI/CD
**סטטוס:** ✅ מוכן לשימוש
