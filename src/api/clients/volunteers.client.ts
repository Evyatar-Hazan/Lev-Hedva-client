import { apiClient } from '../axios';
import {
  VolunteerActivity,
  CreateVolunteerActivityDto,
  UpdateVolunteerActivityDto,
  VolunteerActivitiesQueryDto,
  PaginatedResponse,
  ApiResponse,
} from '../../lib/types';

export class VolunteersClient {
  private static readonly BASE_PATH = '/volunteers';

  static async getActivities(
    query?: VolunteerActivitiesQueryDto
  ): Promise<PaginatedResponse<VolunteerActivity>> {
    const params = new URLSearchParams();

    if (query) {
      (Object.keys(query) as Array<keyof VolunteerActivitiesQueryDto>).forEach(key => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<VolunteerActivity>>(
      `${this.BASE_PATH}/activities?${params.toString()}`
    );
    return response.data;
  }

  static async getActivityById(id: string): Promise<VolunteerActivity> {
    const response = await apiClient.get<VolunteerActivity>(`${this.BASE_PATH}/activities/${id}`);
    return response.data;
  }

  static async createActivity(
    activityData: CreateVolunteerActivityDto
  ): Promise<VolunteerActivity> {
    const response = await apiClient.post<VolunteerActivity>(
      `${this.BASE_PATH}/activities`,
      activityData
    );
    return response.data;
  }

  static async updateActivity(
    id: string,
    activityData: UpdateVolunteerActivityDto
  ): Promise<VolunteerActivity> {
    const response = await apiClient.put<VolunteerActivity>(
      `${this.BASE_PATH}/activities/${id}`,
      activityData
    );
    return response.data;
  }

  static async deleteActivity(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${this.BASE_PATH}/activities/${id}`
    );
    return response.data;
  }

  static async getVolunteerStats(volunteerId?: string): Promise<{
    totalHours: number;
    activitiesCount: number;
    averageHoursPerActivity: number;
    activitiesByType: Record<string, number>;
  }> {
    const path = volunteerId ? `${this.BASE_PATH}/${volunteerId}/stats` : `${this.BASE_PATH}/stats`;

    const response = await apiClient.get<{
      totalHours: number;
      activitiesCount: number;
      averageHoursPerActivity: number;
      activitiesByType: Record<string, number>;
    }>(path);
    return response.data;
  }

  static async getVolunteerReport(
    volunteerId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    volunteer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    totalHours: number;
    activities: VolunteerActivity[];
  }> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await apiClient.get<{
      volunteer: {
        id: string;
        firstName: string;
        lastName: string;
      };
      totalHours: number;
      activities: VolunteerActivity[];
    }>(`${this.BASE_PATH}/${volunteerId}/report?${params.toString()}`);
    return response.data;
  }
}
