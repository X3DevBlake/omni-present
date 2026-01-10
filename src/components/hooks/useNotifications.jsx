import { useQuery } from '@tanstack/react-query';

export function useNotifications(userEmail) {
  return useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/functions/analytics/get-user-notifications?userEmail=${userEmail}&limit=20`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
}