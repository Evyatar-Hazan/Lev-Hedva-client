import { axe, toHaveNoViolations } from 'jest-axe';
import { RenderResult } from '@testing-library/react';

// Type augmentation for jest-axe matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

expect.extend(toHaveNoViolations);

/**
 * Run accessibility tests on a rendered component
 * @param container - The container from render result
 * @param options - Optional axe configuration
 */
export const runAccessibilityTests = async (container: RenderResult['container'], options = {}) => {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Common accessibility test configurations
 */
export const a11yConfig = {
  /**
   * Skip color contrast checks (useful for testing with mock data/colors)
   */
  skipColorContrast: {
    rules: {
      'color-contrast': { enabled: false },
    },
  },

  /**
   * Focus only on critical WCAG 2.1 Level A & AA rules
   */
  wcagAAOnly: {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
  },
};

/**
 * Test keyboard navigation patterns
 */
export const testKeyboardNavigation = {
  /**
   * Simulate Tab key press
   */
  tab: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Shift+Tab key press (reverse tab)
   */
  shiftTab: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      shiftKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Enter key press
   */
  enter: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Escape key press
   */
  escape: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Space key press
   */
  space: () => {
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      keyCode: 32,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Arrow Down key press
   */
  arrowDown: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  /**
   * Simulate Arrow Up key press
   */
  arrowUp: () => {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38,
      bubbles: true,
    });
    document.dispatchEvent(event);
  },
};

/**
 * Helper to check if element is keyboard focusable
 */
export const isKeyboardFocusable = (element: Element): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: Element): Element[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors));
};
