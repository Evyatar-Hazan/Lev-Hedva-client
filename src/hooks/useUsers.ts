import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersClient } from '../api/clients';
import type { CreateUserDto, UpdateUserDto, UsersQueryDto } from '../lib/types';

// קיי למטמון
const USERS_QUERY_KEY = ['users'] as const;

// Hook לקבלת רשימת משתמשים
export const useUsers = (params?: UsersQueryDto) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => UsersClient.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};

// Hook לקבלת משתמש בודד
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => UsersClient.getUserById(id),
    enabled: !!id,
  });
};

// Hook ליצירת משתמש חדש
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserDto) => UsersClient.createUser(userData),
    onSuccess: () => {
      // רענון הרשימה לאחר יצירה
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

// Hook לעדכון משתמש
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserDto }) =>
      UsersClient.updateUser(id, userData),
    onSuccess: (_, variables) => {
      // עדכון הנתונים במטמון
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook למחיקת משתמש
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

// Hook להפעלה/השבתה של משתמש (נתעדכן בעתיד)
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      // כרגע נעשה עדכון רגיל עד שנוסיף פונקציית הפעלה/השבתה מיוחדת
      UsersClient.updateUser(id, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook לניהול הרשאה בודדת
export const useAssignPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, permissionId }: { userId: string; permissionId: string }) =>
      UsersClient.assignPermission(userId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.userId] });
    },
  });
};

export const useRevokePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, permissionId }: { userId: string; permissionId: string }) =>
      UsersClient.revokePermission(userId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.userId] });
    },
  });
};

// Hook לקבלת הרשאות של משתמש
export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, userId, 'permissions'],
    queryFn: () => UsersClient.getUserPermissions(userId),
    enabled: !!userId,
  });
};
