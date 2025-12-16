import axios from 'axios';
import { TokenManager } from './tokenManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  config => {
    const token = TokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging for API requests
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📦 Request Data:', config.data);
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${
        response.status
      }`
    );
    console.log('📄 Response Data:', response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${
          error.response.status
        }`
      );
      console.error('📄 Error Data:', error.response.data);
    } else if (error.request) {
      console.error('🔌 Network Error - No response received:', error.message);
      console.error('🌐 Check if server is running on:', API_BASE_URL);
    } else {
      console.error('⚠️ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
