import { useQuery } from '@tanstack/react-query';

export function useAgentKPIs(userEmail, limit = 5) {
  return useQuery({
    queryKey: ['agentKpis', userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/functions/analytics/get-agent-kpis?userEmail=${userEmail}&limit=${limit}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    }
  });
}

export function useAgentKPI(userEmail, agentId) {
  return useQuery({
    queryKey: ['agentKpi', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/functions/analytics/get-agent-kpis?userEmail=${userEmail}&agentId=${agentId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.kpis[0];
    },
    enabled: !!agentId
  });
}