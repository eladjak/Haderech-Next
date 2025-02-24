# 🛣️ HaDerech - Advanced Learning Platform

## 📝 Description

HaDerech is an advanced learning platform combining an interactive simulator, community forum, and online courses. The platform is designed to help users develop professional and personal skills through experiential and interactive learning.

[Read documentation in English](docs/ARCHITECTURE.md)

## 🚀 Key Features

- **Course System** - Interactive courses with support for video, text, and exercises
- **Community Forum** - Advanced forum with category, tag, and search support
- **Practice Simulator** - Interactive training environment with real-time feedback
- **Achievement System** - Points system, badges, and achievements
- **Modern User Interface** - Clean, modern design with full RTL support

## 🛠 Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js, Supabase Auth
- **State Management**: React Context, TanStack Query
- **Testing**: Vitest, Jest, Playwright
- **Linting**: ESLint, Prettier
- **CI/CD**: GitHub Actions, Vercel

## 📋 System Requirements

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Supabase account or self-hosted instance

## ⚙️ Installation

1. Clone the project:

```bash
git clone https://github.com/your-username/haderech-next.git
cd haderech-next
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with appropriate values, especially the Supabase configuration.

4. Run the development server:

```bash
pnpm dev
```

5. Build for production:

```bash
pnpm build
```

## 🏗️ Project Structure

```
haderech-next/
├── src/                   # Source code
│   ├── app/               # Next.js App Router pages and layouts
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   ├── constants/         # Application constants
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries and utilities
│   ├── locales/           # Internationalization files
│   ├── models/            # Data models
│   ├── providers/         # Service providers
│   ├── services/          # Business logic services
│   ├── store/             # State management
│   ├── styles/            # Global styles
│   ├── tests/             # Test files
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
├── prisma/                # Database schema and migrations
├── tests/                 # Additional tests
├── docs/                  # Documentation
└── supabase/              # Supabase configuration
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Component Library](docs/COMPONENTS.md)
- [Testing Strategy](docs/TESTING.md)

## 🔍 Development

### Type Checking

```bash
pnpm type-check
```

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Linting

```bash
pnpm lint
```

### Development Server

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

## 🗄️ Database

This project uses Supabase for database, authentication, and storage. The database schema is defined in the Supabase dashboard or through migration files.

### Supabase CLI Commands:

```bash
# Generate TypeScript types from Supabase
pnpm supabase gen types typescript --project-id <your-project-id> --schema public > src/types/supabase.ts

# Start local Supabase
pnpm supabase start

# Apply local migrations
pnpm supabase db push
```

## 📈 Quality Metrics

### Performance

- Initial load time: < 2 seconds
- First Contentful Paint: < 1 second
- Time to Interactive: < 3 seconds
- Lighthouse score: > 90

### Accessibility

- WCAG score: AA
- Lighthouse accessibility score: > 90
- ARIA coverage: 100%
- Full keyboard support

### Security

- OWASP compliance
- Zero critical vulnerabilities
- Package freshness: 100%
- Security coverage: > 95%

## 🤝 Contributing

1. Fork the project
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

## 👥 Team

- Elad Jacobi - Founder and Lead Developer

## 📞 Contact

