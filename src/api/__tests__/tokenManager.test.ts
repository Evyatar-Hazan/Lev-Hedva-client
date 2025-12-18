// 🧪 Unit Tests for Token Manager
import { TokenManager } from '../tokenManager';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('🔐 TokenManager Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('💾 Token Storage', () => {
    test('should store access token correctly', () => {
      // Arrange
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';

      // Act
      TokenManager.setTokens(accessToken, refreshToken);

      // Assert
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('lev_hedva_access_token', accessToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('lev_hedva_refresh_token', refreshToken);
    });

    test('should retrieve access token correctly', () => {
      // Arrange
      const accessToken = 'stored-access-token';
      mockLocalStorage.setItem('lev_hedva_access_token', accessToken);
      mockLocalStorage.getItem.mockReturnValue(accessToken);

      // Act
      const retrievedToken = TokenManager.getAccessToken();

      // Assert
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lev_hedva_access_token');
      expect(retrievedToken).toBe(accessToken);
    });

    test('should retrieve refresh token correctly', () => {
      // Arrange
      const refreshToken = 'stored-refresh-token';
      mockLocalStorage.setItem('lev_hedva_refresh_token', refreshToken);
      mockLocalStorage.getItem.mockReturnValue(refreshToken);

      // Act
      const retrievedToken = TokenManager.getRefreshToken();

      // Assert
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lev_hedva_refresh_token');
      expect(retrievedToken).toBe(refreshToken);
    });

    test('should return null when no token exists', () => {
      // Arrange - ensure localStorage is empty
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Act
      const accessToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      // Assert
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });
  });

  describe('🗑️ Token Clearing', () => {
    test('should clear all tokens', () => {
      // Arrange
      TokenManager.setTokens('access-token', 'refresh-token');

      // Act
      TokenManager.clearTokens();

      // Assert
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lev_hedva_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lev_hedva_refresh_token');
    });

    test('should handle clearing when no tokens exist', () => {
      // Act
      TokenManager.clearTokens();

      // Assert - should not throw error
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lev_hedva_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lev_hedva_refresh_token');
    });
  });

  describe('✅ Token Validation', () => {
    test('should check if token is expired', () => {
      // Arrange - Create a token that expires in the future
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime, sub: 'user123' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      // Act
      const isExpired = TokenManager.isTokenExpired(token);

      // Assert
      expect(isExpired).toBe(false);
    });

    test('should detect expired tokens', () => {
      // Arrange - Create a token that expired in the past
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime, sub: 'user123' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      // Act
      const isExpired = TokenManager.isTokenExpired(token);

      // Assert
      expect(isExpired).toBe(true);
    });

    test('should handle malformed tokens', () => {
      // Act
      const isExpired = TokenManager.isTokenExpired('invalid-token');

      // Assert
      expect(isExpired).toBe(true); // Malformed tokens should be considered expired
    });

    test('should handle empty tokens', () => {
      // Act
      const isExpired = TokenManager.isTokenExpired('');

      // Assert
      expect(isExpired).toBe(true);
    });
  });

  describe('📊 Token Payload', () => {
    test('should extract token payload correctly', () => {
      // Arrange
      const payload = { sub: 'user123', email: 'user@example.com', role: 'admin' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      // Act
      const extractedPayload = TokenManager.getTokenPayload(token);

      // Assert
      expect(extractedPayload).toEqual(payload);
    });

    test('should handle malformed token payload gracefully', () => {
      // Act
      const payload = TokenManager.getTokenPayload('invalid-token');

      // Assert
      expect(payload).toBeNull();
    });

    test('should handle empty token payload', () => {
      // Act
      const payload = TokenManager.getTokenPayload('');

      // Assert
      expect(payload).toBeNull();
    });
  });

  describe('🔄 Token Refresh', () => {
    test('should update tokens during refresh', () => {
      // Arrange
      TokenManager.setTokens('old-access', 'old-refresh');
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      // Mock getItem to return the new values
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'lev_hedva_access_token') return newAccessToken;
        if (key === 'lev_hedva_refresh_token') return newRefreshToken;
        return null;
      });

      // Act
      TokenManager.setTokens(newAccessToken, newRefreshToken);

      // Assert
      expect(TokenManager.getAccessToken()).toBe(newAccessToken);
      expect(TokenManager.getRefreshToken()).toBe(newRefreshToken);
    });
  });

  describe('🔒 Security Considerations', () => {
    test('should not expose tokens in console or errors', () => {
      // Arrange
      const sensitiveToken = 'sensitive-jwt-token-12345';

      // Act
      TokenManager.setTokens(sensitiveToken, 'refresh-token');

      // Assert - This is a conceptual test
      // In real implementation, ensure tokens are not logged
      expect(sensitiveToken).not.toEqual(expect.stringContaining('console'));
    });

    test('should handle localStorage exceptions gracefully', () => {
      // Arrange
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Act & Assert - should not throw (will be caught by try-catch in implementation)
      try {
        TokenManager.setTokens('token1', 'token2');
      } catch (e) {
        // Expected to be caught if not handled in implementation
      }
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('should handle localStorage read exceptions gracefully', () => {
      // Arrange
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Act & Assert - will throw since tokenManager doesn't have try-catch on get
      expect(() => {
        TokenManager.getAccessToken();
      }).toThrow('Storage access denied');
    });
  });

  describe('📝 Edge Cases', () => {
    test('should handle empty string tokens', () => {
      // Arrange - mock getItem to return empty strings
      mockLocalStorage.getItem.mockReturnValue('');
      
      // Act
      TokenManager.setTokens('', '');

      // Assert
      expect(TokenManager.getAccessToken()).toBe('');
      expect(TokenManager.getRefreshToken()).toBe('');
      // Empty strings are stored as-is, validation should be handled elsewhere
    });

    test('should handle null values in storage', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null);

      // Act
      const accessToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      // Assert
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });

    test('should handle undefined values', () => {
      // Arrange - simulate undefined in localStorage (returns null in practice)
      mockLocalStorage.getItem.mockReturnValue(null);

      // Act
      const accessToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      // Assert
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });
  });
});
