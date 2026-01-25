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

## 🏛️ Architecture Decision Records (ADR)

### Why Redux for State Management?

We chose Redux Toolkit for global state management due to:

- **Predictable state updates**: Centralized state makes debugging easier
- **DevTools integration**: Time-travel debugging and state inspection
- **TypeScript support**: Excellent type inference with Redux Toolkit
- **Middleware ecosystem**: Support for async operations, logging, and persistence
- **Community adoption**: Large ecosystem of tools and patterns

**Alternatives considered**: Zustand (simpler but less tooling), Recoil (less mature), React Context (not suitable for complex state).

### Why Supabase over Firebase?

Supabase was selected as our Backend-as-a-Service for:

- **PostgreSQL foundation**: Full SQL capabilities vs. NoSQL limitations
- **Open source**: Self-hostable and transparent codebase
- **Real-time capabilities**: Built-in subscriptions for live updates
- **Row Level Security**: Database-level authorization rules
- **TypeScript support**: Auto-generated types from schema
- **Cost efficiency**: More predictable pricing model

**Alternatives considered**: Firebase (vendor lock-in concerns), AWS Amplify (complexity), PocketBase (less mature).

### Why Next.js 14 App Router?

The App Router provides significant advantages:

- **Server Components**: Reduced JavaScript bundle size, improved performance
- **Nested layouts**: Better code organization and data fetching
- **Streaming SSR**: Progressive rendering for faster perceived load times
- **Built-in optimization**: Automatic image optimization, font loading
- **File-based routing**: Intuitive routing structure
- **API routes**: Full-stack capabilities in one framework

**Alternatives considered**: Remix (smaller ecosystem), Vite + React Router (more configuration needed), Pages Router (outdated pattern).

### Why Logger over Console Statements?

We implemented a centralized logger to:

- **Environment awareness**: Different behavior in dev vs. production
- **Error tracking integration**: Automatic reporting to Sentry/LogRocket
- **Structured logging**: Consistent format for parsing and analysis
- **Production safety**: No console.log cluttering production code
- **Performance**: Conditional logging reduces overhead

## 📖 API Documentation

### Authentication

All authenticated endpoints require a valid session token in cookies or Authorization header.

#### Sign In
```typescript
POST /api/auth/signin
Body: { email: string, password: string }
Response: { user: User, session: Session }
```

#### Sign Up
```typescript
POST /api/auth/signup
Body: { email: string, password: string, name: string }
Response: { user: User, session: Session }
```

### Courses API

#### Get All Courses
```typescript
GET /api/courses?page=1&limit=20&category=communication
Response: { data: Course[], pagination: PaginationMeta }
```

#### Get Course Details
```typescript
GET /api/courses/[id]
Response: { data: Course }
```

#### Enroll in Course
```typescript
POST /api/courses/[id]/enroll
Response: { data: Enrollment }
```

### Forum API

#### Get Forum Posts
```typescript
GET /api/forum?page=1&limit=20&category=general
Response: { data: ForumPost[], pagination: PaginationMeta }
```

#### Create Post
```typescript
POST /api/forum
Body: { title: string, content: string, category?: string }
Response: { data: ForumPost }
```

### Simulator API

#### Start Simulation Session
```typescript
POST /api/simulator
Body: { scenarioId: string, difficulty: string }
Response: { sessionId: string, scenario: Scenario }
```

#### Send Message
```typescript
POST /api/simulator/chat
Body: { sessionId: string, message: string }
Response: { response: string, feedback: Feedback }
```

## 🎨 Component Library

### Core Components

- **Button**: Primary, secondary, destructive, outline variants
- **Card**: Container with header, body, footer sections
- **Dialog**: Modal dialogs with accessibility support
- **Form**: Form components with validation
- **Input**: Text inputs with labels and error states
- **Select**: Dropdown selects with search
- **Toast**: Notification system
- **Avatar**: User avatars with fallbacks

### Feature Components

- **CourseCard**: Display course information
- **LessonList**: Interactive lesson navigation
- **ForumPostCard**: Forum post preview
- **CommentSection**: Threaded comments
- **ProgressBar**: Visual progress indicator
- **BadgeDisplay**: Achievement badges
- **SimulatorChat**: Chat interface for simulator

### Layout Components

- **Header**: Main navigation header
- **Sidebar**: Collapsible sidebar navigation
- **Footer**: Site footer
- **PageContainer**: Consistent page wrapper
- **LoadingState**: Loading indicators
- **ErrorBoundary**: Error handling wrapper

## 🔄 Development Workflow

### Branch Strategy

- **main**: Production-ready code, protected branch
- **develop**: Integration branch for features, staging environment
- **feature/\***: New features (e.g., `feature/user-profiles`)
- **fix/\***: Bug fixes (e.g., `fix/login-redirect`)
- **hotfix/\***: Urgent production fixes
- **refactor/\***: Code improvements without feature changes
- **docs/\***: Documentation updates

### Branch Naming Convention

```bash
feature/short-description    # New features
fix/issue-number-description # Bug fixes
hotfix/critical-issue        # Production hotfixes
refactor/component-name      # Refactoring
docs/section-name            # Documentation
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: Add user profile page
fix: Resolve authentication redirect loop
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify course fetching logic
test: Add unit tests for auth hook
chore: Update dependencies
perf: Optimize image loading
ci: Update GitHub Actions workflow
```

**Commit Message Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```bash
feat(auth): Add password reset functionality

Implement password reset flow with email verification
and token-based reset. Includes rate limiting and
security measures.

Closes #123

fix(simulator): Fix message history not persisting

The chat history was being cleared on component
re-render due to missing dependency in useEffect.

Fixes #456

perf(courses): Lazy load course thumbnails

Use Next.js Image component with lazy loading to
improve initial page load time by 40%.
```

### Pull Request Process

1. **Create feature branch** from `develop`
2. **Implement changes** with tests
3. **Run quality checks**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```
4. **Update documentation** if needed
5. **Create PR** with descriptive title and description
6. **Request review** from team members
7. **Address feedback** and update PR
8. **Merge** after approval and passing CI

### Code Review Checklist

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Accessibility considerations addressed
- [ ] Performance implications considered
- [ ] Security implications reviewed

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
