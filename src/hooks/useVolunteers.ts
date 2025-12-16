import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VolunteersClient } from '../api/clients/volunteers.client';
import {
  CreateVolunteerActivityDto,
  UpdateVolunteerActivityDto,
  VolunteerActivitiesQueryDto,
} from '../lib/types';

const VOLUNTEER_ACTIVITIES_QUERY_KEY = ['volunteer-activities'];
const VOLUNTEER_STATS_QUERY_KEY = ['volunteer-stats'];

// Hook to get list of volunteer activities
export const useVolunteerActivities = (params?: VolunteerActivitiesQueryDto) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, params],
    queryFn: () => VolunteersClient.getActivities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get single volunteer activity
export const useVolunteerActivity = (id: string) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, id],
    queryFn: () => VolunteersClient.getActivityById(id),
    enabled: !!id,
  });
};

// Hook to create new volunteer activity
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

// Hook to update volunteer activity
export const useUpdateVolunteerActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activityData }: { id: string; activityData: UpdateVolunteerActivityDto }) =>
      VolunteersClient.updateActivity(id, activityData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_ACTIVITIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: VOLUNTEER_STATS_QUERY_KEY });
    },
  });
};

// Hook to delete volunteer activity
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

// Hook to get general volunteer statistics
export const useVolunteerStats = () => {
  return useQuery({
    queryKey: [...VOLUNTEER_STATS_QUERY_KEY, 'general'],
    queryFn: () => VolunteersClient.getVolunteerStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get statistics for specific volunteer
export const useVolunteerStatsByUser = (volunteerId: string) => {
  return useQuery({
    queryKey: [...VOLUNTEER_STATS_QUERY_KEY, 'user', volunteerId],
    queryFn: () => VolunteersClient.getVolunteerStats(volunteerId),
    enabled: !!volunteerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get volunteer report
export const useVolunteerReport = (volunteerId: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: [...VOLUNTEER_ACTIVITIES_QUERY_KEY, 'report', volunteerId, dateFrom, dateTo],
    queryFn: () => VolunteersClient.getVolunteerReport(volunteerId, dateFrom, dateTo),
    enabled: !!volunteerId,
    staleTime: 2 * 60 * 1000,
  });
};
