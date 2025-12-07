// 🧪 Unit Tests for API Client - Axios Configuration
import { apiClient } from '../axios';
import { TokenManager } from '../tokenManager';

// Mock TokenManager
jest.mock('../tokenManager', () => ({
  TokenManager: {
    getAccessToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

// Mock axios
jest.mock('axios');

describe('🔗 API Client Tests', () => {
  const mockTokenManager = TokenManager as jest.Mocked<typeof TokenManager>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('📡 Request Interceptor', () => {
    
    test('should add Authorization header when token exists', async () => {
      // Arrange
      const mockToken = 'test-jwt-token';
      mockTokenManager.getAccessToken.mockReturnValue(mockToken);
      
      const mockConfig = {
        method: 'GET',
        url: '/test',
        headers: {},
      };

      // Act
      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(mockConfig);

      // Assert
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(console.log).toHaveBeenCalledWith('🚀 API Request: GET /test');
    });

    test('should not add Authorization header when no token', async () => {
      // Arrange
      mockTokenManager.getAccessToken.mockReturnValue(null);
      
      const mockConfig = {
        method: 'POST',
        url: '/auth/login',
        headers: {},
      };

      // Act
      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(mockConfig);

      // Assert
      expect(result.headers.Authorization).toBeUndefined();
    });

    test('should log request data when present', async () => {
      // Arrange
      const mockConfig = {
        method: 'POST',
        url: '/users',
        headers: {},
        data: { name: 'Test User', email: 'test@example.com' },
      };

      // Act
      const interceptor = apiClient.interceptors.request.handlers[0];
      interceptor.fulfilled(mockConfig);

      // Assert
      expect(console.log).toHaveBeenCalledWith('🚀 API Request: POST /users');
      expect(console.log).toHaveBeenCalledWith('📦 Request Data:', mockConfig.data);
    });
  });

  describe('📥 Response Interceptor', () => {
    
    test('should log successful responses', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        data: { success: true },
        config: { method: 'GET', url: '/users' },
      };

      // Act
      const interceptor = apiClient.interceptors.response.handlers[0];
      const result = interceptor.fulfilled(mockResponse);

      // Assert
      expect(result).toBe(mockResponse);
      expect(console.log).toHaveBeenCalledWith('✅ API Response: GET /users - 200');
      expect(console.log).toHaveBeenCalledWith('📄 Response Data:', mockResponse.data);
    });

    test('should handle network errors', async () => {
      // Arrange
      const mockError = {
        message: 'Network Error',
        request: {},
        config: { method: 'GET', url: '/users' },
      };

      // Act & Assert
      const interceptor = apiClient.interceptors.response.handlers[0];
      await expect(interceptor.rejected(mockError)).rejects.toBe(mockError);
      
      expect(console.error).toHaveBeenCalledWith('🔌 Network Error - No response received:', mockError.message);
      expect(console.error).toHaveBeenCalledWith('🌐 Check if server is running on:', expect.any(String));
    });

    test('should handle HTTP errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: { method: 'GET', url: '/protected' },
      };

      // Act & Assert
      const interceptor = apiClient.interceptors.response.handlers[0];
      await expect(interceptor.rejected(mockError)).rejects.toBe(mockError);
      
      expect(console.error).toHaveBeenCalledWith('❌ API Error: GET /protected - 401');
      expect(console.error).toHaveBeenCalledWith('📄 Error Data:', mockError.response.data);
    });
  });

  describe('⚙️ Configuration', () => {
    
    test('should use correct base URL from environment', () => {
      expect(apiClient.defaults.baseURL).toBe(process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
    });

    test('should have correct timeout', () => {
      expect(apiClient.defaults.timeout).toBe(10000);
    });

    test('should have correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});