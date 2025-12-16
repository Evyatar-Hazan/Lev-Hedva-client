import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersClient } from '../api/clients';
import type { CreateUserDto, UpdateUserDto, UsersQueryDto } from '../lib/types';

// Cache key
const USERS_QUERY_KEY = ['users'] as const;

// Hook to get list of users
export const useUsers = (params?: UsersQueryDto) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => UsersClient.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => UsersClient.getUserById(id),
    enabled: !!id,
  });
};

// Hook to create new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserDto) => UsersClient.createUser(userData),
    onSuccess: () => {
      // Refresh the list after creation
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

// Hook to update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserDto }) =>
      UsersClient.updateUser(id, userData),
    onSuccess: (_, variables) => {
      // Update data in cache
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook to delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

// Hook to enable/disable user (will be updated in the future)
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      // Currently do a regular update until we add special enable/disable function
      UsersClient.updateUser(id, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook to manage single permission
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

// Hook to get user permissions
export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, userId, 'permissions'],
    queryFn: () => UsersClient.getUserPermissions(userId),
    enabled: !!userId,
  });
};
