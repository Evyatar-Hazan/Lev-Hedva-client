import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Lev-Hedva Application
 *
 * These tests cover critical user journeys and ensure
 * the application works correctly in a real browser environment.
 */

test.describe('Lev-Hedva Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle');

    // Verify app loaded
    await expect(page).toHaveTitle(/Lev Hedva/i);
  });

  test.describe('Authentication Flow', () => {
    test('should display login page with all required elements', async ({ page }) => {
      // Check for Hebrew welcome text (adapt based on actual content)
      await expect(page.locator('text=/ברוכים הבאים|התחברות|Login/i')).toBeVisible();

      // Check for form fields using accessible selectors
      await expect(page.getByRole('textbox', { name: /email|אימייל/i })).toBeVisible();
      await expect(
        page
          .getByRole('textbox', { name: /password|סיסמה/i })
          .or(page.locator('input[type="password"]'))
      ).toBeVisible();

      // Check for submit button
      await expect(page.getByRole('button', { name: /sign in|היכנס|התחבר/i })).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      // Find and click submit button
      const submitButton = page.getByRole('button', { name: /sign in|היכנס|התחבר/i });
      await submitButton.click();

      // HTML5 validation or custom error messages should appear
      const emailInput = page.getByRole('textbox', { name: /email|אימייל/i });
      const isRequired = await emailInput.getAttribute('required');

      expect(isRequired).toBeTruthy();
    });

    test('should handle invalid credentials gracefully', async ({ page }) => {
      // Fill in invalid credentials
      await page.fill('[type="email"]', 'invalid@email.com');
      await page.fill('[type="password"]', 'wrongpassword');

      // לחץ על כפתור התחברות
      await page.click('button[type="submit"]');

      // ודא שהודעת שגיאה מוצגת
      await expect(page.getByText(/שגיאה|אירעה שגיאה|פרטים שגויים/)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // נסה לשלוח ללא מילוי שדות
      await page.click('button[type="submit"]');

      // ודא שהשדות מסומנים כנדרשים
      const emailInput = page.getByLabel('כתובת אימייל');
      const passwordInput = page.getByLabel('סיסמה');

      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });
  });

  test.describe('🔗 בדיקות תקשורת עם השרת', () => {
    test('should show connection status', async ({ page }) => {
      // בדוק שבדיקת החיבור פועלת
      const connectionCheck = page.getByText('בודק חיבור לשרת');

      // אם הרכיב של בדיקת החיבור מוצג, ודא שהוא עובר
      if (await connectionCheck.isVisible()) {
        await expect(
          page.getByText('השרת לא פועל').or(page.getByText('קליינט פעיל'))
        ).toBeVisible();
      }
    });

    test('should handle server unavailable gracefully', async ({ page }) => {
      // סימולציה של שרת לא זמין (נעשה ע"י ביטול בקשות רשת)
      await page.route('**/api/**', route => route.abort());

      // רענון הדף
      await page.reload();

      // ודא שמוצגת הודעת שגיאה מתאימה
      await expect(page.getByText(/שגיאה בחיבור|השרת לא פועל/)).toBeVisible();
    });
  });

  test.describe('🎨 בדיקות UI ו-UX', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // הגדר גודל מסך נייד
      await page.setViewportSize({ width: 375, height: 667 });

      // ודא שהעמוד עדיין נראה טוב
      await expect(page.getByText('ברוכים הבאים ללב חדוה')).toBeVisible();

      // בדוק שהטופס לא חורג מהמסך
      const form = page.locator('form').first();
      const boundingBox = await form.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    });

    test('should support RTL layout', async ({ page }) => {
      // בדוק שהטקסט בעברית מוצג נכון (מימין לשמאל)
      const title = page.getByText('ברוכים הבאים ללב חדוה');
      await expect(title).toBeVisible();

      // בדוק שכיוון הטקסט נכון
      const direction = await title.evaluate(el => getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
    });

    test('should show loading states', async ({ page }) => {
      // מלא פרטי התחברות
      await page.fill('[type="email"]', 'test@example.com');
      await page.fill('[type="password"]', 'password123');

      // ליירט את בקשת ההתחברות כדי להאט אותה
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      // לחץ על כפתור התחברות
      await page.click('button[type="submit"]');

      // ודא שמוצג מצב טעינה
      await expect(page.getByText(/טוען|Loading/)).toBeVisible();
    });
  });

  test.describe('♿ בדיקות נגישות', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // בדוק שיש תוויות נגישות מתאימות
      await expect(page.getByRole('textbox', { name: /אימייל|email/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /סיסמה|password/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /היכנס|login/i })).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // נווט באמצעות מקלדת
      await page.keyboard.press('Tab'); // email field
      await expect(page.getByLabel('כתובת אימייל')).toBeFocused();

      await page.keyboard.press('Tab'); // password field
      await expect(page.getByLabel('סיסמה')).toBeFocused();

      await page.keyboard.press('Tab'); // submit button
      await expect(page.getByRole('button', { name: 'היכנס' })).toBeFocused();
    });
  });

  test.describe('🔒 בדיקות אבטחה בסיסיות', () => {
    test('should not expose sensitive data in DOM', async ({ page }) => {
      // מלא פרטי התחברות
      await page.fill('[type="password"]', 'secretpassword123');

      // בדוק שהסיסמה לא נראית בDOM
      const pageContent = await page.content();
      expect(pageContent).not.toContain('secretpassword123');
    });

    test('should redirect authenticated users', async ({ page }) => {
      // סימולציה של משתמש מחובר
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'fake-token');
      });

      await page.goto('http://localhost:3000/login');

      // ודא שמשתמש מחובר מופנה לדשבורד
      await expect(page).toHaveURL(/dashboard/);
    });
  });
});

// 🧪 בדיקות מותנות (רק אם יש credentials תקינים)
test.describe('💼 בדיקות עם אימות (אופציונלי)', () => {
  const validEmail = process.env.TEST_EMAIL || 'admin@levhedva.org';
  const validPassword = process.env.TEST_PASSWORD || 'admin123';

  test.skip(({ browserName }) => !process.env.TEST_EMAIL, 'נדרשות credentials לבדיקות אלו');

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('[type="email"]', validEmail);
    await page.fill('[type="password"]', validPassword);
    await page.click('button[type="submit"]');

    // ודא הפניה לדשבורד
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/דשבורד|ברוכים הבאים/)).toBeVisible();
  });

  test('should access protected pages after login', async ({ page }) => {
    // התחבר
    await page.fill('[type="email"]', validEmail);
    await page.fill('[type="password"]', validPassword);
    await page.click('button[type="submit"]');

    // חכה להפניה
    await page.waitForURL(/dashboard/);

    // בדוק גישה לעמודים מוגנים
    const protectedPages = ['/users', '/products', '/loans', '/volunteers', '/audit'];

    for (const pagePath of protectedPages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      // ודא שהעמוד נטען ולא הופנה לlogout
      await expect(page).toHaveURL(new RegExp(pagePath));
    }
  });

  test('should logout successfully', async ({ page }) => {
    // התחבר
    await page.fill('[type="email"]', validEmail);
    await page.fill('[type="password"]', validPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/);

    // בדוק אם יש כפתור יציאה וצא
    const logoutButton = page.getByText(/יצא|התנתק|logout/i);
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // ודא הפניה לדף התחברות
      await expect(page).toHaveURL(/login/);
    }
  });
});