- **Website**: [haderech.co.il](https://haderech.co.il)
- **Email**: [contact@haderech.co.il](mailto:contact@haderech.co.il)
- **Telegram**: [@haderech](https://t.me/haderech)

---

<div dir="rtl">

# הדרך - פלטפורמת למידה מתקדמת

**הדרך** היא פלטפורמת למידה אינטראקטיבית המאפשרת לפתח כישורים מקצועיים דרך קורסים, פורומים קהילתיים, וסימולטורים.

## תכונות מרכזיות

- **מערכת קורסים**: קורסים מובנים עם וידאו, טקסט ותרגולים אינטראקטיביים
- **פורום קהילתי**: לשאלות, דיונים ושיתוף ידע
- **סימולטור תרגול**: להתנסות בתרחישים מציאותיים
- **מערכת הישגים**: מעקב אחר התקדמות ופרסים וירטואליים
- **ממשק משתמש מודרני**: חוויית משתמש נוחה ונגישה

## טכנולוגיות

הפרויקט משתמש בטכנולוגיות המתקדמות ביותר:

- **Next.js 14**: עם App Router לניהול דפים ונתיבים
- **React 18**: לממשק משתמש תגובתי ומודרני
- **TypeScript**: לכתיבת קוד יציב ומתוחזק
- **Tailwind CSS**: לעיצוב מהיר ומותאם
- **Supabase**: לניהול משתמשים, אימות, ובסיס נתונים
- **Redux Toolkit**: לניהול מצב אפליקציה
- **OpenAI API**: לאלמנטים מבוססי בינה מלאכותית
- **ShadcnUI & Radix UI**: לקומפוננטות נגישות

## דרישות מערכת

- Node.js 18.0.0 ומעלה
- pnpm 8.0.0 ומעלה
- חשבון Supabase

## התקנה

1. שכפל את הפרויקט:

```bash
git clone https://github.com/yourusername/haderech-next.git
cd haderech-next
```

2. התקן את התלויות:

```bash
pnpm install
```

3. הגדר משתני סביבה:

   - צור קובץ `.env.local` בתיקית הפרויקט
   - העתק את התוכן מ-`.env.example` והגדר את הערכים הנדרשים

4. הפעל את שרת הפיתוח:

```bash
pnpm dev
```

5. בנה לסביבת ייצור:

```bash
pnpm build
pnpm start
```

## מבנה הפרויקט

```
haderech-next/
├── docs/               # תיעוד פרויקט
├── lib/                # קוד משותף וספריות
├── public/             # קבצים סטטיים
├── src/
│   ├── app/            # רכיבי דפים ונתיבי API
│   ├── components/     # רכיבי React משותפים
│   ├── constants/      # קבועים וערכים מוגדרים מראש
│   ├── hooks/          # React hooks מותאמים
│   ├── lib/            # פונקציות שירות וכלים
│   ├── store/          # Redux store וslices
│   ├── styles/         # קבצי CSS
│   ├── tests/          # בדיקות אוטומטיות
│   └── types/          # הגדרות TypeScript
├── .env.example        # דוגמה למשתני סביבה
├── .eslintrc.js        # תצורת ESLint
├── next.config.js      # תצורת Next.js
├── package.json        # תלויות פרויקט
└── tsconfig.json       # תצורת TypeScript
```

## קישורי תיעוד

- [סקירת ארכיטקטורה](./docs/ARCHITECTURE.md)
- [תיעוד API](./docs/API.md)
- [ספריית רכיבים](./docs/COMPONENTS.md)
- [אסטרטגיית בדיקות](./docs/TESTING.md)

## פיתוח

```bash
# בדיקת טיפוסים
pnpm type-check

# הרצת בדיקות יחידה
pnpm test

# הרצת בדיקות קצה-לקצה
pnpm test:e2e

# בדיקות לינט
pnpm lint

# שרת פיתוח
pnpm dev
```

## בסיס נתונים

הפרויקט משתמש ב-Supabase לניהול בסיס נתונים, אימות משתמשים ואחסון.

```bash
# התקנת CLI של Supabase
npm install -g supabase

# התחברות לפרויקט
supabase login
supabase link --project-ref <your-project-id>

# דחיפת סכמה לבסיס הנתונים
supabase db push
```

## מדדי איכות

- **ביצועים**: עמידה בסטנדרטים של Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **נגישות**: תאימות ל-WCAG 2.1 AA
- **אבטחה**: בדיקות אבטחה סדירות וטיפול בסיכונים

## תרומה לפרויקט

1. צור Fork של הפרויקט
2. צור ענף חדש (`git checkout -b feature/amazing-feature`)
3. בצע את השינויים שלך
4. דחוף לענף (`git push origin feature/amazing-feature`)
5. פתח בקשת משיכה (Pull Request)

## רישיון

הפרויקט מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים.

## צוות

- **אלעד יעקבי** - מייסד ומפתח ראשי - [GitHub](https://github.com/username)

## יצירת קשר

- דוא"ל: email@example.com
- טוויטר: [@username](https://twitter.com/username)
- פרויקט: [GitHub Issues](https://github.com/yourusername/haderech-next/issues)

</div>
