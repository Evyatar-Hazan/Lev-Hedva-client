import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoansClient } from '../api/clients/loans.client';
import { CreateLoanDto, UpdateLoanDto, LoansQueryDto } from '../lib/types';

const LOANS_QUERY_KEY = ['loans'];

// Hook to get list of loans
export const useLoans = (params?: LoansQueryDto) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, params],
    queryFn: () => LoansClient.getLoans(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get single loan
export const useLoan = (id: string) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, id],
    queryFn: () => LoansClient.getLoanById(id),
    enabled: !!id,
  });
};

// Hook to create new loan
export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanData: CreateLoanDto) => LoansClient.createLoan(loanData),
    onSuccess: () => {
      // Refresh loans data
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      // Refresh all product data (including instances)
      queryClient.invalidateQueries({
        predicate: query =>
          query.queryKey[0] === 'products' || query.queryKey[0] === 'product-instances',
      });
      // Refresh loan statistics
      queryClient.invalidateQueries({ queryKey: ['loanStats'] });
    },
  });
};

// Hook to update loan
export const useUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, loanData }: { id: string; loanData: UpdateLoanDto }) =>
      LoansClient.updateLoan(id, loanData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LOANS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook to return loan
export const useReturnLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LoansClient.returnLoan(id),
    onSuccess: (_, id) => {
      // Refresh loans data
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LOANS_QUERY_KEY, id] });
      // Refresh all product data (including instances)
      queryClient.invalidateQueries({
        predicate: query =>
          query.queryKey[0] === 'products' || query.queryKey[0] === 'product-instances',
      });
      // Refresh loan statistics
      queryClient.invalidateQueries({ queryKey: ['loanStats'] });
    },
  });
};

// Hook to get active loans
export const useActiveLoans = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'active'],
    queryFn: () => LoansClient.getActiveLoans(),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get overdue loans
export const useOverdueLoans = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'overdue'],
    queryFn: () => LoansClient.getOverdueLoans(),
    staleTime: 60 * 1000, // One minute
  });
};

// Hook to get loans for specific user
export const useUserLoans = (userId: string) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'user', userId],
    queryFn: () => LoansClient.getUserLoans(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get loan statistics
export const useLoanStats = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'stats'],
    queryFn: () => LoansClient.getLoanStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
