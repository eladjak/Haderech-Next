# 🧩 תיעוד קומפוננטות

## מבוא

HaDerech משתמש בקומפוננטות React מודולריות ומעוצבות. הקומפוננטות מאורגנות בתיקיות לפי קטגוריות ופונקציונליות.

## מבנה התיקיות

```
components/
├── common/           # קומפוננטות בסיסיות לשימוש כללי
├── layout/          # קומפוננטות מבנה
├── simulator/       # קומפוננטות הסימולטור
├── forum/          # קומפוננטות הפורום
├── courses/        # קומפוננטות הקורסים
└── ui/             # קומפוננטות UI בסיסיות
```

## קומפוננטות סימולטור

### ChatSimulator

קומפוננטה ראשית לסימולטור הצ'אט.

```typescript
interface ChatSimulatorProps {
  state: SimulatorState;
  onSendMessage: (content: string) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  showFeedback: boolean;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({
  state,
  onSendMessage,
  onReset,
  isLoading,
  showFeedback,
}) => {
  // ... implementation
};
```

#### שימוש:

```tsx
<ChatSimulator
  state={simulatorState}
  onSendMessage={handleSendMessage}
  onReset={handleReset}
  isLoading={loading}
  showFeedback={true}
/>
```

### MessageDisplay

קומפוננטה להצגת הודעה בודדת בסימולטור.

```typescript
interface MessageDisplayProps {
  message: Message;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  // ... implementation
};
```

#### שימוש:

```tsx
<MessageDisplay message={message} />
```

### FeedbackDisplay

קומפוננטה להצגת משוב על הודעות המשתמש.

```typescript
interface FeedbackDisplayProps {
  feedback: FeedbackDetails;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  // ... implementation
};
```

#### שימוש:

```tsx
<FeedbackDisplay feedback={messageFeedback} />
```

## קומפוננטות פורום

### ForumPost

קומפוננטה להצגת פוסט בפורום.

```typescript
interface ForumPostProps {
  post: ForumPost;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
}

const ForumPost: React.FC<ForumPostProps> = ({ post, onLike, onComment }) => {
  // ... implementation
};
```

### ForumComment

קומפוננטה להצגת תגובה בפורום.

```typescript
interface ForumCommentProps {
  comment: ForumComment;
  onLike: (commentId: string) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
}

const ForumComment: React.FC<ForumCommentProps> = ({
  comment,
  onLike,
  onReply,
}) => {
  // ... implementation
};
```

## קומפוננטות קורסים

### CourseCard

קומפוננטה להצגת כרטיס קורס.

```typescript
interface CourseCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  // ... implementation
};
```

### LessonPlayer

קומפוננטה להצגת שיעור בקורס.

```typescript
interface LessonPlayerProps {
  lesson: CourseLesson;
  onComplete: (lessonId: string) => Promise<void>;
  onProgress: (lessonId: string, progress: number) => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onComplete,
  onProgress,
}) => {
  // ... implementation
};
```

## קומפוננטות UI

### Button

כפתור מעוצב עם מספר וריאציות.

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  onClick,
  children,
}) => {
  // ... implementation
};
```

### Input

שדה קלט מעוצב.

```typescript
interface InputProps {
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
}) => {
  // ... implementation
};
```

## שימוש בהוקים

### useSimulator

הוק לניהול מצב הסימולטור.

```typescript
const useSimulator = (scenarioId: string) => {
  // ... implementation
  return {
    state,
    sendMessage,
    reset,
    isLoading,
  };
};
```

### useForum

הוק לניהול מצב הפורום.

```typescript
const useForum = () => {
  // ... implementation
  return {
    posts,
    createPost,
    likePost,
    commentOnPost,
    isLoading,
  };
};
```

## טיפים לפיתוח קומפוננטות

1. השתמש ב-TypeScript לקבלת הגדרות טיפוסים מדויקות
2. הפרד לוגיקה מתצוגה
3. השתמש ב-CSS Modules או Tailwind
4. כתוב בדיקות יחידה
5. תעד את הקומפוננטות

## בדיקות

### דוגמה לבדיקת קומפוננטה:

```typescript
describe("ChatSimulator", () => {
  it("should render messages", () => {
    const state = {
      messages: [
        {
          id: "1",
          role: "user",
          content: "שלום",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    render(<ChatSimulator state={state} />);
    expect(screen.getByText("שלום")).toBeInTheDocument();
  });

  it("should handle sending messages", async () => {
    const onSendMessage = vi.fn();
    render(<ChatSimulator onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText("הקלד הודעה...");
    const button = screen.getByText("שלח");

    await userEvent.type(input, "שלום");
    await userEvent.click(button);

    expect(onSendMessage).toHaveBeenCalledWith("שלום");
  });
});
```

## נגישות

1. השתמש בתגיות סמנטיות
2. הוסף ARIA labels
3. וודא ניווט מקלדת
4. בדוק ניגודיות צבעים
5. הוסף alt לתמונות

## ביצועים

1. השתמש ב-React.memo לקומפוננטות כבדות
2. הימנע מרינדורים מיותרים
3. השתמש ב-useMemo ו-useCallback
4. אופטימיזציה של תמונות
5. lazy loading לקומפוננטות כבדות
