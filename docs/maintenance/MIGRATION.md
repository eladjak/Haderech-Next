# 🔄 מדריך מיגרציה

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [הכנות למיגרציה](#הכנות-למיגרציה)
3. [תהליך המיגרציה](#תהליך-המיגרציה)
4. [בדיקות](#בדיקות)
5. [פתרון בעיות](#פתרון-בעיות)
6. [גיבוי ושחזור](#גיבוי-ושחזור)

## סקירה כללית

מדריך זה מתאר את תהליך המיגרציה של מערכת הדרך לגרסה החדשה. המיגרציה כוללת:

1. שדרוג תשתיות
2. עדכון מסד נתונים
3. שדרוג קוד
4. העברת תוכן

## הכנות למיגרציה

### 1. גיבוי

```bash
# גיבוי מסד נתונים
pg_dump -Fc haderech > backup.dump

# גיבוי קבצים
tar -czf files_backup.tar.gz ./uploads

# גיבוי קונפיגורציה
cp .env .env.backup
```

### 2. בדיקת תלויות

```bash
# בדיקת חבילות מיושנות
pnpm outdated

# עדכון חבילות
pnpm update

# בדיקת שבירות
pnpm audit
```

### 3. הכנת סביבת בדיקות

```bash
# יצירת סביבת בדיקות
pnpm run setup:test

# העתקת נתוני בדיקה
pnpm run db:seed:test
```

## תהליך המיגרציה

### 1. עדכון סכמת מסד נתונים

```sql
-- גיבוי טבלאות קיימות
CREATE TABLE users_backup AS SELECT * FROM users;

-- עדכון מבנה
ALTER TABLE users
ADD COLUMN role varchar(50),
ADD COLUMN settings jsonb;

-- העתקת נתונים
INSERT INTO users (id, name, role)
SELECT id, name, 'user' FROM users_backup;
```

### 2. עדכון קוד

```typescript
// לפני
interface User {
  id: string;
  name: string;
}

// אחרי
interface User {
  id: string;
  name: string;
  role: "user" | "admin";
  settings: UserSettings;
}
```

### 3. העברת תוכן

```typescript
async function migrateContent() {
  // העברת משתמשים
  const users = await oldDb.users.findMany();
  await newDb.users.createMany({ data: users });

  // העברת קורסים
  const courses = await oldDb.courses.findMany();
  await newDb.courses.createMany({ data: courses });

  // העברת תוכן נוסף
  const content = await oldDb.content.findMany();
  await newDb.content.createMany({ data: content });
}
```

## בדיקות

### 1. בדיקות יחידה

```typescript
describe("Migration", () => {
  it("should migrate user data correctly", async () => {
    const user = await migrateUser(oldUser);
    expect(user).toMatchSnapshot();
  });

  it("should migrate course data correctly", async () => {
    const course = await migrateCourse(oldCourse);
    expect(course).toMatchSnapshot();
  });
});
```

### 2. בדיקות אינטגרציה

```typescript
describe("System Integration", () => {
  it("should maintain data relationships", async () => {
    const user = await getUser(id);
    expect(user.courses).toBeDefined();
    expect(user.progress).toBeDefined();
  });
});
```

### 3. בדיקות קבלה

```typescript
describe("Acceptance Tests", () => {
  it("should allow user login", async () => {
    const response = await login(user);
    expect(response.status).toBe(200);
  });

  it("should display migrated content", async () => {
    const content = await getContent(id);
    expect(content).toBeDefined();
  });
});
```

## פתרון בעיות

### 1. שגיאות נפוצות

```typescript
try {
  await migrateData();
} catch (error) {
  if (error instanceof DatabaseError) {
    await handleDatabaseError(error);
  } else if (error instanceof ValidationError) {
    await handleValidationError(error);
  } else {
    await handleGenericError(error);
  }
}
```

### 2. שחזור מגיבוי

```bash
# שחזור מסד נתונים
pg_restore -d haderech backup.dump

# שחזור קבצים
tar -xzf files_backup.tar.gz

# שחזור קונפיגורציה
cp .env.backup .env
```

## גיבוי ושחזור

### 1. גיבוי אוטומטי

```typescript
// הגדרת גיבוי אוטומטי
const backup = cron.schedule("0 0 * * *", async () => {
  await createBackup();
  await cleanOldBackups();
  await notifyTeam("Backup completed");
});
```

### 2. שחזור אוטומטי

```typescript
async function autoRestore() {
  // בדיקת תקינות גיבוי
  const isValid = await validateBackup(backupFile);
  if (!isValid) {
    throw new Error("Invalid backup");
  }

  // שחזור אוטומטי
  await stopServices();
  await restoreData();
  await startServices();
  await verifyRestore();
}
```

### 3. ניטור

```typescript
// ניטור תהליך המיגרציה
const monitor = {
  start: async () => {
    await metrics.reset();
    await startMonitoring();
  },

  track: async (event: MigrationEvent) => {
    await metrics.track(event);
    await notifyProgress(event);
  },

  end: async () => {
    await metrics.summarize();
    await stopMonitoring();
  },
};
```

## רשימת תיוג למיגרציה

### לפני המיגרציה

- [ ] גיבוי מלא של כל הנתונים
- [ ] בדיקת תלויות ועדכונן
- [ ] הכנת סביבת בדיקות
- [ ] תיעוד מצב נוכחי

### במהלך המיגרציה

- [ ] עדכון סכמת מסד נתונים
- [ ] העברת נתונים
- [ ] עדכון קוד
- [ ] בדיקות שוטפות

### אחרי המיגרציה

- [ ] בדיקות מקיפות
- [ ] אימות נתונים
- [ ] עדכון תיעוד
- [ ] ניטור מערכת
