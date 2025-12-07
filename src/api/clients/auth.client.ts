import { apiClient } from '../axios';
import { TokenManager } from '../tokenManager';
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  RefreshTokenDto,
  ApiResponse 
} from '../../lib/types';

export class AuthClient {
  private static readonly BASE_PATH = '/auth';

  static async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(
      `${this.BASE_PATH}/login`,
      credentials
    );
    return response.data;
  }

  static async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(
      `${this.BASE_PATH}/register`,
      userData
    );
    return response.data;
  }

  static async refresh(refreshData: RefreshTokenDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(
      `${this.BASE_PATH}/refresh`,
      refreshData
    );
    return response.data;
  }

  static async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${this.BASE_PATH}/logout`
    );
    return response.data;
  }

  static async getProfile(): Promise<AuthResponseDto['user']> {
    const response = await apiClient.get<AuthResponseDto['user']>(
      `${this.BASE_PATH}/profile`
    );
    return response.data;
  }
}