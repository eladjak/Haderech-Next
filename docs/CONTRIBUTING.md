# Contributing to HaDerech

Thank you for your interest in contributing to HaDerech! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

There are many ways you can contribute to HaDerech:

1. **Report bugs**: Submit issues for any bugs you encounter.
2. **Suggest enhancements**: Submit ideas for new features or improvements.
3. **Contribute code**: Submit pull requests with bug fixes or new features.
4. **Improve documentation**: Help us improve our documentation.
5. **Share feedback**: Provide feedback on the user experience.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/haderech-next.git`
3. Navigate to the project: `cd haderech-next`
4. Install dependencies: `pnpm install`
5. Copy `.env.example` to `.env.local` and set up your environment variables
6. Start the development server: `pnpm dev`

## Coding Standards

We follow specific coding standards to ensure code quality and consistency:

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the project's existing coding style
- Use meaningful variable and function names
- Write comments for complex logic
- Prefer functional programming patterns

```typescript
// Good example
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Avoid
function calc(i: any[]): number {
  let t = 0;
  for (let x = 0; x < i.length; x++) {
    t += i[x].price;
  }
  return t;
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use destructuring for props
- Add proper typing for components and props
- Use named exports for components

```tsx
// Good example
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({
  label,
  onClick,
  variant = "primary",
}: ButtonProps): React.ReactElement {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Styles

- Use Tailwind CSS for styling
- Follow the project's design system
- Keep responsive design in mind
- Use CSS variables for theming
- Follow the BEM methodology for custom CSS classes

## Pull Request Process

1. Create a new branch for your changes
2. Make your changes and commit them with descriptive commit messages
3. Push your changes to your fork
4. Submit a pull request to the `main` branch
5. Ensure your PR includes:
   - A descriptive title
   - A description of the changes
   - Any relevant issue numbers (e.g., "Fixes #123")
   - Tests for new features or bug fixes
   - Updated documentation if necessary
6. Address any code review feedback

## Testing Guidelines

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Cover edge cases and error scenarios
- Write both unit and integration tests when appropriate
- Follow the existing test patterns

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders the label correctly', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation Guidelines

- Keep documentation up-to-date with code changes
- Write clear and concise documentation
- Use JSDoc comments for functions and components
- Document complex logic and algorithms
- Include examples where appropriate

---

<div dir="rtl">

# תרומה לפרויקט הדרך

תודה על התעניינותך בתרומה לפרויקט הדרך! מסמך זה מספק הנחיות והוראות לתרומה לפרויקט.

## תוכן עניינים

- [קוד התנהגות](#קוד-התנהגות)
- [כיצד ניתן לתרום?](#כיצד-ניתן-לתרום)
- [התקנת סביבת פיתוח](#התקנת-סביבת-פיתוח)
- [סטנדרטים לכתיבת קוד](#סטנדרטים-לכתיבת-קוד)
- [תהליך הגשת בקשות משיכה (Pull Requests)](#תהליך-הגשת-בקשות-משיכה)
- [הנחיות לבדיקות](#הנחיות-לבדיקות)
- [הנחיות לתיעוד](#הנחיות-לתיעוד)

## קוד התנהגות

פרויקט זה מחזיק בקוד התנהגות המגדיר ציפיות להשתתפות בקהילה שלנו. על ידי השתתפותך, מצופה ממך לשמור על קוד זה. אנא קרא את [קוד ההתנהגות](CODE_OF_CONDUCT.md) לפני התרומה.

## כיצד ניתן לתרום?

ישנן דרכים רבות בהן תוכל לתרום לפרויקט הדרך:

1. **דווח על באגים**: שלח דיווחים על באגים שנתקלת בהם.
2. **הצע שיפורים**: שלח רעיונות לתכונות חדשות או שיפורים.
3. **תרום קוד**: שלח בקשות משיכה עם תיקוני באגים או תכונות חדשות.
4. **שפר את התיעוד**: עזור לנו לשפר את התיעוד שלנו.
5. **שתף משוב**: ספק משוב על חוויית המשתמש.

## התקנת סביבת פיתוח

1. בצע פיצול (Fork) של המאגר
2. שכפל את הפיצול שלך: `git clone https://github.com/YOUR-USERNAME/haderech-next.git`
3. נווט לפרויקט: `cd haderech-next`
4. התקן תלויות: `pnpm install`
5. העתק את `.env.example` ל-`.env.local` והגדר את משתני הסביבה שלך
6. הפעל את שרת הפיתוח: `pnpm dev`

## סטנדרטים לכתיבת קוד

אנו עוקבים אחר סטנדרטים ספציפיים לכתיבת קוד כדי להבטיח איכות ועקביות:

### JavaScript/TypeScript

- השתמש ב-TypeScript עבור כל קוד חדש
- עקוב אחר סגנון הקוד הקיים בפרויקט
- השתמש בשמות משמעותיים למשתנים ופונקציות
- כתוב הערות עבור לוגיקה מורכבת
- העדף דפוסי תכנות פונקציונליים

```typescript
// דוגמה טובה
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// להימנע
function calc(i: any[]): number {
  let t = 0;
  for (let x = 0; x < i.length; x++) {
    t += i[x].price;
  }
  return t;
}
```

### רכיבי React

- השתמש ברכיבים פונקציונליים עם hooks
- שמור על רכיבים קטנים וממוקדים
- השתמש בפירוק (destructuring) עבור props
- הוסף טיפוסים מתאימים לרכיבים ול-props
- השתמש בייצוא שמי (named exports) עבור רכיבים

```tsx
// דוגמה טובה
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({
  label,
  onClick,
  variant = "primary",
}: ButtonProps): React.ReactElement {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### סגנונות

- השתמש ב-Tailwind CSS לעיצוב
- עקוב אחר מערכת העיצוב של הפרויקט
- שמור על עיצוב רספונסיבי
- השתמש במשתני CSS לנושאים (theming)
- עקוב אחר מתודולוגיית BEM עבור מחלקות CSS מותאמות אישית

## תהליך הגשת בקשות משיכה

1. צור ענף חדש עבור השינויים שלך
2. בצע את השינויים שלך וקבע אותם עם הודעות commit תיאוריות
3. דחוף את השינויים שלך לפיצול שלך
4. הגש בקשת משיכה לענף `main`
5. ודא שה-PR שלך כולל:
   - כותרת תיאורית
   - תיאור של השינויים
   - מספרי issues רלוונטיים (למשל, "Fixes #123")
   - בדיקות עבור תכונות חדשות או תיקוני באגים
   - תיעוד מעודכן אם נדרש
6. טפל במשובים שיתקבלו בסקירת הקוד

## הנחיות לבדיקות

- כתוב בדיקות עבור תכונות חדשות ותיקוני באגים
- ודא שכל הבדיקות עוברות לפני הגשת PR
- כסה מקרי קצה ותרחישי שגיאה
- כתוב בדיקות יחידה ואינטגרציה כאשר מתאים
- עקוב אחר דפוסי הבדיקה הקיימים

```typescript
// דוגמת בדיקה
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('מציג את התווית כראוי', () => {
    render(<Button label="לחץ עליי" onClick={() => {}} />);
    expect(screen.getByText('לחץ עליי')).toBeInTheDocument();
  });

  it('קורא ל-onClick בעת לחיצה', () => {
    const handleClick = vi.fn();
    render(<Button label="לחץ עליי" onClick={handleClick} />);
    screen.getByText('לחץ עליי').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## הנחיות לתיעוד

- שמור על תיעוד מעודכן עם שינויי קוד
- כתוב תיעוד ברור ותמציתי
- השתמש בהערות JSDoc עבור פונקציות ורכיבים
- תעד לוגיקה ואלגוריתמים מורכבים
- כלול דוגמאות כאשר מתאים

</div>
