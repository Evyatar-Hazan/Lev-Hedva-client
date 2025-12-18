# Code Quality & Architecture Recommendations

## Overview

During the implementation of the testing infrastructure, several areas for improvement were identified. This document outlines recommendations for enhancing code quality, accessibility, and maintainability.

---

## 🎯 Critical Issues

### 1. Missing Type Definitions

**Issue:** Some utility folders are empty or lack implementations.

**Location:** `src/lib/utils/`

**Impact:** Cannot write meaningful unit tests without actual utility functions.

**Recommendation:**

- Add common utility functions (date formatting, validation, string manipulation)
- Ensure all utilities have TypeScript types
- Add unit tests for each utility

**Example:**

```typescript
// src/lib/utils/dateHelpers.ts
export const formatDate = (date: Date, locale: string = 'he-IL'): string => {
  return new Intl.DateTimeFormat(locale).format(date);
};

export const isDateInPast = (date: Date): boolean => {
  return date < new Date();
};

// src/lib/utils/dateHelpers.test.ts
import { formatDate, isDateInPast } from './dateHelpers';

describe('dateHelpers', () => {
  describe('formatDate', () => {
    it('should format date in Hebrew locale', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isDateInPast(pastDate)).toBe(true);
    });
  });
});
```

---

## ♿ Accessibility Issues

### 1. StatsCard Component

**Issue:** Card is clickable but not keyboard accessible when `onClick` is provided.

**Current Implementation:**

```tsx
<Card onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
```

**Problem:**

- Not keyboard accessible
- No focus indication
- Screen readers won't announce it's interactive

**Recommended Fix:**

```tsx
// If onClick is provided, make it a button
{
  onClick ? (
    <Card
      component="button"
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        border: 'none',
        textAlign: 'inherit',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
      aria-label={`${label}: ${value}`}
    >
      {/* content */}
    </Card>
  ) : (
    <Card sx={{ cursor: 'default' }}>{/* content */}</Card>
  );
}
```

**Test:**

```typescript
it('should be keyboard accessible when clickable', async () => {
  const handleClick = jest.fn();
  const user = userEvent.setup();

  render(<StatsCard {...defaultProps} onClick={handleClick} />);

  const card = screen.getByRole('button');

  // Focus and press Enter
  card.focus();
  await user.keyboard('{Enter}');

  expect(handleClick).toHaveBeenCalledTimes(1);

  // Check focus visible state
  expect(card).toHaveFocus();
});
```

### 2. Missing ARIA Labels

**General Issue:** Many components may lack proper ARIA labels and roles.

**Checklist for All Components:**

- [ ] Interactive elements have accessible names
- [ ] Form fields have associated labels
- [ ] Icons have `aria-label` or `aria-hidden`
- [ ] Dynamic content has ARIA live regions
- [ ] Loading states are announced
- [ ] Error messages are associated with fields

**Example:**

```tsx
// Bad
<IconButton onClick={handleClose}>
  <CloseIcon />
</IconButton>

// Good
<IconButton
  onClick={handleClose}
  aria-label="Close dialog"
>
  <CloseIcon aria-hidden="true" />
</IconButton>
```

---

## 🏗️ Architecture Improvements

### 1. Separation of Concerns

**Issue:** Some components may mix UI, business logic, and API calls.

**Recommendation:**

```
src/
├── components/          # Pure UI components
│   └── StatsCard/
│       ├── StatsCard.tsx
│       ├── StatsCard.test.tsx
│       └── index.ts
├── features/            # Feature-specific logic
│   └── dashboard/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── hooks/              # Shared hooks
├── services/           # API clients
└── lib/                # Utilities
```

### 2. Component Structure

**Current Issues:**

- Large component files with multiple responsibilities
- Inline styles mixed with logic
- Difficult to test in isolation

**Recommended Pattern:**

```tsx
// components/UserCard/UserCard.tsx
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <Card>
      <UserCardContent user={user} />
      {(onEdit || onDelete) && (
        <UserCardActions userId={user.id} onEdit={onEdit} onDelete={onDelete} />
      )}
    </Card>
  );
};

// Easy to test each part independently
// components/UserCard/UserCard.test.tsx
describe('UserCard', () => {
  it('renders user information', () => {
    const user = createMockUser();
    render(<UserCard user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it('shows actions when handlers provided', () => {
    const user = createMockUser();
    const onEdit = jest.fn();
    render(<UserCard user={user} onEdit={onEdit} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
```

### 3. Custom Hooks

**Issue:** Business logic may be duplicated across components.

**Recommendation:** Extract to custom hooks

