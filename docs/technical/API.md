# תיעוד API

## 🌐 סקירה כללית

API של הדרך מבוסס על tRPC, המספק type-safety מלא בין הקליינט לשרת. ה-API מחולק למודולים לוגיים המשקפים את הדומיינים השונים של המערכת.

## 🔑 אימות

### הרשמה
```typescript
mutation register(input: {
  email: string;
  password: string;
  name: string;
}) => {
  user: User;
  token: string;
}
```

### התחברות
```typescript
mutation login(input: {
  email: string;
  password: string;
}) => {
  user: User;
  token: string;
}
```

### התנתקות
```typescript
mutation logout() => {
  success: boolean;
}
```

## 👤 משתמשים

### קבלת פרופיל
```typescript
query getProfile() => {
  user: User;
  settings: UserSettings;
  progress: UserProgress;
}
```

### עדכון פרופיל
```typescript
mutation updateProfile(input: {
  name?: string;
  avatar?: string;
  settings?: Partial<UserSettings>;
}) => {
  user: User;
}
```

### מחיקת חשבון
```typescript
mutation deleteAccount() => {
  success: boolean;
}
```

## 📚 קורסים

### רשימת קורסים
```typescript
query getCourses(input: {
  page?: number;
  limit?: number;
  filter?: CourseFilter;
  sort?: CourseSort;
}) => {
  courses: Course[];
  total: number;
  hasMore: boolean;
}
```

### קורס בודד
```typescript
query getCourse(input: {
  id: string;
}) => {
  course: Course;
  modules: Module[];
  prerequisites: Course[];
}
```

### יצירת קורס
```typescript
mutation createCourse(input: {
  title: string;
  description: string;
  modules: ModuleInput[];
  prerequisites?: string[];
}) => {
  course: Course;
}
```

### עדכון קורס
```typescript
mutation updateCourse(input: {
  id: string;
  title?: string;
  description?: string;
  modules?: ModuleInput[];
  prerequisites?: string[];
}) => {
  course: Course;
}
```

### מחיקת קורס
```typescript
mutation deleteCourse(input: {
  id: string;
}) => {
  success: boolean;
}
```

## 📝 מודולים

### רשימת מודולים
```typescript
query getModules(input: {
  courseId: string;
}) => {
  modules: Module[];
}
```

### מודול בודד
```typescript
query getModule(input: {
  id: string;
}) => {
  module: Module;
  content: Content[];
  exercises: Exercise[];
}
```

### יצירת מודול
```typescript
mutation createModule(input: {
  courseId: string;
  title: string;
  content: ContentInput[];
  exercises?: ExerciseInput[];
}) => {
  module: Module;
}
```

### עדכון מודול
```typescript
mutation updateModule(input: {
  id: string;
  title?: string;
  content?: ContentInput[];
  exercises?: ExerciseInput[];
}) => {
  module: Module;
}
```

### מחיקת מודול
```typescript
mutation deleteModule(input: {
  id: string;
}) => {
  success: boolean;
}
```

## 📊 התקדמות

### קבלת התקדמות
```typescript
query getProgress(input: {
  courseId?: string;
  moduleId?: string;
}) => {
  progress: Progress;
  stats: ProgressStats;
}
```

### עדכון התקדמות
```typescript
mutation updateProgress(input: {
  courseId: string;
  moduleId: string;
  status: ProgressStatus;
  score?: number;
}) => {
  progress: Progress;
}
```

### איפוס התקדמות
```typescript
mutation resetProgress(input: {
  courseId: string;
}) => {
  success: boolean;
}
```

## 🔍 חיפוש

### חיפוש כללי
```typescript
query search(input: {
  query: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}) => {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}
```

### השלמה אוטומטית
```typescript
query autocomplete(input: {
  query: string;
  type?: SearchType;
}) => {
  suggestions: string[];
}
```

## 📈 אנליטיקס

### סטטיסטיקות משתמש
```typescript
query getUserStats() => {
  completedCourses: number;
  totalTime: number;
  averageScore: number;
  streak: number;
}
```

### סטטיסטיקות קורס
```typescript
query getCourseStats(input: {
  courseId: string;
}) => {
  enrollments: number;
  completions: number;
  averageScore: number;
  averageTime: number;
}
```

## 🔔 התראות

### קבלת התראות
```typescript
query getNotifications(input: {
  page?: number;
  limit?: number;
}) => {
  notifications: Notification[];
  unread: number;
  total: number;
}
```

### סימון כנקרא
```typescript
mutation markAsRead(input: {
  id: string;
}) => {
  success: boolean;
}
```

### מחיקת התראה
```typescript
mutation deleteNotification(input: {
  id: string;
}) => {
  success: boolean;
}
```

## 📝 סיכום

ה-API מספק:
- Type safety מלא
- Validation אוטומטי
- תיעוד מובנה
- ביצועים מעולים
- אבטחה גבוהה 