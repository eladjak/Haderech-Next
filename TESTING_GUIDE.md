# Quick Testing Guide - Haderech-Next

## 🚀 Quick Start

### Install Dependencies (One-time Setup)

```bash
# Install jest-axe for accessibility tests
npm install --save-dev jest-axe

# Or if using pnpm (requires Node 18.x-20.x)
pnpm add -D jest-axe
```

### Run Tests

```bash
# Run all tests (quick)
npm test

# Run all tests with coverage
npm run test:coverage

# Run specific test categories
npm test -- src/__tests__/services      # Unit tests
npm test -- src/__tests__/api          # API tests
npm test -- src/__tests__/components   # Component tests
npm test -- src/__tests__/integration  # Integration tests
npm test -- src/__tests__/a11y         # Accessibility tests
npm test -- src/__tests__/performance  # Performance tests

# Run E2E tests
npm run test:e2e
```

## 📁 Test File Structure

```
src/
├── __tests__/
│   ├── services/
│   │   └── simulator.test.ts          (35+ tests)
│   ├── api/
│   │   └── profile.test.ts            (12+ tests)
│   ├── components/
│   │   └── CourseCard.test.tsx        (16+ tests)
│   ├── integration/
│   │   └── enrollment-flow.test.ts    (15+ tests)
│   ├── a11y/
│   │   └── navigation.a11y.test.tsx   (20+ tests)
│   └── performance/
│       └── rendering.perf.test.tsx    (18+ tests)
└── tests/
    └── e2e/
        └── critical-flows.spec.ts      (25+ tests)
```

## 🎯 Coverage Goals

All metrics target **80%+** coverage:
- ✅ Lines: 80%
- ✅ Functions: 80%
- ✅ Branches: 80%
- ✅ Statements: 80%

## 📊 View Coverage Report

After running `npm run test:coverage`, open:
```
coverage/index.html
```

## 💡 Common Commands

```bash
# Watch mode (auto-run on file changes)
npm run test:watch

# Run specific test file
npm test -- simulator.test.ts

# Run tests matching pattern
npm test -- enrollment

# Debug tests
npm test -- --inspect-brk

# Update snapshots
npm test -- -u
```

## 🐞 Troubleshooting

### Node Version Issues
```bash
# Check your Node version
node --version

# Should be 18.x or 20.x (not 22.x)
# Use nvm to switch if needed
nvm use 20
```

### Missing Dependencies
```bash
# Install all dependencies
npm install

# Clear cache if needed
npm cache clean --force
npm install
```

### Tests Failing
1. Check that all dependencies are installed
2. Ensure Node version is 18.x or 20.x
3. Run `npm install` again
4. Check for TypeScript errors: `npm run type-check`

## 📚 Test Categories

1. **Unit Tests** - Test individual functions in isolation
2. **API Tests** - Test API endpoints and routes
3. **Component Tests** - Test React components
4. **Integration Tests** - Test multiple components together
5. **E2E Tests** - Test complete user flows
6. **A11y Tests** - Test accessibility compliance
7. **Performance Tests** - Test rendering performance

## ✅ Pre-Commit Checklist

Before committing code:
```bash
npm run type-check    # Check TypeScript
npm run lint          # Check code style
npm test             # Run all tests
npm run test:coverage # Check coverage
```

## 🎉 Success Metrics

You've achieved success when:
- ✅ All tests pass
- ✅ Coverage is 80%+
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ E2E tests pass

For detailed information, see [TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md)
