import { useQuery } from '@tanstack/react-query';

export function useGoalProgress(userEmail) {
  return useQuery({
    queryKey: ['goalProgress', userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/functions/analytics/get-goal-progress?userEmail=${userEmail}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    }
  });
}

export function useSingleGoalProgress(userEmail, goalId) {
  return useQuery({
    queryKey: ['goalProgress', goalId],
    queryFn: async () => {
      const response = await fetch(`/api/functions/analytics/get-goal-progress?userEmail=${userEmail}&goalId=${goalId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.goals[0];
    },
    enabled: !!goalId
  });
}