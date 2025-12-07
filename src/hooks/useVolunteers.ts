import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VolunteersClient } from '../api/clients/volunteers.client';
import { 
  VolunteerActivity, 
  CreateVolunteerActivityDto, 
  UpdateVolunteerActivityDto, 
  VolunteerActivitiesQueryDto 
} from '../lib/types';

const VOLUNTEER_ACTIVITIES_QUERY_KEY = ['volunteer-activities'];
const VOLUNTEER_STATS_QUERY_KEY = ['volunteer-stats'];

// Hook לקבלת רשימת פעילויות התנדבותיות
export const useVolunteerActivities = (params?: VolunteerActivitiesQueryDto) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, params],
    queryFn: () => VolunteersClient.getActivities(params),
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};

// Hook לקבלת פעילות התנדבותית בודדת
export const useVolunteerActivity = (id: string) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, id],
    queryFn: () => VolunteersClient.getActivityById(id),
    enabled: !!id,
  });
};

// Hook ליצירת פעילות התנדבותית חדשה
export const useCreateVolunteerActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityData: CreateVolunteerActivityDto) => 
      VolunteersClient.createActivity(activityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_ACTIVITIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_STATS_QUERY_KEY });
    },
  });
};

// Hook לעדכון פעילות התנדבותית
export const useUpdateVolunteerActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activityData }: { id: string; activityData: UpdateVolunteerActivityDto }) => 
      VolunteersClient.updateActivity(id, activityData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_ACTIVITIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_STATS_QUERY_KEY });
    },
  });
};

// Hook למחיקת פעילות התנדבותית
export const useDeleteVolunteerActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => VolunteersClient.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_ACTIVITIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_STATS_QUERY_KEY });
    },
  });
};

// Hook לקבלת סטטיסטיקות כלליות של התנדבות
export const useVolunteerStats = () => {
  return useQuery({
    queryKey: [...VOLUNTEER_STATS_QUERY_KEY, 'general'],
    queryFn: () => VolunteersClient.getVolunteerStats(),
    staleTime: 10 * 60 * 1000, // 10 דקות
  });
};

// Hook לקבלת סטטיסטיקות של מתנדב מסוים
export const useVolunteerStatsByUser = (volunteerId: string) => {
  return useQuery({
    queryKey: [...VOLUNTEER_STATS_QUERY_KEY, 'user', volunteerId],
    queryFn: () => VolunteersClient.getVolunteerStats(volunteerId),
    enabled: !!volunteerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook לקבלת דוח מתנדב
export const useVolunteerReport = (
  volunteerId: string, 
  dateFrom?: string, 
  dateTo?: string
) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, 'report', volunteerId, dateFrom, dateTo],
    queryFn: () => VolunteersClient.getVolunteerReport(volunteerId, dateFrom, dateTo),
    enabled: !!volunteerId,
    staleTime: 2 * 60 * 1000,
  });
};