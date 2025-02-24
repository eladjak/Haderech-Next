# 🧪 מערכת הבדיקות של HaDerech

## 📋 סקירה כללית

מערכת הבדיקות של HaDerech מבוססת על Vitest כמסגרת הבדיקות העיקרית. אנחנו משתמשים במספר כלים וספריות נוספות כדי להבטיח כיסוי מקיף של הקוד:

- **Vitest**: מסגרת בדיקות מודרנית ומהירה
- **Testing Library**: לבדיקות קומפוננטות React
- **jest-axe**: לבדיקות נגישות
- **Playwright**: לבדיקות End-to-End

## 🎯 סוגי בדיקות ומטרות

### 1. בדיקות יחידה (Unit Tests)

**מיקום**: `src/tests/unit`

**מטרות**:

- בדיקת פונקציונליות בודדת
- בדיקת קלט/פלט
- בדיקת מקרי קצה
- בדיקת שגיאות

**כלים**:

- Vitest
- Testing Library

### 2. בדיקות אינטגרציה (Integration Tests)

**מיקום**: `src/tests/integration`

**מטרות**:

- בדיקת תקשורת בין רכיבים
- בדיקת תזרימי עבודה
- בדיקת ממשקים

**כלים**:

- Vitest
- Testing Library
- Mock Service Worker

### 3. בדיקות E2E

**מיקום**: `src/tests/e2e`

**מטרות**:

- בדיקת הפונקציונליות המלאה
- בדיקת תרחישי משתמש
- בדיקת ביצועים

**כלים**:

- Playwright
- Cypress (לבדיקות מיוחדות)

### 4. בדיקות נגישות

**מטרות**:

- תאימות WCAG 2.1
- ניווט מקלדת
- קוראי מסך
- ניגודיות צבעים

**כלים**:

- jest-axe
- Testing Library
- Lighthouse

## 🏃‍♂️ הרצת בדיקות

```bash
# הרצת כל הבדיקות
pnpm test

# הרצת בדיקות במצב צפייה
pnpm run test:watch

# הרצת בדיקות עם כיסוי
pnpm run test:coverage

# הרצת בדיקות E2E
pnpm run test:e2e

# הרצת בדיקות נגישות
pnpm run test:a11y

# הרצת בדיקות אינטגרציה
pnpm run test:integration
```

## 🛠 כתיבת בדיקות

### מבנה בדיקה

```typescript
describe("Component/Function Name", () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it("should do something specific", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Matchers מותאמים אישית

```typescript
// בדיקות נגישות
expect(element).toBeAccessible();
expect(element).toHaveNoViolations();

// בדיקות תקינות
expect(value).toBeValidEmail();
expect(value).toBeValidUrl();
expect(value).toBeValidDate();
```

### דוגמאות

#### בדיקת קומפוננטה

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("כותרת")).toBeInTheDocument();
  });

  it("handles user interaction", () => {
    const onClickMock = vi.fn();
    render(<MyComponent onClick={onClickMock} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClickMock).toHaveBeenCalled();
  });
});
```

#### בדיקת שירות

```typescript
import { MyService } from "./MyService";

describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it("processes data correctly", async () => {
    const result = await service.processData({ id: 1 });
    expect(result).toEqual({ processed: true });
  });

  it("handles errors", async () => {
    await expect(service.processData(null)).rejects.toThrow();
  });
});
```

## 📊 כיסוי קוד ומדדים

### יעדי כיסוי

- כיסוי כללי: 80% מינימום
- כיסוי ענפים: 70%
- כיסוי פונקציות: 90%
- כיסוי שורות: 80%

### כיסוי פונקציונלי

- תרחישי שימוש: 90%
- תכונות עיקריות: 100%
- ממשקי משתמש: 80%

### מדדי איכות

- אחוז בדיקות שעוברות
- זמן ריצת בדיקות
- מספר באגים שנמצאו
- יציבות בדיקות

## 🔄 CI/CD ואוטומציה

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm run test:e2e
      - run: pnpm run test:a11y
```

### דוחות

- כיסוי קוד: `/coverage`
- דוחות E2E: `/test-results`
- דוחות נגישות: `/a11y-reports`

### כלי ניטור

- SonarQube
- CodeClimate
- GitHub Actions

## 📝 שיטות עבודה מומלצות

1. **תכנון בדיקות**:

   - כתיבת בדיקות לפני קוד (TDD)
   - כיסוי מקרי קצה
   - בדיקות שליליות

2. **ארגון קוד**:

   - בדיקות קטנות וממוקדות
   - שמות תיאוריים
   - הימנעות מכפילויות

3. **תחזוקה**:

   - עדכון בדיקות עם שינויי קוד
   - ניקוי בדיקות ישנות
   - שיפור ביצועים

4. **דגשים חשובים**:
   - אין להשתמש ב-snapshot testing אלא במקרים מיוחדים
   - יש להשתמש ב-data-testid לבחירת אלמנטים
   - יש להימנע מבדיקות שבירות (flaky tests)

## 📚 משאבים ותיעוד

### קישורים שימושיים

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Jest](https://jestjs.io/)

### תרומה לפרויקט

1. הוסף בדיקות לקוד חדש
2. שפר כיסוי קוד קיים
3. תקן בדיקות שנכשלות
4. הוסף בדיקות מקרי קצה
5. שפר תיעוד בדיקות
