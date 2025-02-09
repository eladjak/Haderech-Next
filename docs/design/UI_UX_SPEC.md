# מפרט עיצוב וחווית משתמש 🎨

## 🎯 עקרונות מנחים

### 1. פשטות ובהירות

- עיצוב נקי ומינימליסטי
- היררכיה ויזואלית ברורה
- מרחב לבן מאוזן
- טיפוגרפיה קריאה

### 2. עקביות

- שפה עיצובית אחידה
- אלמנטים חוזרים
- התנהגות צפויה
- משוב עקבי

### 3. נגישות

- WCAG 2.1 AA
- ניגודיות צבעים
- תמיכה בקורא מסך
- ניווט מקלדת

### 4. רספונסיביות

- Mobile First
- התאמה לכל המסכים
- חוויה עקבית
- ביצועים מיטביים

## 🎨 שפה עיצובית

### 1. צבעים

```css
:root {
  /* צבעי מותג */
  --brand-primary: #4a90e2; /* כחול */
  --brand-secondary: #7ed321; /* ירוק */

  /* צבעי רקע */
  --bg-primary: #ffffff; /* לבן */
  --bg-secondary: #f5f7fa; /* אפור בהיר */
  --bg-tertiary: #e4e7eb; /* אפור */

  /* צבעי טקסט */
  --text-primary: #1a1a1a; /* שחור */
  --text-secondary: #4a5568; /* אפור כהה */
  --text-tertiary: #718096; /* אפור בינוני */

  /* צבעי פעולה */
  --action-primary: #4a90e2; /* כחול */
  --action-success: #7ed321; /* ירוק */
  --action-warning: #f5a623; /* כתום */
  --action-error: #ff4d4d; /* אדום */

  /* צבעי גבול */
  --border-light: #e2e8f0; /* אפור בהיר */
  --border-medium: #cbd5e0; /* אפור בינוני */
  --border-dark: #718096; /* אפור כהה */
}
```

### 2. טיפוגרפיה

```css
:root {
  /* גדלי טקסט */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */

  /* משקלים */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* משפחות פונטים */
  --font-primary: "Heebo", sans-serif;
  --font-secondary: "Assistant", sans-serif;
}
```

### 3. מרווחים

```css
:root {
  /* מרווחים */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
  --spacing-2xl: 3rem; /* 48px */

  /* רדיוס */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 1rem; /* 16px */
  --radius-full: 9999px;
}
```

## 🧩 קומפוננטות

### 1. כפתורים

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "link";
  size: "sm" | "md" | "lg";
  state: "default" | "loading" | "disabled";
}

const buttonStyles = {
  primary: `
    bg-primary
    text-white
    hover:bg-primary-dark
    active:bg-primary-darker
  `,
  secondary: `
    bg-secondary
    text-primary
    hover:bg-secondary-dark
    active:bg-secondary-darker
  `,
  // ...
};
```

### 2. קלט

```typescript
interface InputProps {
  type: "text" | "email" | "password" | "number";
  size: "sm" | "md" | "lg";
  state: "default" | "error" | "success" | "disabled";
}

const inputStyles = {
  default: `
    border-gray-300
    focus:border-primary
    focus:ring-primary
  `,
  error: `
    border-error
    focus:border-error
    focus:ring-error
  `,
  // ...
};
```

### 3. כרטיסים

```typescript
interface CardProps {
  variant: "default" | "elevated" | "bordered";
  padding: "none" | "sm" | "md" | "lg";
  interactive: boolean;
}

const cardStyles = {
  default: `
    bg-white
    rounded-lg
    shadow-sm
  `,
  elevated: `
    bg-white
    rounded-lg
    shadow-md
    hover:shadow-lg
  `,
  // ...
};
```

## 📱 תבניות מסך

### 1. דף הבית

```typescript
interface HomePageLayout {
  header: {
    nav: NavComponent;
    search: SearchComponent;
    userMenu: UserMenuComponent;
  };
  main: {
    hero: HeroComponent;
    featuredCourses: CourseGridComponent;
    testimonials: TestimonialsComponent;
  };
  footer: FooterComponent;
}
```

### 2. דף קורס

```typescript
interface CoursePageLayout {
  header: CourseHeaderComponent;
  sidebar: {
    progress: ProgressComponent;
    chapters: ChapterListComponent;
    resources: ResourcesComponent;
  };
  main: {
    content: CourseContentComponent;
    discussion: DiscussionComponent;
  };
}
```

## 🔄 אנימציות ומעברים

### 1. מעברי דף

```css
/* מעברי דף */
.page-transition {
  transition: opacity 0.3s ease-in-out;
}

.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
}
```

### 2. אנימציות ממשק

```css
/* אנימציות ממשק */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

## 📱 התאמה למובייל

### 1. נקודות שבירה

```css
/* נקודות שבירה */
@media (max-width: 640px) {
  /* נייד */
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* טאבלט */
}

@media (min-width: 1025px) {
  /* דסקטופ */
}
```

### 2. תפריט נייד

```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
}

const mobileMenuStyles = {
  overlay: `
    fixed
    inset-0
    bg-black
    bg-opacity-50
    z-50
  `,
  menu: `
    fixed
    inset-y-0
    right-0
    w-64
    bg-white
    shadow-xl
    z-50
  `,
};
```

## 🎯 מדדי UX

### 1. זמני טעינה

- טעינה ראשונית: < 2 שניות
- טעינת דף: < 1 שניה
- אינטראקציה: < 100ms

### 2. נגישות

- ציון WAVE: 0 שגיאות
- ציון Lighthouse: > 90
- כיסוי WCAG: 100%

### 3. שימושיות

- זמן למשימה: < 30 שניות
- שיעור הצלחה: > 90%
- שביעות רצון: > 4/5

## 📝 הערות

1. **עדכונים**:

   - יש לעדכן את המפרט בכל שינוי משמעותי
   - לתעד החלטות עיצוביות
   - לשמור על גרסאות

2. **בדיקות**:

   - לבצע בדיקות משתמשים
   - לאסוף משוב
   - לנתח התנהגות

3. **שיפורים**:
   - לעקוב אחר טרנדים
   - לבחון טכנולוגיות חדשות
   - לשפר באופן מתמיד
