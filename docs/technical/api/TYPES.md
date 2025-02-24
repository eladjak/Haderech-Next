# 🔍 טיפוסי TypeScript - תיעוד

## מבוא

פרויקט HaDerech משתמש ב-TypeScript כדי להבטיח טיפוסים בטוחים ותיעוד טוב יותר של הקוד. להלן תיעוד של הטיפוסים העיקריים במערכת.

## טיפוסי הסימולטור

### Message

```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sender: MessageSender;
  feedback?: FeedbackDetails;
  created_at: string;
  updated_at: string;
}
```

### MessageSender

```typescript
interface MessageSender {
  id: string;
  name: string;
  avatar_url?: string;
  role: "user" | "assistant";
}
```

### SimulatorState

```typescript
interface SimulatorState {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario: SimulatorScenario;
  status: "idle" | "running" | "completed" | "error";
  state: "initial" | "in_progress" | "completed";
  messages: Message[];
  feedback?: FeedbackDetails;
  created_at: string;
  updated_at: string;
  settings?: {
    difficulty: "beginner" | "intermediate" | "advanced";
    language: "he" | "en";
    feedback_frequency: "high" | "medium" | "low";
    auto_suggestions: boolean;
  };
}
```

### SimulatorScenario

```typescript
interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  initial_message: string;
  learning_objectives: string[];
  success_criteria: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
  created_at: string;
  updated_at: string;
}
```

### FeedbackDetails

```typescript
interface FeedbackDetails {
  metrics: {
    empathy: number;
    clarity: number;
    effectiveness: number;
    appropriateness: number;
    professionalism: number;
    problem_solving: number;
    overall: number;
  };
  strengths: string[];
  improvements: string[];
  tips: string[];
  comments: string;
  suggestions: string[];
  score: number;
  overallProgress: {
    score: number;
    level: string;
    nextLevel: string;
    requiredScore: number;
  };
}
```

## טיפוסי הפורום

### ForumPost

```typescript
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  category: ForumCategory;
  tags: ForumTag[];
  pinned: boolean;
  solved: boolean;
  likes: number;
  views: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  author: Author;
  comments?: ForumComment[];
  comments_count?: number;
}
```

### ForumComment

```typescript
interface ForumComment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  likes: number;
  created_at: string;
  updated_at: string;
  author: Author;
  replies?: ForumComment[];
}
```

## טיפוסי הקורסים

### Course

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: number;
  level: string;
  category: string;
  tags: string[];
  instructor_id: string;
  instructor: Author;
  created_at: string;
  updated_at: string;
  published: boolean;
  featured: boolean;
  lessons_count: number;
  students_count: number;
  ratings_count: number;
  average_rating: number;
  lessons?: CourseLesson[];
  ratings?: CourseRating[];
  comments?: CourseComment[];
  sections?: Section[];
}
```

### CourseLesson

```typescript
interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  course_id: string;
  section_id: string;
  is_free: boolean;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  progress?: number;
  isCompleted?: boolean;
}
```

## שימוש בטיפוסים

### דוגמאות

1. יצירת הודעה חדשה:

```typescript
const newMessage: Message = {
  id: generateId(),
  role: "user",
  content: "תוכן ההודעה",
  timestamp: new Date().toISOString(),
  sender: {
    id: "user-1",
    name: "משתמש",
    role: "user",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

2. עדכון מצב הסימולטור:

```typescript
const updatedState: SimulatorState = {
  ...state,
  messages: [...state.messages, newMessage],
  status: "running",
  state: "in_progress",
  updated_at: new Date().toISOString(),
};
```

### טיפים

1. השתמש ב-type assertions רק כשאתה בטוח בטיפוס
2. הגדר טיפוסים מדויקים לפרופס של קומפוננטות
3. השתמש ב-union types במקום enum
4. הימנע משימוש ב-any
5. השתמש ב-readonly כשאפשר

## בדיקות טיפוסים

כדי לבדוק את הטיפוסים בפרויקט:

```bash
pnpm run type-check
```

## שגיאות נפוצות

1. שגיאת חוסר התאמה בין טיפוסים:

```typescript
// שגוי
const message: Message = {
  // חסר שדות חובה
};

// נכון
const message: Message = {
  id: generateId(),
  role: "user",
  content: "תוכן",
  // ... כל השדות הנדרשים
};
```

2. שימוש בטיפוס לא נכון:

```typescript
// שגוי
status: "active", // לא קיים בטיפוס

// נכון
status: "running", // אחד מהערכים המותרים
```
