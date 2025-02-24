# הגדרות Supabase - HaDerech Next 🗄️

## סקירה כללית 📋

מסמך זה מפרט את הגדרות ה-Supabase בפרויקט הדרך, כולל סכמת בסיס הנתונים, מדיניות אבטחה, ופונקציות.

## סכמת בסיס נתונים 📊

### טבלאות

#### 1. משתמשים (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);
```

#### 2. קורסים (courses)

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX courses_author_idx ON courses(author_id);
CREATE INDEX courses_status_idx ON courses(status);
```

#### 3. שיעורים (lessons)

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  content TEXT,
  order_num INTEGER,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX lessons_course_idx ON lessons(course_id);
CREATE INDEX lessons_order_idx ON lessons(order_num);
```

#### 4. התקדמות (progress)

```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- אינדקסים
CREATE INDEX progress_user_idx ON progress(user_id);
CREATE INDEX progress_lesson_idx ON progress(lesson_id);
```

## מדיניות אבטחה 🔒

### 1. הרשאות טבלאות

```sql
-- מדיניות משתמשים
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "משתמשים יכולים לראות את הפרופיל שלהם"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "משתמשים יכולים לעדכן את הפרופיל שלהם"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- מדיניות קורסים
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "כל אחד יכול לראות קורסים פעילים"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "מחברים יכולים לערוך את הקורסים שלהם"
  ON courses FOR ALL
  USING (auth.uid() = author_id);
```

### 2. פונקציות אבטחה

```sql
-- בדיקת הרשאות
CREATE OR REPLACE FUNCTION check_course_access(course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = course_id
    AND (c.author_id = auth.uid() OR e.user_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## פונקציות מותאמות 🛠️

### 1. חישוב התקדמות

```sql
CREATE OR REPLACE FUNCTION calculate_course_progress(
  p_user_id UUID,
  p_course_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- ספירת שיעורים
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = p_course_id;

  -- ספירת שיעורים שהושלמו
  SELECT COUNT(*) INTO completed_lessons
  FROM progress p
  JOIN lessons l ON l.id = p.lesson_id
  WHERE p.user_id = p_user_id
  AND l.course_id = p_course_id
  AND p.status = 'completed';

  -- חישוב אחוז
  RETURN CASE
    WHEN total_lessons = 0 THEN 0
    ELSE (completed_lessons::DECIMAL / total_lessons) * 100
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. עדכון אוטומטי

```sql
-- עדכון זמן עדכון אחרון
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- הפעלת הטריגר
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## אינדקסים וביצועים 🚀

### 1. אינדקסים מורכבים

```sql
-- אינדקס משולב להתקדמות
CREATE INDEX progress_compound_idx
ON progress(user_id, lesson_id, status);

-- אינדקס חלקי לקורסים פעילים
CREATE INDEX active_courses_idx
ON courses(created_at)
WHERE status = 'published';
```

### 2. מטמון

```sql
-- הגדרות מטמון
ALTER TABLE courses
  ALTER COLUMN description
  SET STORAGE EXTENDED;

VACUUM ANALYZE courses;
```

## גיבויים ושחזור 💾

### 1. גיבוי אוטומטי

```bash
#!/bin/bash
# גיבוי יומי
pg_dump $DATABASE_URL \
  --clean \
  --if-exists \
  --format=c \
  --compress=9 \
  > backup_$(date +%Y%m%d).dump
```

### 2. שחזור

```bash
#!/bin/bash
# שחזור מגיבוי
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -d $DATABASE_URL \
  backup.dump
```

## ניטור וביצועים 📊

### 1. שאילתות איטיות

```sql
-- ניטור שאילתות
CREATE EXTENSION pg_stat_statements;

SELECT query, calls, total_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### 2. סטטיסטיקות

```sql
-- סטטיסטיקות טבלאות
SELECT schemaname, relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

## סיכום 📝

### מטרות

1. ביצועים מיטביים
2. אבטחה חזקה
3. גיבוי אמין
4. תחזוקה פשוטה
5. ניטור יעיל

### המלצות

1. ניטור ביצועים
2. עדכון אינדקסים
3. בדיקת אבטחה
4. גיבוי תקופתי
5. ניקוי נתונים
