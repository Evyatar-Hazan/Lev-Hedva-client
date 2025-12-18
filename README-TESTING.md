# Testing & Quality Infrastructure

> A comprehensive, production-grade testing and quality enforcement system

## 🎯 What's Included

### Testing Framework

- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing with user behavior focus
- **Playwright** - End-to-end testing in real browsers
- **MSW (Mock Service Worker)** - API mocking
- **jest-axe** - Automated accessibility testing

### Quality Tools

- **ESLint** - Code quality and standards
- **Prettier** - Consistent code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks for automation
- **lint-staged** - Optimized pre-commit checks

---

## 🚀 Quick Start

### Installation

```bash
# Run the setup script
./setup-testing.sh

# Or manually:
npm install
npm run prepare
```

### Running Tests

```bash
# Development mode (watch)
npm test

# CI mode (run once)
npm run test:ci

# With coverage report
npm run test:coverage

# Accessibility tests only
npm run test:a11y

# End-to-end tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Full validation (all checks)
npm run validate
```

---

## 📁 Project Structure

```
src/
├── components/
│   └── __tests__/              # Component tests
├── hooks/
│   └── __tests__/              # Hook tests
├── tests/
│   ├── factories/              # Test data factories
│   ├── mocks/                  # MSW API handlers
│   └── utils/                  # Test utilities
│       ├── test-utils.tsx      # Custom render functions
│       ├── accessibility-helpers.ts
│       └── test-helpers.ts
tests/
└── e2e/                        # E2E tests with Playwright
```

---

## ✅ Quality Enforcement

### Automated Checks

**Pre-commit (Fast):**

- ✓ Lint staged files
- ✓ Format staged files
- ✓ Type checking

**Pre-push (Comprehensive):**

- ✓ Full linting
- ✓ Full type checking
- ✓ All unit & integration tests
- ✓ Accessibility test suite

### Coverage Requirements

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## 📝 Writing Tests

### Example: Unit Test

```typescript
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('should sum numbers correctly', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
});
```

### Example: Component Test

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import Button from '../Button';

describe('Button', () => {
  it('renders and handles clicks', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### Example: Accessibility Test

```typescript
import { runAccessibilityTests } from '@/tests/utils/accessibility-helpers';

it('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  await runAccessibilityTests(container);
});
```

---

## 📚 Documentation

| Document                                                                | Purpose                       |
| ----------------------------------------------------------------------- | ----------------------------- |
| [TESTING.md](docs/TESTING.md)                                           | Complete testing guide        |
| [TESTING-QUICK-START.md](docs/TESTING-QUICK-START.md)                   | Quick reference with examples |
| [TESTING-INFRASTRUCTURE.md](docs/TESTING-INFRASTRUCTURE.md)             | Architecture overview         |
| [CODE-QUALITY-RECOMMENDATIONS.md](docs/CODE-QUALITY-RECOMMENDATIONS.md) | Improvement suggestions       |

---

## 🛠️ Common Commands

```bash
# Development
npm test                    # Watch mode
npm run lint:fix           # Fix lint issues
npm run format             # Format code

# Validation
npm run type-check         # TypeScript check
npm run validate           # All checks

# E2E Testing
npm run test:e2e           # Headless
npm run test:e2e:ui        # With UI
npm run test:e2e:debug     # Debug mode
```

---

## 🎯 Key Features

✅ **Comprehensive Testing** - Unit, Component, Integration, E2E
✅ **Accessibility First** - Automated a11y checks
✅ **Quality Enforcement** - Git hooks prevent bad code
✅ **Developer Experience** - Easy to write and run tests
✅ **Realistic Mocking** - MSW for API, Faker for data
✅ **Documentation** - Complete guides and examples

---

## 🔧 Troubleshooting

### Git hooks not running?

```bash
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### Tests failing?

```bash
npm run test:ci       # Run all tests
npm run type-check    # Check types
npm run lint          # Check linting
```

### Need to bypass hooks? (Emergency only)

```bash
git commit --no-verify
git push --no-verify
```

---

## 📊 Testing Checklist

When building a new feature:

- [ ] Write unit tests for business logic
- [ ] Write component tests for UI
- [ ] Test user interactions
- [ ] Test error states
- [ ] Test loading states
- [ ] Run accessibility tests
- [ ] Write integration tests (if needed)
- [ ] Add E2E tests for critical flows (if needed)

---

## 🤝 Contributing

1. Read the testing documentation
2. Write tests for your changes
3. Ensure all tests pass: `npm run validate`
4. Commit your changes (hooks will run automatically)
5. Push your changes (more hooks will run)

---

## 📖 Additional Resources

- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Accessibility Guide](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Remember:** Good tests enable confident refactoring and reliable deployments! 🚀
