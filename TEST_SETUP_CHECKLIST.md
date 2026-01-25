# ✅ Test Setup Checklist

## Getting Your Tests Running - Step by Step

Follow these steps to get your comprehensive test suite up and running:

---

## Step 1: Node Version ⚡

**Current Issue:** Node v22.21.0 is installed, but project requires 18.x-20.x

### Fix:

```bash
# Check current Node version
node --version

# Install Node 20 (recommended)
nvm install 20

# Use Node 20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Set as default (optional)
nvm alias default 20
```

**If you don't have nvm:**
- Download from: https://github.com/nvm-sh/nvm
- Or install Node 20 directly from: https://nodejs.org/

---

## Step 2: Install Missing Dependencies 📦

```bash
# Install jest-axe for accessibility tests
npm install --save-dev jest-axe

# Or with pnpm (after fixing Node version)
pnpm add -D jest-axe

# Verify installation
npm list jest-axe
```

---

## Step 3: Run Tests 🧪

```bash
# Run all tests (quick check)
npm test

# Expected output: All tests should pass
# Example: 177 tests passing
```

---

## Step 4: Generate Coverage Report 📊

```bash
# Run tests with coverage
npm run test:coverage

# Wait for completion...
# Coverage report will be generated in coverage/ directory
```

---

## Step 5: View Coverage Report 📈

```bash
# Open the HTML coverage report
# On Mac:
open coverage/index.html

# On Linux:
xdg-open coverage/index.html

# On Windows:
start coverage/index.html

# Or manually navigate to: coverage/index.html in your browser
```

---

## Step 6: Verify Coverage Thresholds ✅

The coverage report should show:

```
✅ Lines:       ≥ 80%
✅ Functions:   ≥ 80%
✅ Branches:    ≥ 80%
✅ Statements:  ≥ 80%
```

If any metric is below 80%, the tests will fail and show which files need more coverage.

---

## Quick Verification Commands

```bash
# 1. Check Node version
node --version
# Expected: v20.x.x or v18.x.x

# 2. Check if jest-axe is installed
npm list jest-axe
# Expected: jest-axe@X.X.X

# 3. Run type check
npm run type-check
# Expected: No errors

# 4. Run linter
npm run lint
# Expected: No errors or warnings

# 5. Run all tests
npm test
# Expected: 177+ tests passing

# 6. Run coverage
npm run test:coverage
# Expected: All thresholds met (80%+)
```

---

## Troubleshooting 🔧

### Problem: "Unsupported environment (bad pnpm and/or Node.js version)"

**Solution:**
```bash
nvm use 20
# Then try your command again
```

### Problem: "jest-axe not found"

**Solution:**
```bash
npm install --save-dev jest-axe
```

### Problem: Tests failing

**Solution:**
```bash
# 1. Clear cache
npm cache clean --force

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Run tests again
npm test
```

### Problem: TypeScript errors

**Solution:**
```bash
# Check for type errors
npm run type-check

# If errors appear, they need to be fixed before tests can run
```

### Problem: "Cannot find module '@/...'"

**Solution:**
This shouldn't happen, but if it does:
```bash
# Check that tsconfig.json has the path alias
cat tsconfig.json | grep "@"

# Should show: "@": ["./src"]
```

---

## Test Categories Quick Reference

Run specific test categories:

```bash
# Unit tests only
npm test -- src/__tests__/services

# API tests only
npm test -- src/__tests__/api

# Component tests only
npm test -- src/__tests__/components

# Integration tests only
npm test -- src/__tests__/integration

# Accessibility tests only
npm test -- src/__tests__/a11y

# Performance tests only
npm test -- src/__tests__/performance

# E2E tests only
npm run test:e2e
```

---

## Success Indicators ✨

You'll know everything is working when:

1. ✅ Node version is 18.x or 20.x
2. ✅ All dependencies installed (including jest-axe)
3. ✅ `npm test` runs without errors
4. ✅ All 177+ tests pass
5. ✅ Coverage report shows 80%+ for all metrics
6. ✅ No TypeScript errors
7. ✅ No linting errors

---

## Next Steps After Setup

Once tests are running:

1. 📖 Read **TESTING_GUIDE.md** for common commands
2. 📊 Review **TEST_COVERAGE_REPORT.md** for detailed analysis
3. 🎯 Review **TEST_SUITE_SUMMARY.md** for overview
4. 💻 Start writing new features with confidence!

---

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the troubleshooting section above
3. Check that all dependencies are installed
4. Verify Node version is correct
5. Check the documentation files created

---

## Quick Start (TL;DR)

```bash
# The absolute minimum to get started:
nvm use 20
npm install --save-dev jest-axe
npm test
npm run test:coverage
open coverage/index.html
```

---

**That's it! You now have a comprehensive test suite running.** 🎉

For more details, see:
- **TESTING_GUIDE.md** - Common commands and usage
- **TEST_COVERAGE_REPORT.md** - Detailed test breakdown
- **TEST_SUITE_SUMMARY.md** - Executive summary
