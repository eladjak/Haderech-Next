# מפרט טכני - HaDerech Next 🔧

## סקירה כללית 📋

מסמך זה מפרט את הפרטים הטכניים של פרויקט הדרך, כולל ארכיטקטורה, טכנולוגיות, ותהליכי פיתוח.

## ארכיטקטורה 🏗️

### 1. Frontend

```typescript
// Next.js App Router
import { AppRouter } from 'next/router';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
```

### 2. Backend

```typescript
// tRPC API Routes
import { createRouter } from "@trpc/server";
import { z } from "zod";

export const appRouter = createRouter().query("courses", {
  input: z.object({
    limit: z.number().min(1).max(100).optional(),
    cursor: z.string().optional(),
  }),
  async resolve({ input }) {
    // Implementation
  },
});
```

### 3. Database

```sql
-- Supabase Schema
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## טכנולוגיות 💻

### 1. Frontend

- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS
- Zustand
- tRPC Client

### 2. Backend

- Node.js 20
- tRPC
- Supabase
- PostgreSQL
- Redis
- OpenAI API

### 3. DevOps

- Vercel
- GitHub Actions
- Docker
- Jest
- Playwright

## תהליכי פיתוח 🔄

### 1. CI/CD

```yaml
# GitHub Actions
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

### 2. Testing

```typescript
// Jest Tests
describe("CourseService", () => {
  it("should create course", async () => {
    const course = await createCourse({
      title: "Test Course",
      description: "Test Description",
    });
    expect(course).toBeDefined();
  });
});
```

### 3. Deployment

```bash
# Vercel Deployment
vercel deploy --prod
```

## אבטחה 🔒

### 1. Authentication

```typescript
// NextAuth.js Configuration
import NextAuth from "next-auth";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";

export default NextAuth({
  providers: [
    // Providers configuration
  ],
  adapter: SupabaseAdapter({
    // Supabase configuration
  }),
});
```

### 2. Authorization

```typescript
// Role-based Access Control
const checkPermission = (user: User, action: Action): boolean => {
  return user.permissions.includes(action);
};
```

## ביצועים ⚡

### 1. Caching

```typescript
// Redis Caching
const cache = new Redis();

const getCachedData = async (key: string) => {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchData();
  await cache.set(key, JSON.stringify(data));
  return data;
};
```

### 2. Optimization

```typescript
// Image Optimization
import Image from 'next/image';

const OptimizedImage = ({ src, alt }: ImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      loading="lazy"
    />
  );
};
```

## ניטור 📊

### 1. Logging

```typescript
// Winston Logger
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### 2. Monitoring

```typescript
// Sentry Integration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## אינטגרציות 🔌

### 1. OpenAI

```typescript
// OpenAI Integration
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

const generateResponse = async (prompt: string) => {
  const response = await openai.createCompletion({
    model: "gpt-4",
    prompt,
  });
  return response.data.choices[0].text;
};
```

### 2. Stripe

```typescript
// Stripe Integration
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createPayment = async (amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "ils",
  });
  return paymentIntent;
};
```

## תיעוד 📚

### 1. API Documentation

```typescript
/**
 * Creates a new course
 * @param {CourseInput} input - The course input data
 * @returns {Promise<Course>} The created course
 * @throws {Error} If validation fails
 */
const createCourse = async (input: CourseInput): Promise<Course> => {
  // Implementation
};
```

### 2. Component Documentation

````typescript
/**
 * CourseCard Component
 * @component
 * @example
 * ```tsx
 * <CourseCard course={course} />
 * ```
 */
const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Implementation
};
````

## סיכום 📝

### מטרות טכניות

1. ביצועים מעולים
2. אבטחה גבוהה
3. יכולת הרחבה
4. תחזוקה פשוטה
5. אמינות גבוהה

### המלצות

1. שדרוג תשתיות
2. שיפור ביצועים
3. הרחבת בדיקות
4. שיפור ניטור
5. עדכון תיעוד
