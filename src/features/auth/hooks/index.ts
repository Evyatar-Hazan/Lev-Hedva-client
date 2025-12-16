import { useAuth } from '../AuthContext';
import { LoginDto } from '../../../lib/types';

export function useLogin() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials: LoginDto) => {
    return login(credentials.email, credentials.password);
  };

  return {
    login: handleLogin,
    isLoading,
    error,
  };
}

export function useLogout() {
  const { logout, isLoading } = useAuth();

  return {
    logout,
    isLoading,
  };
}

export { useAuth } from '../AuthContext';
