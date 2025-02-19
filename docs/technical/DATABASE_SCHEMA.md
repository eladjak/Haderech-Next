# מבנה מסד הנתונים - פרויקט "הדרך" 🗄️

## 📊 טבלאות

### users

טבלת משתמשים ראשית

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  image TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}'
);

-- אינדקסים
CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_email_idx ON users(email);
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
  description TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- אינדקסים
CREATE INDEX courses_author_id_idx ON courses(author_id);
CREATE INDEX courses_status_idx ON courses(status);
```

### lessons

טבלת שיעורים

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  order_number INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- אינדקסים
CREATE INDEX lessons_course_id_idx ON lessons(course_id);
CREATE INDEX lessons_status_idx ON lessons(status);
```

### course_progress

```sql
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  completed_lessons UUID[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id)
);

CREATE INDEX course_progress_user_id_idx ON course_progress(user_id);
CREATE INDEX course_progress_course_id_idx ON course_progress(course_id);
```

### course_ratings

```sql
CREATE TABLE course_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id)
);

CREATE INDEX course_ratings_user_id_idx ON course_ratings(user_id);
CREATE INDEX course_ratings_course_id_idx ON course_ratings(course_id);
```

### course_comments

```sql
CREATE TABLE course_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES course_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX course_comments_user_id_idx ON course_comments(user_id);
CREATE INDEX course_comments_course_id_idx ON course_comments(course_id);
CREATE INDEX course_comments_parent_id_idx ON course_comments(parent_id);
```

### forum_posts

טבלת פוסטים בפורום

```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  solved BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- אינדקסים
CREATE INDEX forum_posts_author_id_idx ON forum_posts(author_id);
CREATE INDEX forum_posts_category_idx ON forum_posts(category);
CREATE INDEX forum_posts_created_at_idx ON forum_posts(created_at DESC);
```

### forum_categories

```sql
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX forum_categories_order_number_idx ON forum_categories(order_number);
```

### forum_tags

```sql
CREATE TABLE forum_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX forum_tags_name_idx ON forum_tags(name);
```

### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
```

### simulator_scenarios

```sql
CREATE TABLE simulator_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  initial_code TEXT NOT NULL,
  solution_code TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  hints TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX simulator_scenarios_difficulty_idx ON simulator_scenarios(difficulty);
```

## 🔒 Row Level Security (RLS)

### מדיניות הרשאות

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_scenarios ENABLE ROW LEVEL SECURITY;

-- Users are viewable by everyone
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Users are editable by owner
CREATE POLICY "Users are editable by owner"
ON users FOR ALL
USING (auth.uid() = id);

-- Courses are viewable by everyone
CREATE POLICY "Courses are viewable by everyone"
ON courses FOR SELECT
USING (true);

-- Courses are editable by author or admin
CREATE POLICY "Courses are editable by author or admin"
ON courses FOR ALL
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Lessons are viewable by everyone
CREATE POLICY "Lessons are viewable by everyone"
ON lessons FOR SELECT
USING (true);

-- Lessons are editable by course author or admin
CREATE POLICY "Lessons are editable by course author or admin"
ON lessons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_id
    AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  )
);

-- Course progress is viewable by owner
CREATE POLICY "Course progress is viewable by owner"
ON course_progress FOR SELECT
USING (auth.uid() = user_id);

-- Course progress is editable by owner
CREATE POLICY "Course progress is editable by owner"
ON course_progress FOR ALL
USING (auth.uid() = user_id);

-- Course ratings are viewable by everyone
CREATE POLICY "Course ratings are viewable by everyone"
ON course_ratings FOR SELECT
USING (true);

-- Course ratings are editable by owner
CREATE POLICY "Course ratings are editable by owner"
ON course_ratings FOR ALL
USING (auth.uid() = user_id);

-- Course comments are viewable by everyone
CREATE POLICY "Course comments are viewable by everyone"
ON course_comments FOR SELECT
USING (true);

-- Course comments are editable by owner
CREATE POLICY "Course comments are editable by owner"
ON course_comments FOR ALL
USING (auth.uid() = user_id);

-- Forum posts are viewable by everyone
CREATE POLICY "Forum posts are viewable by everyone"
ON forum_posts FOR SELECT
USING (true);

-- Forum posts are editable by author or admin
CREATE POLICY "Forum posts are editable by author or admin"
ON forum_posts FOR ALL
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Forum categories are viewable by everyone
CREATE POLICY "Forum categories are viewable by everyone"
ON forum_categories FOR SELECT
USING (true);

-- Forum categories are editable by admin only
CREATE POLICY "Forum categories are editable by admin only"
ON forum_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Forum tags are viewable by everyone
CREATE POLICY "Forum tags are viewable by everyone"
ON forum_tags FOR SELECT
USING (true);

-- Forum tags are editable by admin only
CREATE POLICY "Forum tags are editable by admin only"
ON forum_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Notifications are viewable by owner
CREATE POLICY "Notifications are viewable by owner"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Notifications are editable by owner
CREATE POLICY "Notifications are editable by owner"
ON notifications FOR ALL
USING (auth.uid() = user_id);

-- Simulator scenarios are viewable by everyone
CREATE POLICY "Simulator scenarios are viewable by everyone"
ON simulator_scenarios FOR SELECT
USING (true);

-- Simulator scenarios are editable by admin only
CREATE POLICY "Simulator scenarios are editable by admin only"
ON simulator_scenarios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
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
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  image TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}'
);
```

### `courses` - קורסים

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### `lessons` - שיעורים

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  order_number INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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
