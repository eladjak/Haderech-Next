# Contributing to HaDerech | תרומה לפרויקט "הדרך"

Thank you for your interest in contributing to HaDerech! This document provides guidelines for contributing to the project.

תודה על רצונך לתרום לפרויקט "הדרך"! מסמך זה מספק הנחיות לתרומה לפרויקט.

## Code of Conduct | כללי התנהגות

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to adhere to these guidelines to maintain a positive and inclusive community.

## Getting Started | התחלה

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/haderech-next.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

## Development Guidelines | הנחיות פיתוח

### Code Style | סגנון קוד

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use modern ES6+ features appropriately

### Testing | בדיקות

- Write tests for new features
- Update existing tests when modifying features
- Ensure all tests pass before submitting PR
- Add both unit and integration tests where appropriate
- Test edge cases and error scenarios

### Documentation | תיעוד

- Update documentation for new features
- Add JSDoc comments for functions and interfaces
- Include code examples where helpful
- Update README.md if adding new features
- Document breaking changes

### Pull Requests | בקשות משיכה

- Keep PRs focused on a single feature or fix
- Include a clear description of changes
- Reference any related issues
- Add screenshots for UI changes
- Update tests and documentation
- Ensure CI checks pass

### Commit Messages | הודעות קומיט

Format:
```
type(scope): description

[optional body]
[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

### Issue Reporting | דיווח על בעיות

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details
- Error messages or logs

## Project Structure | מבנה הפרויקט

```
haderech-next/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions and services
│   ├── store/        # Redux store and slices
│   ├── providers/    # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── services/     # External service integrations
│   ├── utils/        # Helper functions
│   ├── constants/    # Shared constants
│   ├── types/        # TypeScript type definitions
│   ├── styles/       # Global styles
│   └── locales/      # i18n translations
├── public/           # Static assets
├── tests/           # Test files
└── docs/            # Documentation
```

## Getting Help | קבלת עזרה

- Join our [Discord community](https://discord.gg/haderech)
- Check the [documentation](docs/)
- Ask questions in GitHub Issues
- Contact the maintainers

## License | רישיון

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to HaDerech! | !תודה על תרומתך לפרויקט