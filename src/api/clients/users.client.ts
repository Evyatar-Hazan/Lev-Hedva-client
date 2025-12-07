import { apiClient } from '../axios';
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  UsersQueryDto, 
  PaginatedResponse, 
  ApiResponse,
  UserPermission
} from '../../lib/types';

export class UsersClient {
  private static readonly BASE_PATH = '/users';

  static async getUsers(query?: UsersQueryDto): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (query) {
      (Object.keys(query) as Array<keyof UsersQueryDto>).forEach((key) => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<User>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createUser(userData: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>(this.BASE_PATH, userData);
    return response.data;
  }

  static async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`${this.BASE_PATH}/${id}`, userData);
    return response.data;
  }

  static async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async getUserPermissions(id: string): Promise<UserPermission[]> {
    const response = await apiClient.get<UserPermission[]>(`${this.BASE_PATH}/${id}/permissions`);
    return response.data;
  }

  static async assignPermission(userId: string, permissionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${this.BASE_PATH}/${userId}/permissions`,
      { permissionId }
    );
    return response.data;
  }

  static async revokePermission(userId: string, permissionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${this.BASE_PATH}/${userId}/permissions/${permissionId}`
    );
    return response.data;
  }
}