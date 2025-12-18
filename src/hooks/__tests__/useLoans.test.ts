import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useLoans, useCreateLoan, useReturnLoan } from '@/hooks/useLoans';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { createMockLoan, createMockArray } from '@/tests/factories';

/**
 * Create a wrapper with QueryClient for hooks testing
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Return a wrapper component for React Query
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  return Wrapper;
};

describe('useLoans Hook', () => {
  describe('useLoans - Fetching loans list', () => {
    it('should fetch loans successfully', async () => {
      const mockLoans = createMockArray(createMockLoan, 3);

      server.use(
        http.get('http://localhost:3001/api/loans', () => {
          return HttpResponse.json({
            data: mockLoans,
            total: mockLoans.length,
          });
        })
      );

      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data).toHaveLength(3);
      expect(result.current.data?.total).toBe(3);
    });

    it('should handle fetch error', async () => {
      server.use(
        http.get('http://localhost:3001/api/loans', () => {
          return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should pass query parameters correctly', async () => {
      let capturedParams: any = null;

      server.use(
        http.get('http://localhost:3001/api/loans', ({ request }) => {
          const url = new URL(request.url);
          capturedParams = {
            status: url.searchParams.get('status'),
            page: url.searchParams.get('page'),
          };

          return HttpResponse.json({
            data: [],
            total: 0,
          });
        })
      );

      const queryParams = {
        status: 'ACTIVE',
        page: 2,
      };

      const { result } = renderHook(() => useLoans(queryParams), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(capturedParams).toEqual({
        status: 'ACTIVE',
        page: '2',
      });
    });
  });

  describe('useCreateLoan - Creating new loan', () => {
    it('should create loan successfully', async () => {
      const newLoan = createMockLoan();

      server.use(
        http.post('http://localhost:3001/api/loans', () => {
          return HttpResponse.json(newLoan);
        })
      );

      const { result } = renderHook(() => useCreateLoan(), {
        wrapper: createWrapper(),
      });

      const loanData = {
        productId: '123',
        borrowerId: '456',
        dueDate: new Date().toISOString(),
      };

      result.current.mutate(loanData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newLoan);
    });

    it('should handle creation error', async () => {
      server.use(
        http.post('http://localhost:3001/api/loans', () => {
          return HttpResponse.json({ message: 'Validation error' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useCreateLoan(), {
        wrapper: createWrapper(),
      });

      const loanData = {
        productId: '',
        borrowerId: '',
        dueDate: '',
      };

      result.current.mutate(loanData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useReturnLoan - Returning a loan', () => {
    it('should return loan successfully', async () => {
      const returnedLoan = createMockLoan({ status: 'RETURNED' });

      server.use(
        http.patch('http://localhost:3001/api/loans/:id/return', () => {
          return HttpResponse.json(returnedLoan);
        })
      );

      const { result } = renderHook(() => useReturnLoan(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('loan-id-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe('RETURNED');
    });

    it('should handle return error', async () => {
      server.use(
        http.patch('http://localhost:3001/api/loans/:id/return', () => {
          return HttpResponse.json({ message: 'Loan not found' }, { status: 404 });
        })
      );

      const { result } = renderHook(() => useReturnLoan(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('invalid-id');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
