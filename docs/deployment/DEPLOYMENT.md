# תהליך הפריסה

## 🌐 סקירה כללית

תהליך הפריסה של הדרך מבוסס על Vercel ו-GitHub Actions. התהליך מאפשר פריסה אוטומטית, בדיקות מקיפות, וגיבוי מלא.

## 🔄 תהליך CI/CD

### 1. בדיקות מקדימות

```bash
# התקנת תלויות
pnpm install

# בדיקת טיפוסים
pnpm type-check

# בדיקת לינטינג
pnpm lint

# הרצת טסטים
pnpm test
```

### 2. בניית הפרויקט

```bash
# בניית הפרויקט
pnpm build

# בדיקת בנייה
pnpm build:check
```

### 3. פריסה

```bash
# פריסה לסביבת פיתוח
pnpm deploy:dev

# פריסה לסביבת ייצור
pnpm deploy:prod
```

## 🌍 סביבות

### 1. פיתוח

- URL: https://dev.haderech.co.il
- Branch: develop
- Auto Deploy: ✅
- Preview: ✅

### 2. בדיקות

- URL: https://staging.haderech.co.il
- Branch: staging
- Auto Deploy: ✅
- Preview: ✅

### 3. ייצור

- URL: https://haderech.co.il
- Branch: main
- Auto Deploy: ❌
- Preview: ❌

## 🔑 משתני סביבה

### 1. כללי

```env
NODE_ENV=production
APP_URL=https://haderech.co.il
API_URL=https://api.haderech.co.il
```

### 2. אימות

```env
NEXTAUTH_URL=https://haderech.co.il
NEXTAUTH_SECRET=your-secret-here
```

### 3. בסיס נתונים

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key-here
```

### 4. שירותים חיצוניים

```env
SENTRY_DSN=your-dsn-here
POSTHOG_KEY=your-key-here
```

## 📋 בדיקות לפני פריסה

### 1. בדיקות אוטומטיות

- [x] Unit Tests
- [x] Integration Tests
- [x] E2E Tests
- [x] Type Checking
- [x] Linting

### 2. בדיקות ידניות

- [ ] בדיקת ביצועים
- [ ] בדיקת נגישות
- [ ] בדיקת תאימות
- [ ] בדיקת אבטחה

### 3. בדיקות תשתית

- [ ] בדיקת משתני סביבה
- [ ] בדיקת חיבור לדאטהבייס
- [ ] בדיקת שירותים חיצוניים
- [ ] בדיקת SSL

## 🔄 גיבוי ושחזור

### 1. גיבוי דאטהבייס

```bash
# גיבוי ידני
pg_dump -Fc > backup.dump

# שחזור מגיבוי
pg_restore -d database_name backup.dump
```

### 2. גיבוי קבצים

```bash
# גיבוי לאחסון
aws s3 sync ./public s3://bucket-name

# שחזור מאחסון
aws s3 sync s3://bucket-name ./public
```

## 🚨 תהליך Rollback

### 1. גרסת קוד

```bash
# חזרה לגרסה קודמת
git revert HEAD

# פריסה מחדש
pnpm deploy:prod
```

### 2. בסיס נתונים

```bash
# שחזור גיבוי
psql -d database_name -f backup.sql

# בדיקת שלמות
pnpm db:check
```

## 📊 ניטור

### 1. לוגים

- Vercel Logs
- Supabase Logs
- Application Logs

### 2. מטריקות

- Server Load
- Response Times
- Error Rates
- User Sessions

### 3. התראות

- Server Down
- High Error Rate
- Slow Response
- Low Storage

## 🔒 אבטחה

### 1. SSL

- Let's Encrypt
- Auto Renewal
- HSTS Enabled

### 2. Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
```

### 3. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## 📝 סיכום

תהליך הפריסה מבטיח:

- אמינות גבוהה
- אבטחה מקסימלית
- ביצועים מעולים
- יכולת שחזור מהירה
- ניטור מתמיד
