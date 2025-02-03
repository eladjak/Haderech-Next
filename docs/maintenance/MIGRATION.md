# מדריך העברה - HaDerech Next 🚀

## סקירה כללית 📋

מסמך זה מפרט את תהליך ההעברה מהגרסה הישנה לגרסה החדשה של פרויקט הדרך.

## שינויים עיקריים 🔄

### 1. ארכיטקטורה

- מעבר ל-Next.js 14 עם App Router
- שימוש ב-TypeScript
- אינטגרציה עם Supabase
- תמיכה ב-PWA

### 2. בסיס נתונים

```sql
-- העברת טבלאות
CREATE TABLE users_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- העתקת נתונים
INSERT INTO users_new (id, email, full_name, role)
SELECT
  uuid_generate_v4(),
  email,
  CONCAT(first_name, ' ', last_name),
  CASE
    WHEN is_admin THEN 'admin'
    WHEN is_teacher THEN 'teacher'
    ELSE 'user'
  END
FROM users_old;
```

## תהליך העברה 📦

### 1. גיבוי

```bash
#!/bin/bash
# גיבוי בסיס נתונים
pg_dump $OLD_DATABASE_URL > backup.sql

# גיבוי קבצים
tar -czf files_backup.tar.gz ./uploads
```

### 2. העברת נתונים

```typescript
// העברת משתמשים
async function migrateUsers() {
  const oldUsers = await oldDb.query("SELECT * FROM users");

  for (const user of oldUsers) {
    await supabase.from("users").insert({
      email: user.email,
      full_name: `${user.first_name} ${user.last_name}`,
      role: mapRole(user.role),
      metadata: {
        old_id: user.id,
        migrated_at: new Date(),
      },
    });
  }
}

// העברת קורסים
async function migrateCourses() {
  const oldCourses = await oldDb.query("SELECT * FROM courses");

  for (const course of oldCourses) {
    await supabase.from("courses").insert({
      title: course.title,
      description: course.description,
      author_id: await mapUserId(course.author_id),
      status: mapStatus(course.status),
    });
  }
}
```

## בדיקות העברה ✅

### 1. בדיקת שלמות

```typescript
// בדיקת שלמות נתונים
async function verifyMigration() {
  // בדיקת מספר רשומות
  const oldCount = await oldDb.query("SELECT COUNT(*) FROM users");
  const newCount = await supabase.from("users").select("count");

  if (oldCount !== newCount) {
    throw new Error("Data count mismatch");
  }

  // בדיקת תקינות נתונים
  const sample = await supabase.from("users").select().limit(100);

  for (const user of sample) {
    validateUserData(user);
  }
}
```

### 2. בדיקות פונקציונליות

```typescript
// בדיקת פונקציונליות
describe("Migration Tests", () => {
  it("should maintain user permissions", async () => {
    const oldUser = await getOldUser(testId);
    const newUser = await getNewUser(testId);

    expect(mapRole(oldUser.role)).toBe(newUser.role);
  });

  it("should preserve course relationships", async () => {
    const oldCourse = await getOldCourse(testId);
    const newCourse = await getNewCourse(testId);

    expect(await mapUserId(oldCourse.author_id)).toBe(newCourse.author_id);
  });
});
```

## טיפול בשגיאות 🚨

### 1. שגיאות העברה

```typescript
// טיפול בשגיאות העברה
class MigrationError extends Error {
  constructor(
    message: string,
    public entity: string,
    public oldId: string,
    public details: any,
  ) {
    super(message);
    this.name = "MigrationError";
  }
}

async function handleMigrationError(error: MigrationError) {
  // תיעוד השגיאה
  await logger.error({
    type: "migration_error",
    entity: error.entity,
    old_id: error.oldId,
    details: error.details,
    timestamp: new Date(),
  });

  // ניסיון תיקון
  if (error.entity === "user") {
    await fixUserMigration(error.oldId);
  }
}
```

### 2. שחזור

```typescript
// שחזור מגיבוי
async function rollback() {
  // שחזור בסיס נתונים
  await exec("pg_restore backup.sql");

  // שחזור קבצים
  await exec("tar -xzf files_backup.tar.gz");

  // תיעוד
  await logger.info({
    type: "migration_rollback",
    timestamp: new Date(),
  });
}
```

## תחזוקה לאחר העברה 🔧

### 1. ניקוי נתונים

```typescript
// ניקוי נתונים ישנים
async function cleanupOldData() {
  // מחיקת טבלאות ישנות
  await supabase.query(`
    DROP TABLE IF EXISTS users_old CASCADE;
    DROP TABLE IF EXISTS courses_old CASCADE;
  `);

  // מחיקת קבצים ישנים
  await fs.rm("./old_uploads", { recursive: true });
}
```

### 2. אופטימיזציה

```typescript
// אופטימיזציית בסיס נתונים
async function optimizeDatabase() {
  // עדכון סטטיסטיקות
  await supabase.query("ANALYZE VERBOSE");

  // rebuild אינדקסים
  await supabase.query(`
    REINDEX TABLE users;
    REINDEX TABLE courses;
  `);
}
```

## תיעוד שינויים 📝

### 1. לוג שינויים

```typescript
// תיעוד שינויים
const migrationLog = {
  version: "2.0.0",
  date: "2024-02-20",
  changes: [
    "מעבר ל-Next.js 14",
    "שדרוג בסיס נתונים",
    "שיפור אבטחה",
    "תמיכה ב-PWA",
  ],
  breaking_changes: [
    "שינוי מבנה טבלאות",
    "שינוי API endpoints",
    "שינוי מערכת הרשאות",
  ],
};
```

### 2. מעקב התקדמות

```typescript
// מעקב התקדמות
const migrationProgress = {
  trackProgress: async (stage: string, status: string) => {
    await supabase.from("migration_log").insert({
      stage,
      status,
      timestamp: new Date(),
      details: {
        memory_usage: process.memoryUsage(),
        duration: performance.now(),
      },
    });
  },
};
```

## סיכום 📊

### שלבי העברה

1. גיבוי מלא
2. העברת נתונים
3. בדיקות מקיפות
4. תיקון שגיאות
5. אופטימיזציה

### המלצות

1. תכנון מפורט
2. גיבוי כפול
3. בדיקות מקיפות
4. ניטור צמוד
5. תיעוד מדויק
