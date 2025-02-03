# הנחיות פיתוח - HaDerech Next 📝

## סגנון קוד 🎨

### 1. TypeScript
```typescript
// ✅ נכון
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // implementation
};

// ❌ לא נכון
const getUser = async (id) => {
  // implementation
};
```

### 2. React
```tsx
// ✅ נכון
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="p-4">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// ❌ לא נכון
function UserProfile(props) {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>{props.user.name}</h1>
      <p>{props.user.email}</p>
    </div>
  );
}
```

### 3. CSS/Tailwind
```tsx
// ✅ נכון
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  שלח
</button>

// ❌ לא נכון
<button style={{ 
  backgroundColor: 'blue',
  color: 'white',
  padding: '8px 16px'
}}>
  שלח
</button>
```

## ארגון קוד 📁

### 1. מבנה תיקיות
```
src/
  ├── components/      # קומפוננטות משותפות
  ├── hooks/          # React Hooks
  ├── lib/            # פונקציות עזר
  ├── pages/          # דפי האפליקציה
  └── types/          # טיפוסי TypeScript
```

### 2. ייבוא
```typescript
// ✅ נכון
import { Button } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import type { User } from '@/types';

// ❌ לא נכון
import { Button } from '../../components/ui/Button';
import { useUser } from '../../../../hooks/useUser';
```

### 3. ייצוא
```typescript
// ✅ נכון
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// ❌ לא נכון
export default Button;
```

## תבניות קוד 📋

### 1. קומפוננטות
```tsx
// components/CourseCard/CourseCard.tsx
import type { FC } from 'react';
import type { CourseCardProps } from './CourseCard.types';

export const CourseCard: FC<CourseCardProps> = ({
  title,
  description,
  image,
}) => {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### 2. Hooks
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
```

### 3. API Routes
```typescript
// pages/api/courses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

## בדיקות 🧪

### 1. בדיקות יחידה
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>לחץ כאן</Button>);
    expect(screen.getByText('לחץ כאן')).toBeInTheDocument();
  });
});
```

### 2. בדיקות אינטגרציה
```typescript
// __tests__/api/courses.test.ts
import { createMocks } from 'node-mocks-http';
import coursesHandler from '@/pages/api/courses';

describe('Courses API', () => {
  it('returns courses list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await coursesHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
        }),
      ])
    );
  });
});
```

## ניהול מצב 🔄

### 1. React Query
```typescript
// hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/lib/api';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
};
```

### 2. Zustand
```typescript
// store/useStore.ts
import create from 'zustand';

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## טיפול בשגיאות 🚨

### 1. שגיאות API
```typescript
// lib/api.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    toast.error(error.message);
  } else {
    toast.error('שגיאה לא צפויה');
  }
};
```

### 2. שגיאות קומפוננטה
```tsx
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>משהו השתבש</div>;
    }

    return this.props.children;
  }
}
```

## ביצועים ⚡

### 1. מטמון
```typescript
// lib/cache.ts
const cache = new Map<string, any>();

export const memoize = <T>(
  fn: (...args: any[]) => T,
  getKey = (...args: any[]) => args.join('-')
) => {
  return (...args: any[]): T => {
    const key = getKey(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
```

### 2. Code Splitting
```typescript
// pages/courses/[id].tsx
import dynamic from 'next/dynamic';

const CourseContent = dynamic(
  () => import('@/components/CourseContent'),
  { 
    loading: () => <div>טוען...</div>,
    ssr: false,
  }
);
```

## אבטחה 🔒

### 1. XSS
```typescript
// lib/security.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong'],
  });
};
```

### 2. CSRF
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-CSRF-Token', 'your-csrf-token');
  return response;
}
```

## סיכום 📝

### מטרות
1. קוד נקי ומתוחזק
2. ביצועים מעולים
3. אבטחה חזקה
4. בדיקות מקיפות
5. תחזוקה פשוטה

### המלצות
1. שימוש בכלי לינטינג
2. סקירות קוד
3. תיעוד מתמשך
4. עדכון תלויות
5. ניטור ביצועים 