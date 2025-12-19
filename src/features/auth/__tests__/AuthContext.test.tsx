import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthClient } from '../../../api/clients/auth.client';
import { TokenManager } from '../../../api/tokenManager';
import { ReactNode } from 'react';

// Mock dependencies
jest.mock('../../../api/clients/auth.client');
jest.mock('../../../api/tokenManager');

const mockAuthClient = AuthClient as jest.Mocked<typeof AuthClient>;
const mockTokenManager = TokenManager as jest.Mocked<typeof TokenManager>;

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenManager.getAccessToken.mockReturnValue(null);
    mockTokenManager.getRefreshToken.mockReturnValue(null);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'CLIENT' as const,
          isActive: true,
        },
      };

      mockAuthClient.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockResponse.user);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockAuthClient.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(
        mockResponse.accessToken,
        mockResponse.refreshToken
      );
    });

    it('should handle login failure with invalid credentials', async () => {
      const errorMessage = 'פרטי התחברות לא נכונים';
      mockAuthClient.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
      });

      expect(mockTokenManager.setTokens).not.toHaveBeenCalled();
    });

    it('should handle login failure for inactive user with specific message', async () => {
      const errorMessage = 'החשבון שלך אינו פעיל. אנא פנה למנהל המערכת לשחרור החשבון.';
      mockAuthClient.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('inactive@example.com', 'password123');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
      });

      expect(mockTokenManager.setTokens).not.toHaveBeenCalled();
    });

    it('should set loading state during login', async () => {
      const mockResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'CLIENT' as const,
          isActive: true,
        },
      };

      mockAuthClient.login.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginPromise: Promise<void>;
      act(() => {
        loginPromise = result.current.login('test@example.com', 'password123');
      });

      // Check loading state is true during login
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await loginPromise;
      });

      // Check loading state is false after login
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear tokens', async () => {
      mockAuthClient.logout.mockResolvedValue({ message: 'Logged out successfully' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockAuthClient.logout).toHaveBeenCalled();
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if server logout fails', async () => {
      mockAuthClient.logout.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockAuthClient.login.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // First, cause an error
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      // Then clear the error
      act(() => {
        result.current.clearError();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
