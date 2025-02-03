# תכנית בדיקות - HaDerech Next 🧪

## סקירה כללית 📋

תכנית זו מפרטת את אסטרטגיית הבדיקות עבור פרויקט הדרך, כולל בדיקות יחידה, אינטגרציה, קצה-לקצה וביצועים.

## סוגי בדיקות 🔍

### 1. בדיקות יחידה

```typescript
// דוגמה לבדיקת יחידה
describe("AuthService", () => {
  it("should validate email format", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
  });
});
```

### 2. בדיקות אינטגרציה

```typescript
// דוגמה לבדיקת אינטגרציה
describe("CourseEnrollment", () => {
  it("should enroll user in course", async () => {
    const result = await enrollUserInCourse(userId, courseId);
    expect(result.success).toBe(true);
    expect(result.enrollment).toBeDefined();
  });
});
```

### 3. בדיקות E2E

```typescript
// דוגמה לבדיקת E2E
describe("Login Flow", () => {
  it("should login successfully", async () => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## תרחישי בדיקה 📝

### 1. אימות משתמשים

- [x] הרשמה תקינה
- [x] התחברות תקינה
- [x] שחזור סיסמה
- [ ] אימות דו-שלבי
- [ ] התחברות חברתית
- [ ] ניהול סשן

### 2. ניהול קורסים

- [x] יצירת קורס
- [x] עריכת קורס
- [x] מחיקת קורס
- [ ] הרשמה לקורס
- [ ] ביטול הרשמה
- [ ] דירוג קורס

### 3. תוכן לימודי

- [x] צפייה בשיעור
- [x] הגשת תרגיל
- [x] מענה על מבחן
- [ ] מעקב התקדמות
- [ ] סימון השלמה
- [ ] הורדת חומרים

## כלי בדיקה 🛠️

### 1. Jest

```typescript
// הגדרות Jest
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### 2. Playwright

```typescript
// הגדרות Playwright
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
  },
};

export default config;
```

### 3. Testing Library

```typescript
// דוגמה לשימוש ב-Testing Library
import { render, screen } from '@testing-library/react';

test('renders login form', () => {
  render(<LoginForm />);
  expect(screen.getByRole('button')).toHaveTextContent('התחבר');
});
```

## בדיקות ביצועים 🚀

### 1. זמני טעינה

```typescript
// בדיקת זמני טעינה
describe("Page Load Times", () => {
  it("should load within 2 seconds", async () => {
    const start = performance.now();
    await page.goto("/");
    const end = performance.now();
    expect(end - start).toBeLessThan(2000);
  });
});
```

### 2. שימוש במשאבים

```typescript
// בדיקת שימוש בזיכרון
describe("Memory Usage", () => {
  it("should not leak memory", async () => {
    const startHeap = process.memoryUsage().heapUsed;
    await performOperations();
    const endHeap = process.memoryUsage().heapUsed;
    expect(endHeap - startHeap).toBeLessThan(1000000);
  });
});
```

## בדיקות אבטחה 🔒

### 1. אימות

```typescript
// בדיקות אבטחה
describe("Security", () => {
  it("should prevent unauthorized access", async () => {
    const response = await fetch("/api/protected");
    expect(response.status).toBe(401);
  });
});
```

### 2. הרשאות

```typescript
// בדיקת הרשאות
describe("Permissions", () => {
  it("should restrict admin actions", async () => {
    const user = await createUser("user");
    const response = await fetch("/api/admin", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(response.status).toBe(403);
  });
});
```

## בדיקות נגישות ♿

### 1. WCAG

```typescript
// בדיקות נגישות
describe("Accessibility", () => {
  it("should meet WCAG guidelines", async () => {
    const results = await axe(document.body);
    expect(results.violations).toHaveLength(0);
  });
});
```

### 2. תמיכה במקלדת

```typescript
// בדיקת ניווט מקלדת
describe("Keyboard Navigation", () => {
  it("should be keyboard accessible", async () => {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).not.toBe("BODY");
  });
});
```

## בדיקות תאימות 🌐

### 1. דפדפנים

```typescript
// בדיקת תאימות דפדפנים
describe("Browser Compatibility", () => {
  const browsers = ["chromium", "firefox", "webkit"];

  browsers.forEach((browser) => {
    it(`should work in ${browser}`, async () => {
      // בדיקות ספציפיות לדפדפן
    });
  });
});
```

### 2. מכשירים

```typescript
// בדיקת תצוגה במכשירים שונים
describe("Device Compatibility", () => {
  const devices = ["Desktop", "Tablet", "Mobile"];

  devices.forEach((device) => {
    it(`should display correctly on ${device}`, async () => {
      // בדיקות ספציפיות למכשיר
    });
  });
});
```

## תהליך CI/CD 🔄

### 1. GitHub Actions

```yaml
# תצורת GitHub Actions
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

### 2. בדיקות אוטומטיות

```typescript
// הגדרת בדיקות אוטומטיות
export const setupAutomatedTests = () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });
};
```

## דיווח ותיעוד 📊

### 1. דוחות בדיקה

```typescript
// יצירת דוח בדיקות
const generateTestReport = async (results: TestResults) => {
  return {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    duration: results.reduce((acc, r) => acc + r.duration, 0),
  };
};
```

### 2. כיסוי קוד

```typescript
// הגדרות כיסוי קוד
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## סיכום 📝

### מטרות

- כיסוי בדיקות מקיף
- איכות קוד גבוהה
- זיהוי באגים מוקדם
- אוטומציה מלאה
- תיעוד מפורט

### המלצות

1. הרחבת כיסוי בדיקות
2. שיפור אוטומציה
3. הוספת בדיקות ביצועים
4. שיפור תיעוד
5. עדכון שוטף
