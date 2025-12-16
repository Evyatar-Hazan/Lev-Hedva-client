import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { AuditClient } from '../api/clients/audit.client';
import { CreateAuditLogDto, AuditLogsQueryDto } from '../lib/types';

const AUDIT_QUERY_KEY = ['audit'];

// Hook לקבלת רשימת לוגי ביקורת
export const useAuditLogs = (params?: AuditLogsQueryDto) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, params],
    queryFn: () => AuditClient.getAuditLogs(params),
    staleTime: 60 * 1000, // דקה אחת
  });
};

// Hook לקבלת רשימת לוגי ביקורת עם infinite scroll
export const useInfiniteAuditLogs = (limit = 50) => {
  return useInfiniteQuery({
    queryKey: [...AUDIT_QUERY_KEY, 'infinite', limit],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      AuditClient.getAuditLogs({ page: pageParam, limit }),
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      // Debug: בואו נראה מה אנו מקבלים
      console.log('lastPage:', lastPage);

      // השרת מחזיר מבנה שטוח ללא pagination wrapper
      if (!lastPage) {
        console.log('No lastPage');
        return undefined;
      }

      const currentPage = lastPage.page || 1;
      const total = lastPage.total || 0;
      const pageLimit = lastPage.limit || limit;
      const totalPages = lastPage.totalPages || Math.ceil(total / pageLimit);

      console.log('Pagination info:', { currentPage, total, pageLimit, totalPages });

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });
};

// Hook לקבלת לוג ביקורת בודד
export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, id],
    queryFn: () => AuditClient.getAuditLogById(id),
    enabled: !!id,
  });
};

// Hook ליצירת לוג ביקורת חדש
export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logData: CreateAuditLogDto) => AuditClient.createAuditLog(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEY });
    },
  });
};

// Hook לקבלת פעילות של משתמש מסוים
export const useUserActivity = (userId: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, 'user', userId, dateFrom, dateTo],
    queryFn: () => AuditClient.getUserActivity(userId, dateFrom, dateTo),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook לקבלת סטטיסטיקות ביקורת
export const useAuditStats = () => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, 'stats'],
    queryFn: () => AuditClient.getAuditStats(),
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};
