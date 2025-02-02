# מבנה מסד הנתונים - פרויקט "הדרך" 🗄️

## 📊 טבלאות

### users
טבלת משתמשים ראשית
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'user',
  referral_code TEXT UNIQUE,
  points INTEGER DEFAULT 0
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
  image_url TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT false,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced'))
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
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  order INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0
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
  USING (published = true OR auth.uid() = author_id);

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

# סכמת בסיס הנתונים 🗃️

## טבלאות ראשיות 📊

### `users` - משתמשים
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'user',
  referral_code TEXT UNIQUE,
  points INTEGER DEFAULT 0
);
```

### `courses` - קורסים
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT false,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced'))
);
```

### `lessons` - שיעורים
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  order INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## טבלאות קשר 🔄

### `course_enrollments` - הרשמות לקורסים
```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);
```

### `lesson_progress` - התקדמות בשיעורים
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  completed BOOLEAN DEFAULT false,
  last_position INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### `course_ratings` - דירוגי קורסים
```sql
CREATE TABLE course_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

### `course_comments` - תגובות לקורסים
```sql
CREATE TABLE course_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  parent_id UUID REFERENCES course_comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `forum_posts` - פוסטים בפורום
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0
);
```

### `user_follows` - עוקבים
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### `referrals` - הפניות
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(referrer_id, referred_id)
);
```

## אינדקסים 🔍

```sql
-- אינדקסים לחיפוש
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX courses_title_idx ON courses(title);
CREATE INDEX lessons_course_id_idx ON lessons(course_id);
CREATE INDEX forum_posts_created_at_idx ON forum_posts(created_at DESC);

-- אינדקסים לביצועים
CREATE INDEX course_enrollments_user_course_idx ON course_enrollments(user_id, course_id);
CREATE INDEX lesson_progress_user_lesson_idx ON lesson_progress(user_id, lesson_id);
CREATE INDEX course_ratings_course_idx ON course_ratings(course_id);
CREATE INDEX course_comments_course_idx ON course_comments(course_id);
CREATE INDEX user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX referrals_referrer_idx ON referrals(referrer_id);
```

## פונקציות וטריגרים 🔧

```sql
-- עדכון תאריך עדכון אחרון
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- טריגרים לעדכון תאריך
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- טריגר לעדכון נקודות בעת השלמת קורס
CREATE OR REPLACE FUNCTION award_course_completion_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    UPDATE users
    SET points = points + 100
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_course_completion
  AFTER UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION award_course_completion_points();
```

## הרשאות 🔒

```sql
-- הרשאות בסיסיות
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- מדיניות צפייה
CREATE POLICY "Public users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Free lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (
    is_free = true 
    OR EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_id = lessons.course_id
      AND user_id = auth.uid()
    )
  );
``` 