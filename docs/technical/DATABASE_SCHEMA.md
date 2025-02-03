# סכמת בסיס הנתונים

## 🗃️ סקירה כללית

בסיס הנתונים של הדרך מבוסס על PostgreSQL דרך Supabase. הסכמה מתוכננת לתמוך בכל הפונקציונליות הנדרשת תוך שמירה על ביצועים וגמישות.

## 📊 טבלאות

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
```

### user_settings
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'he',
  notifications BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status course_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
```

### modules
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### content
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE content_type AS ENUM ('text', 'video', 'quiz', 'exercise');
```

### progress
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'not_started',
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
```

### prerequisites
```sql
CREATE TABLE prerequisites (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, prerequisite_id)
);
```

### enrollments
```sql
CREATE TABLE enrollments (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);

CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');
```

### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('system', 'course', 'achievement');
```

## 🔒 Row Level Security

### users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### courses
```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Draft courses are viewable by creator"
  ON courses FOR SELECT
  USING (created_by = auth.uid() AND status = 'draft');

CREATE POLICY "Courses can be updated by creator"
  ON courses FOR UPDATE
  USING (created_by = auth.uid());
```

### progress
```sql
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON progress FOR UPDATE
  USING (user_id = auth.uid());
```

## 📈 אינדקסים

### users
```sql
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_idx ON users (role);
```

### courses
```sql
CREATE INDEX courses_status_idx ON courses (status);
CREATE INDEX courses_created_by_idx ON courses (created_by);
```

### modules
```sql
CREATE INDEX modules_course_id_idx ON modules (course_id);
CREATE INDEX modules_order_idx ON modules (course_id, order_index);
```

### content
```sql
CREATE INDEX content_module_id_idx ON content (module_id);
CREATE INDEX content_type_idx ON content (type);
CREATE INDEX content_order_idx ON content (module_id, order_index);
```

### progress
```sql
CREATE INDEX progress_user_id_idx ON progress (user_id);
CREATE INDEX progress_content_id_idx ON progress (content_id);
CREATE INDEX progress_status_idx ON progress (status);
```

## 🔄 Functions

### calculate_course_progress
```sql
CREATE OR REPLACE FUNCTION calculate_course_progress(
  p_user_id UUID,
  p_course_id UUID
) RETURNS FLOAT AS $$
DECLARE
  total_content INTEGER;
  completed_content INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_content
  FROM content c
  JOIN modules m ON c.module_id = m.id
  WHERE m.course_id = p_course_id;

  SELECT COUNT(*) INTO completed_content
  FROM progress p
  JOIN content c ON p.content_id = c.id
  JOIN modules m ON c.module_id = m.id
  WHERE m.course_id = p_course_id
  AND p.user_id = p_user_id
  AND p.status = 'completed';

  RETURN CASE
    WHEN total_content = 0 THEN 0
    ELSE (completed_content::FLOAT / total_content) * 100
  END;
END;
$$ LANGUAGE plpgsql;
```

### update_course_status
```sql
CREATE OR REPLACE FUNCTION update_course_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE enrollments
  SET status = 'completed',
      completed_at = NOW()
  WHERE user_id = NEW.user_id
  AND course_id = (
    SELECT course_id
    FROM modules
    WHERE id = (
      SELECT module_id
      FROM content
      WHERE id = NEW.content_id
    )
  )
  AND status = 'active'
  AND NOT EXISTS (
    SELECT 1
    FROM content c
    JOIN modules m ON c.module_id = m.id
    LEFT JOIN progress p ON c.id = p.content_id
      AND p.user_id = NEW.user_id
    WHERE m.course_id = enrollments.course_id
    AND (p.status IS NULL OR p.status != 'completed')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_status_trigger
AFTER INSERT OR UPDATE ON progress
FOR EACH ROW
EXECUTE FUNCTION update_course_status();
```

## 📝 סיכום

הסכמה מספקת:
- אבטחה ברמת השורה
- יעילות בשאילתות
- גמישות בהרחבה
- שלמות נתונים
- ביצועים מעולים 