import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { AuthProvider } from '@/features/auth/AuthContext';

// Create RTL cache for tests
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [],
});

// Create a test theme
const testTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that includes all necessary providers for testing
 */
export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={testTheme}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>{children}</AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

/**
 * Custom render function that wraps components with all necessary providers
 * @param ui - The component to render
 * @param options - Optional render options
 * @returns RenderResult from @testing-library/react
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, { wrapper: AllProviders, ...options });
};

/**
 * Render component without router for testing components that don't need routing
 */
export const renderWithoutRouter = (ui: ReactElement, options?: RenderOptions): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={testTheme}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Create a mock QueryClient for testing
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
