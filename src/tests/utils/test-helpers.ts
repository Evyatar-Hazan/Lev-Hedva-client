import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Wait for element to be removed from the DOM
 */
export const waitForElementToBeRemoved = async (callback: () => Element | null) => {
  await waitFor(() => {
    expect(callback()).not.toBeInTheDocument();
  });
};

/**
 * Wait for loading to finish
 */
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(document.querySelector('[role="progressbar"]')).not.toBeInTheDocument();
  });
};

/**
 * Type into an input field with realistic timing
 */
export const typeIntoInput = async (element: Element, text: string) => {
  const user = userEvent.setup();
  await user.clear(element);
  await user.type(element, text);
};

/**
 * Click element with user event
 */
export const clickElement = async (element: Element) => {
  const user = userEvent.setup();
  await user.click(element);
};

/**
 * Submit a form
 */
export const submitForm = async (form: HTMLFormElement) => {
  const user = userEvent.setup();
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    await user.click(submitButton);
  }
};

/**
 * Select option from dropdown
 */
export const selectOption = async (element: Element, optionText: string) => {
  const user = userEvent.setup();
  await user.click(element);
  await waitFor(() => {
    const option = document.querySelector(`[role="option"][data-value="${optionText}"]`);
    expect(option).toBeInTheDocument();
  });
  const option = document.querySelector(`[role="option"][data-value="${optionText}"]`);
  if (option) {
    await user.click(option);
  }
};

/**
 * Wait for API call to resolve
 */
export const waitForApiCall = async () => {
  await waitFor(() => {}, { timeout: 3000 });
};

/**
 * Mock console methods for tests
 */
export const mockConsole = () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });
};

/**
 * Create a promise that resolves after a delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  return localStorageMock;
};

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = () => {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  return sessionStorageMock;
};
