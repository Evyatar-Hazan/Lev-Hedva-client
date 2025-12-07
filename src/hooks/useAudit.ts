import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuditClient } from '../api/clients/audit.client';
import { 
  CreateAuditLogDto,
  AuditLogsQueryDto 
} from '../lib/types';

const AUDIT_QUERY_KEY = ['audit'];

// Hook לקבלת רשימת לוגי ביקורת
export const useAuditLogs = (params?: AuditLogsQueryDto) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, params],
    queryFn: () => AuditClient.getAuditLogs(params),
    staleTime: 60 * 1000, // דקה אחת
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
    mutationFn: (logData: CreateAuditLogDto) => 
      AuditClient.createAuditLog(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEY });
    },
  });
};

// Hook לקבלת פעילות של משתמש מסוים
export const useUserActivity = (
  userId: string, 
  dateFrom?: string, 
  dateTo?: string
) => {
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