import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoansClient } from '../api/clients/loans.client';
import { 
  CreateLoanDto, 
  UpdateLoanDto, 
  LoansQueryDto
} from '../lib/types';

const LOANS_QUERY_KEY = ['loans'];

// Hook לקבלת רשימת הלוואות
export const useLoans = (params?: LoansQueryDto) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, params],
    queryFn: () => LoansClient.getLoans(params),
    staleTime: 2 * 60 * 1000, // 2 דקות
  });
};

// Hook לקבלת הלוואה בודדת
export const useLoan = (id: string) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, id],
    queryFn: () => LoansClient.getLoanById(id),
    enabled: !!id,
  });
};

// Hook ליצירת הלוואה חדשה
export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanData: CreateLoanDto) => 
      LoansClient.createLoan(loanData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
    },
  });
};

// Hook לעדכון הלוואה
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

// Hook להחזרת הלוואה
export const useReturnLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LoansClient.returnLoan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LOANS_QUERY_KEY, id] });
    },
  });
};

// Hook לקבלת הלוואות פעילות
export const useActiveLoans = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'active'],
    queryFn: () => LoansClient.getActiveLoans(),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook לקבלת הלוואות באיחור
export const useOverdueLoans = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'overdue'],
    queryFn: () => LoansClient.getOverdueLoans(),
    staleTime: 60 * 1000, // דקה אחת
  });
};

// Hook לקבלת הלוואות של משתמש מסוים
export const useUserLoans = (userId: string) => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'user', userId],
    queryFn: () => LoansClient.getUserLoans(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook לקבלת סטטיסטיקות הלוואות
export const useLoanStats = () => {
  return useQuery({
    queryKey: [...LOANS_QUERY_KEY, 'stats'],
    queryFn: () => LoansClient.getLoanStats(),
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};