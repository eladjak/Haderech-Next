# Contributing to HaDerech

Thank you for your interest in contributing to HaDerech! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Guidelines](#commit-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and considerate of others.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates.

**When creating a bug report, include:**

1. **Clear title and description**
2. **Steps to reproduce** the issue
3. **Expected behavior** vs. **actual behavior**
4. **Screenshots** if applicable
5. **Environment details** (OS, browser, Node version)
6. **Additional context** that might be helpful

**Example bug report:**

```markdown
## Bug: Login redirect loops on Firefox

**Description:**
After entering credentials, the login page redirects in an infinite loop.

**Steps to Reproduce:**
1. Navigate to /login
2. Enter valid credentials
3. Click "Sign In"
4. Observe redirect loop

**Expected Behavior:**
Should redirect to /dashboard

**Actual Behavior:**
Redirects between /login and /auth/callback repeatedly

**Environment:**
- OS: macOS 14.0
- Browser: Firefox 120.0
- Node: 18.17.0

**Screenshots:**
[Attach screenshot]
```

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

1. **Clear feature description**
2. **Use case** - Why is this feature needed?
3. **Proposed solution** - How should it work?
4. **Alternatives considered**
5. **Additional context** - Mockups, examples from other apps

**Example feature request:**

```markdown
## Feature Request: Dark mode support

**Description:**
Add a dark mode theme option to reduce eye strain for users.

**Use Case:**
Users working in low-light environments would benefit from a dark color scheme.

**Proposed Solution:**
- Add theme toggle in user settings
- Store preference in localStorage and database
- Use CSS variables for theme switching
- Follow system preference by default

**Alternatives Considered:**
- Auto dark mode based on time of day
- Only system-based dark mode

**Additional Context:**
Many modern applications offer this feature (e.g., GitHub, Twitter)
```

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass**
6. **Update documentation**
7. **Submit a pull request**

## 🛠 Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Supabase account (for backend services)
- Git

### Initial Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/haderech-next.git
   cd haderech-next
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials.

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Run tests:**
   ```bash
   pnpm test
   ```

## 💻 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** - No `any` types without justification
- **Export types** separately from implementations
- **Use type inference** where possible

```typescript
// Good
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad - implicit any
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React Components

- **Use functional components** with hooks
- **Avoid inline functions** in JSX props when possible
- **Use proper prop types**
- **Add JSDoc comments** for public components

```typescript
/**
 * Button component with multiple variants
 *
 * @param variant - Button style variant
 * @param children - Button content
 * @param onClick - Click handler
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Code Style

- **Use Prettier** for formatting (automatic on save)
- **Follow ESLint rules** - Fix all linting errors
- **Use meaningful variable names**
- **Keep functions small** - Aim for < 50 lines
- **Avoid deep nesting** - Max 3-4 levels

```typescript
// Good - descriptive names
const userAuthToken = await generateAuthToken(user);
const isAuthenticated = !!userAuthToken;

// Bad - unclear abbreviations
const uat = await genTok(u);
const auth = !!uat;
```

### File Organization

```
src/
├── app/                    # Next.js pages and API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── config/            # Configuration
├── types/                  # TypeScript type definitions
└── tests/                  # Test files
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork:**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run quality checks:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   pnpm build
   ```

3. **Update documentation** if needed

### PR Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one approval** required
3. **Address feedback** promptly
4. **Squash commits** before merging (if needed)

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
feat(auth): Add two-factor authentication

Implement 2FA using TOTP (Time-based One-Time Password).
Users can enable 2FA in settings and must verify with
a code from their authenticator app.

Closes #456

fix(forum): Prevent XSS in post content

Sanitize user input before rendering to prevent
cross-site scripting attacks. Uses DOMPurify for
HTML sanitization.

BREAKING CHANGE: Forum post content now limited to
specific HTML tags

docs(readme): Update installation instructions

Add troubleshooting section for common setup issues
```

## 🧪 Testing Requirements

### Unit Tests

- **Write tests** for all new functions
- **Aim for >80% coverage** for new code
- **Use descriptive test names**

```typescript
describe('calculateTotal', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should sum prices correctly', () => {
    const items = [
      { price: 10 },
      { price: 20 },
      { price: 30 },
    ];
    expect(calculateTotal(items)).toBe(60);
  });
});
```

### Integration Tests

- **Test API endpoints** with realistic data
- **Mock external services** (Supabase, OpenAI)
- **Test error scenarios**

### E2E Tests

- **Test critical user flows** (auth, course enrollment)
- **Use Playwright** for E2E tests
- **Keep tests maintainable**

## 📚 Documentation

### Code Comments

- **Add JSDoc** for all public functions
- **Explain "why"**, not "what"
- **Update comments** when changing code

```typescript
/**
 * Calculates the total price of items in the cart
 *
 * @param items - Array of cart items
 * @returns Total price in cents to avoid floating point issues
 *
 * @example
 * const total = calculateTotal([
 *   { price: 1099 },  // $10.99
 *   { price: 2499 }   // $24.99
 * ]);
 * // Returns: 3598 ($35.98)
 */
function calculateTotal(items: CartItem[]): number {
  // Sum in cents to avoid floating point precision issues
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### README Updates

- **Update README** if adding new features
- **Add examples** for new APIs
- **Keep installation steps current**

### API Documentation

- **Document new endpoints** in README
- **Include request/response examples**
- **Note authentication requirements**

## ❓ Questions?

If you have questions or need help:

1. Check existing [GitHub Issues](https://github.com/yourusername/haderech-next/issues)
2. Join our [Community Forum](https://forum.haderech.co.il)
3. Contact us at [contact@haderech.co.il](mailto:contact@haderech.co.il)

## 🙏 Thank You!

Your contributions make HaDerech better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
