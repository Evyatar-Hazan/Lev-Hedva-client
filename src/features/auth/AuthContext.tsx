import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthResponseDto } from '../../lib/types';
import { AuthClient, TokenManager } from '../../api';

interface AuthState {
  user: AuthResponseDto['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthResponseDto['user'] }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = TokenManager.getAccessToken();

      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      // Check if token is expired
      if (TokenManager.isTokenExpired(token)) {
        const refreshToken = TokenManager.getRefreshToken();

        if (!refreshToken) {
          TokenManager.clearTokens();
          dispatch({ type: 'AUTH_LOGOUT' });
          return;
        }

        try {
          dispatch({ type: 'AUTH_START' });
          const response = await AuthClient.refresh({ refreshToken });
          TokenManager.setTokens(response.accessToken, response.refreshToken);
          dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        } catch (error) {
          TokenManager.clearTokens();
          dispatch({ type: 'AUTH_ERROR', payload: 'חזרה לאפליקציה נכשלה' });
        }
      } else {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await AuthClient.getProfile();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          TokenManager.clearTokens();
          dispatch({ type: 'AUTH_ERROR', payload: 'טעינת פרופיל המשתמש נכשלה' });
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthClient.login({ email, password });
      TokenManager.setTokens(response.accessToken, response.refreshToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'התחברות נכשלה';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthClient.logout();
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
