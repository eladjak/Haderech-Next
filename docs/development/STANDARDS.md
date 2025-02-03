# סטנדרטים לפיתוח

## 🎯 סקירה כללית

מסמך זה מגדיר את הסטנדרטים והנהלים לפיתוח בפרויקט הדרך. הקפדה על סטנדרטים אלו תבטיח קוד איכותי, תחזוקתי ועקבי.

## 📝 סגנון קוד

### 1. כללי
- שימוש ב-TypeScript
- הגדרות ESLint מחמירות
- פורמט אוטומטי עם Prettier
- שמות משמעותיים ובעברית

### 2. קומפוננטות
```typescript
// רכיב דוגמה
const ExampleComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // הוק אחד לשורה
  const [state, setState] = useState(initialState);
  const { data } = useQuery(QUERY);
  
  // פונקציות עזר בתחילת הרכיב
  const handleClick = () => {
    // ...
  };
  
  // רינדור מותנה בפונקציה נפרדת
  const renderContent = () => {
    if (condition) {
      return <div>...</div>;
    }
    return null;
  };
  
  return (
    <div>
      {renderContent()}
    </div>
  );
};
```

### 3. טיפוסים
```typescript
// הגדרות טיפוס בקובץ נפרד
interface User {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user';

// שימוש בטיפוסים מורכבים
type Props = {
  user: User;
  role: UserRole;
  onUpdate: (user: User) => void;
};
```

## 🏗️ ארכיטקטורה

### 1. מבנה תיקיות
```
src/
  ├── components/        # רכיבי UI
  │   ├── common/       # רכיבים משותפים
  │   ├── layout/       # רכיבי מבנה
  │   └── features/     # רכיבים לפי תכונות
  ├── hooks/            # הוקים מותאמים
  ├── utils/            # פונקציות עזר
  ├── types/            # הגדרות טיפוסים
  ├── api/              # לוגיקת API
  ├── styles/           # סגנונות גלובליים
  └── pages/            # דפי Next.js
```

### 2. ניהול מצב
```typescript
// שימוש ב-Zustand
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// שימוש ב-React Query
const { data, isLoading } = useQuery(['key'], fetchData, {
  staleTime: 5 * 60 * 1000,
  cacheTime: 30 * 60 * 1000,
});
```

## 🧪 בדיקות

### 1. Unit Tests
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Component />);
    expect(getByText('text')).toBeInTheDocument();
  });
  
  it('should handle click', () => {
    const onClickMock = jest.fn();
    const { getByRole } = render(<Component onClick={onClickMock} />);
    fireEvent.click(getByRole('button'));
    expect(onClickMock).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests
```typescript
describe('Feature', () => {
  it('should work end-to-end', async () => {
    const { getByRole, findByText } = render(<Feature />);
    await userEvent.click(getByRole('button'));
    expect(await findByText('result')).toBeInTheDocument();
  });
});
```

## 🔍 Code Review

### 1. רשימת תיוג
- [ ] הקוד עובר את כל הבדיקות
- [ ] הקוד מפורמט נכון
- [ ] יש טיפוסים מלאים
- [ ] יש תיעוד מספק
- [ ] אין קוד כפול
- [ ] הקוד יעיל
- [ ] יש טיפול בשגיאות

### 2. תהליך
1. יצירת PR מסודר
2. הוספת תיאור מפורט
3. הוספת בדיקות רלוונטיות
4. בקשת ביקורת מעמיתים
5. תיקון הערות
6. מיזוג לאחר אישור

## 📈 ביצועים

### 1. אופטימיזציה
```typescript
// שימוש ב-useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(prop);
}, [prop]);

// שימוש ב-useCallback
const handleClick = useCallback(() => {
  doSomething(prop);
}, [prop]);

// שימוש ב-React.memo
const MemoizedComponent = React.memo(Component);
```

### 2. טעינה
```typescript
// טעינה מושהית של רכיבים
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// טעינה מושהית של תמונות
<img loading="lazy" src="image.jpg" alt="description" />

// טעינה מקדימה של דפים
<Link href="/page" prefetch>
  Go to Page
</Link>
```

## 🔒 אבטחה

### 1. אימות קלט
```typescript
// שימוש ב-Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validateInput = (data: unknown) => {
  return schema.parse(data);
};
```

### 2. XSS
```typescript
// שימוש ב-DOMPurify
const sanitizeHTML = (dirty: string) => {
  return DOMPurify.sanitize(dirty);
};

// שימוש ב-CSP
<meta
  httpEquiv="Content-Security-Policy"
  content="default-src 'self'"
/>
```

## 📱 נגישות

### 1. ARIA
```typescript
// שימוש נכון ב-ARIA
<button
  aria-label="סגור"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <Icon />
</button>

// תפקידים סמנטיים
<main role="main">
  <nav role="navigation">
    <ul role="list">
      {items.map(item => (
        <li role="listitem" key={item.id}>
          {item.text}
        </li>
      ))}
    </ul>
  </nav>
</main>
```

### 2. מקלדת
```typescript
// ניווט מקלדת
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleAction();
  }
};

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="button"
>
  תוכן
</div>
```

## 📝 סיכום

הסטנדרטים מבטיחים:
- קוד איכותי
- תחזוקה קלה
- ביצועים טובים
- אבטחה גבוהה
- נגישות מלאה 