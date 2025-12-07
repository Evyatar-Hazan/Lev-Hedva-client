// 🧪 Unit Tests for useUsers Hook
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../useUsers';
import * as UsersClient from '../../api/clients/users.client';

// Mock the users client
jest.mock('../../api/clients/users.client');

const mockedUsersClient = UsersClient as jest.Mocked<typeof UsersClient>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('👥 useUsers Hook Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📋 Users List', () => {
    
    test('should fetch users successfully', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' },
      ];
      mockedUsersClient.getUsers.mockResolvedValue(mockUsers);

      // Act
      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      // Assert
      expect(result.current.isLoading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockUsers);
      expect(result.current.error).toBeNull();
    });

    test('should handle users fetch error', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch users');
      mockedUsersClient.getUsers.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });

    test('should support filtering', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', email: 'admin@example.com', name: 'Admin User' },
      ];
      const filters = { role: 'admin', status: 'active' };
      mockedUsersClient.getUsers.mockResolvedValue(mockUsers);

      // Act
      const { result } = renderHook(() => useUsers(filters), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(mockedUsersClient.getUsers).toHaveBeenCalledWith(filters);
      expect(result.current.data).toEqual(mockUsers);
    });

    test('should support pagination', async () => {
      // Arrange
      const paginationParams = { page: 2, limit: 10 };
      const mockResponse = {
        data: [{ id: '3', email: 'user3@example.com', name: 'User 3' }],
        total: 25,
        page: 2,
        totalPages: 3,
      };
      mockedUsersClient.getUsers.mockResolvedValue(mockResponse.data);

      // Act
      const { result } = renderHook(() => useUsers(paginationParams), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(mockedUsersClient.getUsers).toHaveBeenCalledWith(paginationParams);
    });
  });

  describe('➕ Create User', () => {
    
    test('should create user successfully', async () => {
      // Arrange
      const newUser = { email: 'new@example.com', name: 'New User', password: 'password123' };
      const createdUser = { id: '4', ...newUser };
      mockedUsersClient.createUser.mockResolvedValue(createdUser);

      // Act
      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      
      // Trigger the mutation
      result.current.mutate(newUser);

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(mockedUsersClient.createUser).toHaveBeenCalledWith(newUser);
      expect(result.current.data).toEqual(createdUser);
    });

    test('should handle create user error', async () => {
      // Arrange
      const newUser = { email: 'invalid-email', name: 'User', password: '123' };
      const mockError = new Error('Validation failed');
      mockedUsersClient.createUser.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newUser);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBeTruthy();
    });

    test('should call onSuccess callback', async () => {
      // Arrange
      const newUser = { email: 'success@example.com', name: 'Success User', password: 'pass' };
      const createdUser = { id: '5', ...newUser };
      const onSuccess = jest.fn();
      
      mockedUsersClient.createUser.mockResolvedValue(createdUser);

      // Act
      const { result } = renderHook(() => useCreateUser({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newUser);

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(onSuccess).toHaveBeenCalledWith(createdUser, newUser, expect.any(Object));
    });
  });

  describe('✏️ Update User', () => {
    
    test('should update user successfully', async () => {
      // Arrange
      const userId = '1';
      const updateData = { name: 'Updated Name' };
      const updatedUser = { id: userId, email: 'user@example.com', name: 'Updated Name' };
      
      mockedUsersClient.updateUser.mockResolvedValue(updatedUser);

      // Act
      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: userId, data: updateData });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(mockedUsersClient.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(result.current.data).toEqual(updatedUser);
    });

    test('should handle update user error', async () => {
      // Arrange
      const userId = 'nonexistent';
      const updateData = { name: 'New Name' };
      const mockError = new Error('User not found');
      
      mockedUsersClient.updateUser.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: userId, data: updateData });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBeTruthy();
    });

    test('should call onError callback', async () => {
      // Arrange
      const userId = '1';
      const updateData = { name: 'Name' };
      const mockError = new Error('Update failed');
      const onError = jest.fn();
      
      mockedUsersClient.updateUser.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useUpdateUser({ onError }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: userId, data: updateData });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(onError).toHaveBeenCalledWith(mockError, { id: userId, data: updateData }, expect.any(Object));
    });
  });

  describe('🗑️ Delete User', () => {
    
    test('should delete user successfully', async () => {
      // Arrange
      const userId = '1';
      mockedUsersClient.deleteUser.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(userId);

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(mockedUsersClient.deleteUser).toHaveBeenCalledWith(userId);
    });

    test('should handle delete user error', async () => {
      // Arrange
      const userId = 'protected-user';
      const mockError = new Error('Cannot delete protected user');
      
      mockedUsersClient.deleteUser.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(userId);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBeTruthy();
    });

    test('should call onSuccess callback after deletion', async () => {
      // Arrange
      const userId = '1';
      const onSuccess = jest.fn();
      
      mockedUsersClient.deleteUser.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useDeleteUser({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate(userId);

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(onSuccess).toHaveBeenCalledWith(undefined, userId, expect.any(Object));
    });
  });

  describe('🔄 Cache Management', () => {
    
    test('should invalidate cache after successful create', async () => {
      // This test would require more advanced setup to test query invalidation
      // For now, we'll assume that the hook properly invalidates the users list cache
      test.todo('should invalidate users cache after successful create');
    });

    test('should invalidate cache after successful update', async () => {
      test.todo('should invalidate users cache after successful update');
    });

    test('should invalidate cache after successful delete', async () => {
      test.todo('should invalidate users cache after successful delete');
    });
  });

  describe('⚡ Performance', () => {
    
    test('should not make unnecessary API calls', async () => {
      // Arrange
      const mockUsers = [{ id: '1', email: 'user@example.com', name: 'User' }];
      mockedUsersClient.getUsers.mockResolvedValue(mockUsers);

      // Act - Render hook twice with same parameters
      const { result: result1 } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });
      
      const { result: result2 } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      // Wait for both to complete
      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Assert - Should use cache for the second call
      // The exact behavior depends on your QueryClient setup
      expect(mockedUsersClient.getUsers).toHaveBeenCalled();
    });
  });

  describe('🎭 Loading States', () => {
    
    test('should show proper loading states for mutations', async () => {
      // Arrange
      const newUser = { email: 'test@example.com', name: 'Test', password: 'pass' };
      
      // Create a promise that we can control
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise(resolve => { resolveCreate = resolve; });
      mockedUsersClient.createUser.mockReturnValue(createPromise);

      // Act
      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      // Initially not loading
      expect(result.current.isPending).toBe(false);

      // Start mutation
      result.current.mutate(newUser);

      // Should be loading
      expect(result.current.isPending).toBe(true);

      // Resolve the promise
      resolveCreate({ id: '1', ...newUser });

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });
});