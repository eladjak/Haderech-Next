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

## 🔄 Recent Updates

- **Next.js 14 Compatibility** - Updated API routes to use Next.js 14 standards:

  - Removed unnecessary "use client" directives from API files
  - Updated Supabase client from createServerClient to createRouteHandlerClient
  - Standardized Database type imports
  - [See detailed documentation](docs/api-client-directive-fixes.md)

- **Build Fixes** - Fixed several build issues:

  - Corrected "use client" directive placement in client components
  - Fixed component imports and type definitions
  - Standardized service function interfaces
  - [See detailed documentation](docs/build-issues-fixes.md)

- **Supabase Client Upgrade** - Upgraded Supabase client to support Next.js 14
- **Redux Type Fixes** - Fixed type issues in Redux and recommendation engine
- **Zod Usage Fixes** - Fixed issues in Zod usage

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

> **Note about environment variables:**  
> The application has a sophisticated environment variable management system that distinguishes between critical variables (required in all environments) and optional variables (only required in development or with reduced functionality). See [Environment Variables Documentation](docs/lessons-learned/ENVIRONMENT_VARIABLES.md) for details about our approach.
>
> **Critical variables (required in all environments):**
>
> - `NEXT_PUBLIC_SUPABASE_URL`
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
>
> For development, most other variables are required. In production, many are optional with fallback mechanisms in place.

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

### TypeScript Error Fixes

The project includes several Python scripts to help with common TypeScript errors:

- `scripts/code-fixes/run_all_fixes.py` - Runner script for all code fixes
- `scripts/code-fixes/fix_type_files.py` - Fixes issues in TypeScript type files (interfaces, types)
- `scripts/code-fixes/fix_component_files.py` - Fixes common issues in React component files
- `scripts/code-fixes/fix_test_files.py` - Fixes issues in test files
- `scripts/code-fixes/fix_ui_components.py` - Fixes issues in UI component files
- `scripts/code-fixes/fix_api_and_models.py` - Fixes issues in API and model files
- `scripts/code-fixes/fix_forum_and_store.py` - Fixes issues in forum and store files
- `scripts/code-fixes/fix_imports_and_semis.py` - Fixes import order and unnecessary semicolons

To run all fixes:

```bash
python scripts/code-fixes/run_all_fixes.py
```

Or run individual scripts:

```bash
python scripts/code-fixes/fix_type_files.py
```

For more details, see the [Code Correction Documentation](docs/code-correction.md).

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

**מעודכן לאחרונה: 15/07/2024**

פלטפורמת למידה בעברית המשלבת תכנים איכותיים, תרגולים אינטראקטיביים וטכנולוגיות מתקדמות כמו צ'אטבוט AI ומשחוק (Gamification).

## שיפורים אחרונים

- תיקון שגיאות בנייה ב-Vercel
- שיפור התמיכה בדירקטיבת `"use client"`
- עדכון והרחבת קומפוננטות UI
- שיפור טיפול בשגיאות תחביר בקבצים שונים

## התקנה והפעלה

1. התקן את תלויות הפרויקט:

```bash
pnpm install
```

2. הפעל את סביבת הפיתוח:

```bash
pnpm dev
```

3. פתח את הדפדפן בכתובת: http://localhost:3000

## יכולות עיקריות

- **קורסים אינטראקטיביים** - למידה אינטראקטיבית עם תרגולים מעשיים ומשוב מיידי
- **צ'אטבוט חכם** - עוזר אישי המבוסס על AI שעונה על שאלות ומכוון את הלמידה
- **מערכת משחוק** - נקודות, תגים והישגים המעודדים התקדמות ופעילות
- **פורום קהילתי** - שיתוף ידע ולמידת עמיתים
- **אזור אישי** - מעקב אחר התקדמות, הישגים ופעילות

## טכנולוגיות

- **Next.js 14** - פריימוורק React המוביל לפיתוח אפליקציות מודרניות
- **TypeScript** - הבטחת איכות קוד ותחזוקה קלה
- **Tailwind CSS** - עיצוב מודרני ותגובתי
- **Prisma** - תקשורת יעילה וטיפוסית עם בסיס הנתונים
- **NextAuth.js** - אימות משתמשים בצורה מאובטחת וגמישה

## רישיון

הפרויקט מפותח על ידי צוות "הדרך" ומוגן בזכויות יוצרים. כל שימוש מסחרי דורש אישור מפורש מבעלי הזכויות.

## תרומה לפרויקט

1. צור Fork של הפרויקט
2. צור ענף חדש (`git checkout -b feature/amazing-feature`)
3. בצע את השינויים שלך
4. דחוף לענף (`git push origin feature/amazing-feature`)
5. פתח בקשת משיכה (Pull Request)

## יצירת קשר

- דוא"ל: email@example.com
- טוויטר: [@username](https://twitter.com/username)
- פרויקט: [GitHub Issues](https://github.com/yourusername/haderech-next/issues)

</div>
