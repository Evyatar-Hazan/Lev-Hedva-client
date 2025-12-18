# Quick Start: Testing Guide

## Setup

```bash
# Install dependencies (if not already installed)
npm install

# Ensure git hooks are installed
npm run prepare
```

## Running Tests Locally

```bash
# Development mode - watch for changes
npm test

# Run all tests once
npm run test:ci

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Quick Examples

### 1. Test a Utility Function

```typescript
// src/lib/utils/calculateTotal.ts
export const calculateTotal = (items: number[]): number => {
  return items.reduce((sum, item) => sum + item, 0);
};

// src/lib/utils/calculateTotal.test.ts
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('should sum numbers correctly', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(calculateTotal([-1, 2, -3])).toBe(-2);
  });
});
```

### 2. Test a React Component

```typescript
// src/components/__tests__/Alert.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import Alert from '../Alert';

describe('Alert Component', () => {
  it('renders success alert', () => {
    render(<Alert severity="success">Operation successful</Alert>);

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-success');
  });

  it('renders error alert', () => {
    render(<Alert severity="error">An error occurred</Alert>);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
});
```

### 3. Test with User Interactions

```typescript
// src/components/__tests__/Counter.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Counter from '../Counter';

describe('Counter Component', () => {
  it('increments counter on button click', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const button = screen.getByRole('button', { name: /increment/i });
    const counter = screen.getByText('0');

    await user.click(button);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

### 4. Test a Custom Hook

```typescript
// src/hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 5. Test with API Mocking

```typescript
// src/components/__tests__/UserProfile.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';
import UserProfile from '../UserProfile';

describe('UserProfile', () => {
  it('displays user data after loading', async () => {
    server.use(
      http.get('/api/users/123', () => {
        return HttpResponse.json({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        });
      })
    );

    render(<UserProfile userId="123" />);

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    server.use(
      http.get('/api/users/123', () => {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      })
    );

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### 6. Test Accessibility

```typescript
// src/components/__tests__/Modal.test.tsx
import { render } from '@/tests/utils/test-utils';
import { runAccessibilityTests } from '@/tests/utils/accessibility-helpers';
import Modal from '../Modal';

describe('Modal Accessibility', () => {
  it('should be keyboard accessible', () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}}>
        <h2>Modal Title</h2>
        <p>Modal content</p>
      </Modal>
    );

    // Check for proper ARIA attributes
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should pass automated accessibility tests', async () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}}>
        <h2>Modal Title</h2>
        <p>Modal content</p>
      </Modal>
    );

    await runAccessibilityTests(container);
  });
});
```

### 7. E2E Test Example

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Fill login form
  await page.fill('[type="email"]', 'admin@test.com');
  await page.fill('[type="password"]', 'password123');

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Testing Checklist

When writing a new component or feature:

- [ ] Unit tests for business logic
- [ ] Component rendering tests
- [ ] User interaction tests
- [ ] Error state tests
- [ ] Loading state tests
- [ ] Accessibility tests
- [ ] API integration tests (if applicable)
- [ ] E2E tests for critical flows (if applicable)

## Common Patterns

### Waiting for Async Operations

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});
```

### Querying Elements

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i });

// By label
screen.getByLabelText(/email/i);

// By text
screen.getByText(/hello world/i);

// By test ID (last resort)
screen.getByTestId('custom-element');

// Query variants:
// getBy - throws error if not found
// queryBy - returns null if not found
// findBy - async, waits for element
```

### Creating Mock Data

```typescript
import { createMockUser, createMockArray } from '@/tests/factories';

// Single item
const user = createMockUser();

// Multiple items
const users = createMockArray(createMockUser, 10);

// With overrides
const admin = createMockUser({ role: 'ADMIN', email: 'admin@test.com' });
```

## Debugging Tips

### View Rendered HTML

```typescript
import { debug } from '@testing-library/react';

const { container } = render(<Component />);
debug(container); // Prints HTML to console
```

### Pause Test Execution

```typescript
import { debug } from '@testing-library/react';

it('my test', async () => {
  render(<Component />);

  // Add debugger to pause
  debugger;

  // Or use screen.debug()
  screen.debug();
});
```

### Run Single Test

```bash
# Run specific test file
npm test -- UserProfile.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should display user"
```

## Need Help?

1. Check full documentation: `docs/TESTING.md`
2. Look at existing tests for examples
3. Ask team members
4. Check test output carefully - error messages are usually helpful

---

**Remember:** Good tests make refactoring safe and deployment confident! 🚀
