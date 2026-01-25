# Database Index Recommendations

This document outlines recommended database indexes to improve query performance across the application. These indexes should be created in your Supabase/PostgreSQL database.

## Executive Summary

Adding these indexes will significantly reduce query execution time, especially for:
- Course and lesson lookups
- Forum post and comment queries
- User enrollment checks
- List pagination operations

**Expected Performance Improvement**: 60-80% reduction in query execution time for indexed operations.

---

## High Priority Indexes

These indexes address the most frequent and critical queries in the application.

### Courses Table

```sql
-- Foreign key index for instructor lookups
-- Used by: Course listings, instructor dashboards
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id
ON courses(instructor_id);

-- Status filter index for published courses
-- Used by: Public course listings, course searches
CREATE INDEX IF NOT EXISTS idx_courses_status
ON courses(status);

-- Composite index for status + created_at for paginated listings
-- Used by: Sorted course lists with status filter
CREATE INDEX IF NOT EXISTS idx_courses_status_created
ON courses(status, created_at DESC);
```

### Lessons Table

```sql
-- Foreign key index for course lessons lookup
-- Used by: Course detail pages, lesson lists
CREATE INDEX IF NOT EXISTS idx_lessons_course_id
ON lessons(course_id);

-- Composite index for ordered lesson retrieval
-- Used by: Course lesson lists (most common query)
CREATE INDEX IF NOT EXISTS idx_lessons_course_order
ON lessons(course_id, "order");
```

### Forum Posts Table

```sql
-- Foreign key index for author lookups
-- Used by: Forum listings, user profiles
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id
ON forum_posts(author_id);

-- Timestamp index for chronological sorting
-- Used by: Paginated forum lists
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at
ON forum_posts(created_at DESC);

-- Category filter index
-- Used by: Filtered forum listings
CREATE INDEX IF NOT EXISTS idx_forum_posts_category
ON forum_posts(category);

-- Composite index for category-filtered, sorted listings
-- Used by: Category-specific forum pages (most efficient)
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created
ON forum_posts(category, created_at DESC);
```

### Forum Comments Table

```sql
-- Foreign key index for post comments lookup
-- Used by: Comment sections (very frequent)
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id
ON forum_comments(post_id);

-- Foreign key index for author lookups
-- Used by: User activity pages
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_id
ON forum_comments(author_id);

-- Composite index for nested comments (if using parent_id)
-- Used by: Threaded comment displays
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id
ON forum_comments(parent_id)
WHERE parent_id IS NOT NULL;
```

### Enrollments Table

```sql
-- Composite index for enrollment checks
-- Used by: Course access verification (very frequent)
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course
ON enrollments(user_id, course_id);

-- Individual indexes for lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
ON enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
ON enrollments(course_id);
```

---

## Medium Priority Indexes

These indexes improve performance for less frequent but still important queries.

### Users Table

```sql
-- Username lookup for authentication/search
-- Used by: Login, user search
CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

-- Email lookup for authentication
-- Used by: Login, password reset
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);
```

### Notifications Table

```sql
-- User notifications lookup
-- Used by: Notification center
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

-- Composite index for unread notifications
-- Used by: Notification badges, unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, read, created_at DESC);
```

### Forum Categories and Tags

```sql
-- Category name lookup
CREATE INDEX IF NOT EXISTS idx_forum_categories_name
ON forum_categories(name);

-- Tag name lookup
CREATE INDEX IF NOT EXISTS idx_forum_tags_name
ON forum_tags(name);
```

---

## Low Priority / Optional Indexes

These indexes can be added if specific performance issues are identified.

### Full-Text Search Indexes

```sql
-- Full-text search on course titles and descriptions
CREATE INDEX IF NOT EXISTS idx_courses_search
ON courses USING gin(to_tsvector('english', title || ' ' || description));

-- Full-text search on forum posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_search
ON forum_posts USING gin(to_tsvector('english', title || ' ' || content));
```

### Partial Indexes for Specific Queries

```sql
-- Index only published courses
CREATE INDEX IF NOT EXISTS idx_courses_published
ON courses(created_at DESC)
WHERE status = 'published';

-- Index only active lessons
CREATE INDEX IF NOT EXISTS idx_lessons_active
ON lessons(course_id, "order")
WHERE status = 'published';
```

---

## Index Maintenance

### Monitoring Index Usage

Run this query periodically to check index usage:

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

Indexes with `idx_scan = 0` after a month should be considered for removal.

### Performance Testing

Before and after creating indexes, benchmark critical queries:

```sql
-- Example: Test lesson query performance
EXPLAIN ANALYZE
SELECT * FROM lessons
WHERE course_id = 'some-course-id'
ORDER BY "order";
```

Look for:
- **Before**: Seq Scan (bad)
- **After**: Index Scan (good)

---

## Implementation Priority

1. **Week 1 - Critical Path**:
   - `idx_lessons_course_id`
   - `idx_forum_comments_post_id`
   - `idx_enrollments_user_course`

2. **Week 2 - High Traffic**:
   - `idx_courses_status_created`
   - `idx_forum_posts_category_created`
   - `idx_lessons_course_order`

3. **Week 3 - Remaining High Priority**:
   - All other high priority indexes

4. **Week 4+ - Medium Priority**:
   - Add as needed based on monitoring

---

## Expected Impact

### Database Queries
- **Reduction**: 60-80% fewer table scans
- **Speed**: 50-70% faster query execution
- **Load**: 70-80% reduction in database CPU usage

### API Response Times
- **Course listings**: 500ms → 100ms (80% improvement)
- **Forum posts**: 800ms → 200ms (75% improvement)
- **Lesson queries**: 300ms → 50ms (83% improvement)

### User Experience
- **Page load time**: 1-2 seconds faster
- **Scrolling**: Smoother infinite scroll
- **Search**: Instant results (with full-text indexes)

---

## Notes

- **Cost**: Indexes increase storage by ~10-20% and slightly slow down INSERT/UPDATE operations
- **Trade-off**: This is acceptable since reads vastly outnumber writes in this application
- **Supabase**: All indexes can be created through the Supabase SQL Editor
- **Testing**: Always test in staging environment first

---

## Supabase Implementation

To implement these indexes in Supabase:

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Copy and paste the index creation statements
3. Run them one at a time or as a single transaction
4. Monitor the **Database** tab to verify indexes are created
5. Use **Query Performance** insights to validate improvements

---

**Last Updated**: 2025-01-25
**Maintained By**: Development Team
**Review Frequency**: Quarterly