```typescript
// hooks/useFormValidation.ts
export const useFormValidation = (schema: ZodSchema) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown) => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  return { errors, validate, hasErrors: Object.keys(errors).length > 0 };
};

// hooks/__tests__/useFormValidation.test.ts
describe('useFormValidation', () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  it('validates valid data', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    const isValid = result.current.validate({
      email: 'test@example.com',
      age: 25,
    });

    expect(isValid).toBe(true);
    expect(result.current.hasErrors).toBe(false);
  });

  it('catches validation errors', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    const isValid = result.current.validate({
      email: 'invalid',
      age: 15,
    });

    expect(isValid).toBe(false);
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.age).toBeDefined();
  });
});
```

---

## 🎨 UI/UX Improvements

### 1. Loading States

**Issue:** Loading states may not be consistent or accessible.

**Recommendation:**

```tsx
// components/LoadingState.tsx
interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'medium',
}) => (
  <Box
    role="status"
    aria-live="polite"
    aria-label={message}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      py: 4,
    }}
  >
    <CircularProgress size={size === 'small' ? 24 : size === 'large' ? 64 : 40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Test
it('announces loading state to screen readers', () => {
  render(<LoadingState message="Loading data" />);

  const status = screen.getByRole('status');
  expect(status).toHaveAttribute('aria-label', 'Loading data');
  expect(status).toHaveAttribute('aria-live', 'polite');
});
```

### 2. Error States

**Issue:** Error messages may not be user-friendly or accessible.

**Recommendation:**

```tsx
// components/ErrorState.tsx
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry }) => (
  <Box
    role="alert"
    aria-live="assertive"
    sx={{
      p: 3,
      textAlign: 'center',
      bgcolor: 'error.light',
      borderRadius: 1,
    }}
  >
    <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="contained" onClick={onRetry} startIcon={<RefreshIcon />}>
        Try Again
      </Button>
    )}
  </Box>
);

// Test
it('announces errors to screen readers', () => {
  render(<ErrorState title="Error Loading Data" message="Failed to fetch data" />);

  const alert = screen.getByRole('alert');
  expect(alert).toHaveAttribute('aria-live', 'assertive');
});

it('allows retry action', async () => {
  const onRetry = jest.fn();
  const user = userEvent.setup();

  render(<ErrorState title="Error" message="Failed" onRetry={onRetry} />);

  await user.click(screen.getByRole('button', { name: /try again/i }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
```

---

## 🔒 Security Considerations

### 1. Input Validation

**Issue:** Client-side validation may be incomplete.

**Recommendation:**

- Use Zod schemas consistently
- Validate all form inputs
- Sanitize user input
- Never trust client data on the server

### 2. API Error Handling

**Issue:** API errors may expose sensitive information.

**Recommendation:**

```typescript
// lib/errorHandling.ts
export const sanitizeError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Don't expose internal error details
    if (error.response?.status === 500) {
      return 'An unexpected error occurred. Please try again later.';
    }

    return error.response?.data?.message || 'An error occurred';
  }

  return 'An unexpected error occurred';
};

// Usage in components
try {
  await createLoan(data);
} catch (error) {
  setError(sanitizeError(error));
}
```

---

## 📊 Performance Optimizations

### 1. Component Memoization

```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo<Props>(
  ({ data }) => {
    return <ComplexVisualization data={data} />;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. Query Optimization

```typescript
// Use staleTime to reduce unnecessary refetches
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: ProductsClient.getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

---

## 📝 Documentation

### 1. Component Documentation

**Recommendation:** Add JSDoc comments to all public components

````tsx
/**
 * Displays a statistical card with an icon, value, and label.
 * Optionally clickable for navigation or actions.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   icon={<UsersIcon />}
 *   value={42}
 *   label="Total Users"
 *   gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
 *   onClick={() => navigate('/users')}
 * />
 * ```
 */
export const StatsCard: React.FC<StatsCardProps> = ({ ... }) => {
  // ...
};
````

### 2. Hook Documentation

````typescript
/**
 * Hook for managing loans data with create, update, and delete operations.
 * Automatically invalidates queries and updates cache.
 *
 * @param filters - Optional filters for loans list
 * @returns Object containing loans data and mutation functions
 *
 * @example
 * ```tsx
 * const { data, isLoading, createLoan } = useLoans({ status: 'ACTIVE' });
 *
 * const handleCreate = async () => {
 *   await createLoan.mutateAsync({ productId, borrowerId });
 * };
 * ```
 */
export const useLoans = (filters?: LoanFilters) => {
  // ...
};
````

---

## 🎯 Priority Action Items

1. **High Priority:**

   - [ ] Fix accessibility issues in interactive components
   - [ ] Add ARIA labels to all interactive elements
   - [ ] Implement proper keyboard navigation

2. **Medium Priority:**

   - [ ] Extract business logic to custom hooks
   - [ ] Add utility functions with tests
   - [ ] Improve error handling consistency

3. **Low Priority:**
   - [ ] Add JSDoc comments
   - [ ] Optimize performance bottlenecks
   - [ ] Enhance visual loading states

---

## 📚 Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

**Note:** These recommendations should be implemented incrementally alongside feature development and testing expansion.
