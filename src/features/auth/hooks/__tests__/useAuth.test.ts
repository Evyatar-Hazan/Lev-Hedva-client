// 🧪 Unit Tests for Authentication Hook
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '../useAuth';
import { AuthClient } from '../../api/clients/auth.client';
import { TokenManager } from '../../api/tokenManager';

// Mock dependencies
jest.mock('../../api/clients/auth.client');
jest.mock('../../api/tokenManager');

const mockAuthClient = AuthClient as jest.Mocked<typeof AuthClient>;
const mockTokenManager = TokenManager as jest.Mocked<typeof TokenManager>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('🔐 useAuth Hook Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('🏁 Initialization', () => {
    
    test('should initialize with not authenticated state', () => {
      // Arrange
      mockTokenManager.getAccessToken.mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    test('should initialize with authenticated state when token exists', () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      
      mockTokenManager.getAccessToken.mockReturnValue(mockToken);
      mockAuthClient.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Assert
      expect(result.current.isLoading).toBe(true);
      // Note: actual authentication state will be set after the async call completes
    });
  });

  describe('🔐 Login Functionality', () => {
    
    test('should login successfully with valid credentials', async () => {
      // Arrange
      const mockCredentials = { email: 'test@example.com', password: 'password123' };
      const mockTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      
      mockAuthClient.login.mockResolvedValue(mockTokens);
      mockAuthClient.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.login(mockCredentials.email, mockCredentials.password);
      });

      // Assert
      expect(mockAuthClient.login).toHaveBeenCalledWith(mockCredentials);
      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(mockTokens.accessToken, mockTokens.refreshToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    test('should handle login failure', async () => {
      // Arrange
      const mockError = new Error('שם משתמש או סיסמה שגויים');
      mockAuthClient.login.mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.login('invalid@email.com', 'wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('שם משתמש או סיסמה שגויים');
    });

    test('should set loading state during login', async () => {
      // Arrange
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => { resolveLogin = resolve; });
      mockAuthClient.login.mockReturnValue(loginPromise);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.login('test@example.com', 'password');
      });

      // Assert - should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      act(() => {
        resolveLogin({ accessToken: 'token', refreshToken: 'refresh' });
      });

      // Wait for state update
      await act(async () => {
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('🚪 Logout Functionality', () => {
    
    test('should logout successfully', async () => {
      // Arrange
      mockTokenManager.getAccessToken.mockReturnValue('existing-token');
      mockAuthClient.logout.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(mockAuthClient.logout).toHaveBeenCalled();
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    test('should clear tokens even if logout API fails', async () => {
      // Arrange
      mockTokenManager.getAccessToken.mockReturnValue('existing-token');
      mockAuthClient.logout.mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('🔄 Token Refresh', () => {
    
    test('should refresh token when needed', async () => {
      // This test would depend on your specific token refresh implementation
      // For now, we'll skip it as the exact implementation might vary
      test.todo('should refresh token when access token expires');
    });
  });

  describe('👤 User Data', () => {
    
    test('should fetch user data when token exists', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      
      mockTokenManager.getAccessToken.mockReturnValue(mockToken);
      mockAuthClient.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const { result, waitFor } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for the async initialization to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should handle user data fetch failure', async () => {
      // Arrange
      mockTokenManager.getAccessToken.mockReturnValue('invalid-token');
      mockAuthClient.getCurrentUser.mockRejectedValue(new Error('Token expired'));

      // Act
      const { result, waitFor } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for the async call to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(mockTokenManager.clearTokens).toHaveBeenCalled(); // Should clear invalid tokens
    });
  });

  describe('⚠️ Error Handling', () => {
    
    test('should clear error on successful operation', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // First, set an error state
      act(() => {
        result.current.setError('Previous error');
      });
      expect(result.current.error).toBe('Previous error');

      // Then perform successful login
      mockAuthClient.login.mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' });
      mockAuthClient.getCurrentUser.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Assert error is cleared
      expect(result.current.error).toBeNull();
    });

    test('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockAuthClient.login.mockRejectedValue(networkError);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password');
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert
      expect(result.current.error).toContain('Network Error');
    });
  });
});