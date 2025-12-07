import { apiClient } from '../axios';
import { 
  AuditLog,
  AuditLogResponseDto,
  CreateAuditLogDto, 
  AuditLogsQueryDto, 
  PaginatedResponse
} from '../../lib/types';

export class AuditClient {
  private static readonly BASE_PATH = '/audit';

  static async getAuditLogs(query?: AuditLogsQueryDto): Promise<PaginatedResponse<AuditLogResponseDto>> {
    const params = new URLSearchParams();
    
    if (query) {
      (Object.keys(query) as Array<keyof AuditLogsQueryDto>).forEach((key) => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<AuditLogResponseDto>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  static async getAuditLogById(id: string): Promise<AuditLogResponseDto> {
    const response = await apiClient.get<AuditLogResponseDto>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createAuditLog(auditData: CreateAuditLogDto): Promise<AuditLog> {
    const response = await apiClient.post<AuditLog>(this.BASE_PATH, auditData);
    return response.data;
  }

  static async getAuditStats(): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByEntity: Record<string, number>;
    logsByUser: Record<string, number>;
    recentActivity: AuditLogResponseDto[];
  }> {
    const response = await apiClient.get<{
      totalLogs: number;
      logsByAction: Record<string, number>;
      logsByEntity: Record<string, number>;
      logsByUser: Record<string, number>;
      recentActivity: AuditLogResponseDto[];
    }>(`${this.BASE_PATH}/stats`);
    return response.data;
  }

  static async getUserActivity(userId: string, dateFrom?: string, dateTo?: string): Promise<AuditLogResponseDto[]> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await apiClient.get<AuditLogResponseDto[]>(
      `${this.BASE_PATH}/user/${userId}?${params.toString()}`
    );
    return response.data;
  }
}