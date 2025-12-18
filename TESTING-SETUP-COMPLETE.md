# Testing & Quality Infrastructure - Complete Setup ✅

## מה נבנה? (What Was Built?)

תשתית מקיפה לבדיקות ואכיפת איכות קוד ברמה production-grade.

### 🎯 רכיבים עיקריים (Main Components)

#### 1. תצורת בדיקות (Test Configuration)

- ✅ **Jest Configuration** - יחידה ואינטגרציה
- ✅ **Playwright Configuration** - E2E בדפדפנים אמיתיים
- ✅ **Prettier Configuration** - פורמט קוד אחיד
- ✅ **ESLint Integration** - בדיקת איכות קוד

#### 2. כלי בדיקה (Test Utilities)

- ✅ **test-utils.tsx** - פונקציות render מותאמות עם Providers
- ✅ **accessibility-helpers.ts** - בדיקות נגישות אוטומטיות
- ✅ **test-helpers.ts** - פונקציות עזר לאינטראקציות וחיכות
- ✅ **Mock Service Worker** - חיקוי API מלא

#### 3. מפעלי נתונים (Test Factories)

- ✅ **factories/index.ts** - יצירת נתוני בדיקה ריאליסטיים
- ✅ שימוש ב-@faker-js/faker
- ✅ תמיכה ב-overrides מותאמים

#### 4. דוגמאות בדיקה (Test Examples)

- ✅ **Hook Test** - `useLoans.test.ts`
- ✅ **Component Test** - `StatsCard.test.tsx`
- ✅ **E2E Test** - `app.spec.ts` (שופר)

#### 5. Git Hooks

- ✅ **pre-commit** - lint + format + type-check
- ✅ **pre-push** - בדיקות מלאות
- ✅ **lint-staged** - בדיקה רק של קבצים שהשתנו

#### 6. תיעוד מקיף (Documentation)

- ✅ `TESTING.md` - מדריך מלא
- ✅ `TESTING-QUICK-START.md` - התחלה מהירה
- ✅ `TESTING-INFRASTRUCTURE.md` - סקירה ארכיטקטונית
- ✅ `CODE-QUALITY-RECOMMENDATIONS.md` - המלצות לשיפור

---

## 🚀 התחלה מהירה (Quick Start)

### התקנה

```bash
# 1. התקן חבילות (אם טרם הותקנו)
npm install

# 2. הפעל את סקריפט ההתקנה
./setup-testing.sh

# או ידנית:
npm install --save-dev @faker-js/faker
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### הרצת בדיקות

```bash
# מצב פיתוח - עם watch
npm test

# בדיקה אחת - למשל בCI
npm run test:ci

# עם כיסוי
npm run test:coverage

# נגישות בלבד
npm run test:a11y

# E2E
npm run test:e2e
npm run test:e2e:ui

# בדיקת כל הקוד
npm run validate
```

---

## 📂 מבנה הקבצים (File Structure)

```
Lev-Hedva-client/
├── .husky/
│   ├── pre-commit          # בדיקות מהירות לפני commit
│   └── pre-push            # בדיקות מלאות לפני push
├── docs/
│   ├── TESTING.md                         # מדריך מלא
│   ├── TESTING-QUICK-START.md            # התחלה מהירה
│   ├── TESTING-INFRASTRUCTURE.md         # סקירה ארכיטקטונית
│   └── CODE-QUALITY-RECOMMENDATIONS.md   # המלצות לשיפור
├── src/
│   ├── components/
│   │   └── __tests__/                    # בדיקות קומפוננטות
│   ├── hooks/
│   │   └── __tests__/                    # בדיקות hooks
│   └── tests/
│       ├── factories/                     # מפעלי נתוני בדיקה
│       ├── mocks/                         # MSW handlers
│       └── utils/                         # כלי עזר לבדיקות
├── tests/
│   └── e2e/                               # בדיקות E2E
├── .prettierrc                            # תצורת Prettier
├── .prettierignore                        # התעלמות Prettier
├── .lintstagedrc.json                     # תצורת lint-staged
├── jest.config.js                         # תצורת Jest
├── playwright.config.ts                   # תצורת Playwright
└── setup-testing.sh                       # סקריפט התקנה
```

---

## ✅ אכיפת איכות (Quality Enforcement)

### Pre-commit Hook (מהיר)

בכל commit:

- ✓ Lint קבצים שהשתנו
- ✓ Format קבצים שהשתנו
- ✓ Type check

### Pre-push Hook (מקיף)

לפני push:

- ✓ Lint מלא
- ✓ Type check מלא
- ✓ כל הבדיקות
- ✓ בדיקות נגישות

### דרישות כיסוי (Coverage Requirements)

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

---

## 📖 איך לכתוב בדיקות? (How to Write Tests?)

### 1. בדיקת פונקציה פשוטה

```typescript
// src/lib/utils/sum.test.ts
import { sum } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(sum(-1, 2)).toBe(1);
  });
});
```

### 2. בדיקת קומפוננטה

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import Button from '../Button';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles clicks', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. בדיקת Hook

```typescript
// src/hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 4. בדיקת נגישות

```typescript
import { runAccessibilityTests } from '@/tests/utils/accessibility-helpers';

it('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  await runAccessibilityTests(container);
});
```

---

## 🛠️ פתרון בעיות (Troubleshooting)

### Hooks לא עובדים?

```bash
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### בדיקות נכשלות?

```bash
npm run test:ci
npm run type-check
npm run lint
```

### זקוק לעזרה?

1. קרא `docs/TESTING-QUICK-START.md`
2. בדוק דוגמאות קיימות
3. בדוק את הודעות השגיאה
4. שאל את חברי הצוות

---

## 🎯 העיקר (TL;DR)

### מה נבנה:

✅ תשתית בדיקות מקיפה (Unit, Component, Integration, E2E)
✅ אכיפת איכות אוטומטית (Git hooks)
✅ בדיקות נגישות אינטגרליות
✅ תיעוד מפורט ודוגמאות
✅ כלים לייצור נתוני בדיקה

### איך להשתמש:

```bash
# פיתוח
npm test

# לפני push
npm run validate

# E2E
npm run test:e2e
```

### קריטי לזכור:

- 🔴 **כל הקוד חייב להיות באנגלית** (כולל הערות ובדיקות)
- ♿ **נגישות היא חובה**, לא אופציה
- ✅ **בדיקות חייבות לעבור** לפני push
- 📊 **כיסוי מינימלי: 70%**

---

## 📚 מסמכים נוספים (Additional Documentation)

| מסמך                              | תוכן                        |
| --------------------------------- | --------------------------- |
| `TESTING.md`                      | מדריך מלא עם כל הפרטים      |
| `TESTING-QUICK-START.md`          | דוגמאות מעשיות והתחלה מהירה |
| `TESTING-INFRASTRUCTURE.md`       | סקירה ארכיטקטונית           |
| `CODE-QUALITY-RECOMMENDATIONS.md` | בעיות שזוהו והמלצות לשיפור  |

---

## 🎉 הצלחה!

התשתית מוכנה לשימוש. כעת ניתן:

1. להריץ בדיקות בקלות
2. לכתוב בדיקות חדשות
3. לאכוף איכות קוד
4. להבטיח נגישות
5. לפרוס בביטחון

**זכור:** בדיקות טובות = refactoring בטוח = פריסה בביטחון! 🚀

---

**נבנה עם ❤️ עבור צוות לב חדוה**

_עודכן לאחרונה: דצמבר 2024_
