# Testing Infrastructure Guide

## Overview

This document provides comprehensive guidance on the testing infrastructure for the Lev-Hedva client application. Our testing strategy follows industry best practices and ensures high-quality, maintainable code.

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Structure](#test-structure)
5. [Quality Enforcement](#quality-enforcement)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Testing Stack

### Core Testing Libraries

- **Jest** - Unit and integration testing framework
- **React Testing Library** - Component testing with focus on user behavior
- **Playwright** - End-to-end testing in real browsers
- **MSW (Mock Service Worker)** - API mocking
- **jest-axe** - Accessibility testing
- **@faker-js/faker** - Test data generation

### Additional Tools

- **ESLint** - Code quality and standards
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks
- **lint-staged** - Pre-commit file validation

---

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode (development)
npm test

# Run all tests once (CI mode)
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Run only accessibility tests
npm run test:a11y
```

### End-to-End Tests

```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format

# Type checking
npm run type-check

# Run all validations
npm run validate
```

---

## Writing Tests

### Unit Tests

Unit tests focus on testing individual functions, hooks, and utilities in isolation.

**Example: Testing a utility function**

```typescript
// src/lib/utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15/01/2024');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid Date');
  });
});
```

**Example: Testing a custom hook**

```typescript
// src/hooks/__tests__/useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/tests/utils/test-utils';
import { useUser } from '../useUser';

describe('useUser', () => {
  it('should fetch user data successfully', async () => {
    const { result } = renderHook(() => useUser('user-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Component Tests

Component tests verify UI rendering, user interactions, and accessibility.

**Example: Basic component test**

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import { runAccessibilityTests } from '@/tests/utils/accessibility-helpers';
import Button from '../Button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<Button>Click me</Button>);
    await runAccessibilityTests(container);
  });
});
```

### Integration Tests

Integration tests verify multiple components working together with API calls.

```typescript
// src/features/loans/__tests__/LoanForm.integration.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';
import LoanForm from '../LoanForm';
import userEvent from '@testing-library/user-event';

describe('LoanForm Integration', () => {
  it('should create a loan successfully', async () => {
    const user = userEvent.setup();

    render(<LoanForm />);

    // Fill form
    await user.type(screen.getByLabelText(/product/i), 'Test Product');
    await user.type(screen.getByLabelText(/borrower/i), 'John Doe');

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

E2E tests verify complete user journeys in a real browser.

```typescript
// tests/e2e/loan-creation.spec.ts
import { test, expect } from '@playwright/test';

test('complete loan creation flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Login
  await page.fill('[type="email"]', 'admin@test.com');
  await page.fill('[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to loans
  await page.click('text=Loans');

  // Create new loan
  await page.click('text=New Loan');
  await page.fill('[name="productId"]', 'product-123');
  await page.fill('[name="borrowerId"]', 'user-456');
  await page.click('button:has-text("Create")');

  // Verify success
  await expect(page.locator('text=Loan created successfully')).toBeVisible();
});
```

---

## Test Structure

### Directory Organization

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useLoans.ts
│   └── __tests__/
│       └── useLoans.test.ts
├── lib/
│   └── utils/
│       ├── formatDate.ts
│       └── formatDate.test.ts
└── tests/
    ├── factories/        # Test data factories
    │   └── index.ts
    ├── mocks/           # MSW handlers
    │   ├── handlers.ts
    │   └── server.ts
    └── utils/           # Test utilities
        ├── test-utils.tsx
        ├── accessibility-helpers.ts
        └── test-helpers.ts

tests/
└── e2e/                 # E2E tests
    └── *.spec.ts
```

### Naming Conventions

- Unit/Component tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test files should be colocated with source files or in `__tests__` folders

---

## Quality Enforcement

### Git Hooks

#### Pre-commit Hook

Runs on every commit attempt:

✓ Lint and format staged files
✓ Type checking

```bash
# To bypass (emergency only):
git commit --no-verify
```

#### Pre-push Hook

Runs before pushing to remote:

✓ Full linting
✓ Type checking
✓ All unit & integration tests
✓ Accessibility tests

```bash
# To bypass (emergency only):
git push --no-verify
```

**⚠️ Warning:** Bypassing hooks should only be done in emergencies and requires fixing issues before the next commit/push.

### Coverage Requirements

Minimum coverage thresholds (enforced):

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

View coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Best Practices

### General Testing Principles

1. **Write tests first** - Consider TDD for complex features
2. **Test behavior, not implementation** - Focus on what users see/do
3. **Keep tests simple** - One assertion per test when possible
4. **Make tests independent** - No reliance on test execution order
5. **Use descriptive names** - Test names should explain what they verify

### Component Testing

```typescript
// ✅ Good - Testing user-visible behavior
it('should show error message when form is invalid', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

// ❌ Bad - Testing implementation details
it('should call validateEmail function', () => {
  const spy = jest.spyOn(utils, 'validateEmail');
  render(<LoginForm />);
  expect(spy).toHaveBeenCalled();
});
```

### Accessibility Testing

Always include accessibility checks:

```typescript
import { runAccessibilityTests } from '@/tests/utils/accessibility-helpers';

it('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  await runAccessibilityTests(container);
});
```

### API Mocking

Use MSW for consistent API mocking:

```typescript
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

it('should handle API error', async () => {
  server.use(
    http.get('/api/loans', () => {
      return HttpResponse.json({ message: 'Server error' }, { status: 500 });
    })
  );

  render(<LoansList />);
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Test Data Generation

Use factories for consistent test data:

```typescript
import { createMockLoan, createMockArray } from '@/tests/factories';

const loans = createMockArray(createMockLoan, 5);
const overdueLoan = createMockLoan({ status: 'OVERDUE' });
```

---

## Troubleshooting

### Common Issues

**Tests failing with "Cannot find module"**

Ensure path aliases are configured in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

**MSW not intercepting requests**

Make sure `server.ts` is imported in `setupTests.ts`:

```typescript
import '@/tests/mocks/server';
```

**Accessibility tests failing**

Check if component has proper ARIA labels:

```typescript
<button aria-label="Close dialog">×</button>
```

**E2E tests timing out**

Increase timeout or add proper waits:

```typescript
await page.waitForSelector('[data-testid="loaded"]', { timeout: 10000 });
```

**Git hooks not running**

Reinstall Husky:

```bash
npm run prepare
```

### Debug Mode

**For unit/integration tests:**

```typescript
import { debug } from '@testing-library/react';

it('debug test', () => {
  const { debug: debugRender } = render(<Component />);
  debugRender(); // Prints DOM
});
```

**For E2E tests:**

```bash
npm run test:e2e:debug
```

---

## Additional Resources

- [Testing Library Documentation](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)

---

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review existing tests for examples
3. Check error messages carefully
4. Ask team members
5. Create an issue in the repository

---

**Last Updated:** December 2024
