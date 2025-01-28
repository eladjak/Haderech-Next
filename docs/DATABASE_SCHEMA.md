# מבנה מסד הנתונים - פרויקט "הדרך" 🗄️

## 📊 טבלאות

### users
טבלת משתמשים ראשית
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- אינדקסים
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);
```

### profiles
טבלת פרופילים מורחבת
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
```

### courses
טבלת קורסים
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  duration INTEGER,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  rating DECIMAL(3,2),
  students_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- אינדקסים
CREATE INDEX courses_author_id_idx ON courses(author_id);
CREATE INDEX courses_level_idx ON courses(level);
CREATE INDEX courses_published_idx ON courses(published);
```

### lessons
טבלת שיעורים
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  duration INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_free BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- אינדקסים
CREATE INDEX lessons_course_id_idx ON lessons(course_id);
CREATE INDEX lessons_order_idx ON lessons(course_id, order_index);
```

### forum_posts
טבלת פוסטים בפורום
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- אינדקסים
CREATE INDEX forum_posts_author_id_idx ON forum_posts(author_id);
CREATE INDEX forum_posts_created_at_idx ON forum_posts(created_at DESC);
CREATE INDEX forum_posts_tags_idx ON forum_posts USING GIN(tags);
```

### comments
טבלת תגובות
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  parent_id UUID REFERENCES comments(id),
  is_solution BOOLEAN DEFAULT false
);

-- אינדקסים
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_author_id_idx ON comments(author_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);
```

### progress
טבלת התקדמות בקורסים
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX progress_user_course_idx ON progress(user_id, course_id);
CREATE INDEX progress_lesson_idx ON progress(lesson_id);
```

## 🔒 Row Level Security (RLS)

### מדיניות הרשאות
```sql
-- courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone" 
  ON courses FOR SELECT 
  USING (published = true);

CREATE POLICY "Courses are editable by author" 
  ON courses FOR ALL 
  USING (auth.uid() = author_id);

-- forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" 
  ON forum_posts FOR SELECT 
  USING (true);

CREATE POLICY "Posts are editable by author" 
  ON forum_posts FOR UPDATE 
  USING (auth.uid() = author_id);

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Profiles are editable by owner" 
  ON profiles FOR ALL 
  USING (auth.uid() = user_id);
```

## 📈 Materialized Views

### קורסים פופולריים
```sql
CREATE MATERIALIZED VIEW popular_courses AS
SELECT 
  c.*,
  COUNT(DISTINCT p.user_id) as active_students,
  AVG(p.progress_percent) as avg_progress,
  COUNT(DISTINCT fp.id) as forum_discussions
FROM courses c
LEFT JOIN progress p ON c.id = p.course_id
LEFT JOIN forum_posts fp ON c.id = (fp.metadata->>'course_id')::uuid
WHERE c.published = true
GROUP BY c.id
ORDER BY active_students DESC;

-- רענון אוטומטי
CREATE OR REPLACE FUNCTION refresh_popular_courses()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_courses;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_popular_courses_trigger
AFTER INSERT OR UPDATE OR DELETE ON progress
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_popular_courses();
```

## 🔄 Functions & Triggers

### עדכון מונים אוטומטי
```sql
-- עדכון מספר תגובות בפוסט
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();
```

## 📝 הערות
- כל הטבלאות כוללות שדה `metadata` מסוג JSONB לגמישות עתידית
- כל המחיקות הן Cascade למניעת נתונים "יתומים"
- שימוש ב-UUID במקום Serial IDs לאבטחה משופרת
- אינדקסים מותאמים לשאילתות נפוצות
- RLS מופעל על כל הטבלאות הרגישות 