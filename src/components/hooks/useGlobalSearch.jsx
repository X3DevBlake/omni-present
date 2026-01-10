import { useMutation } from '@tanstack/react-query';

export function useGlobalSearch() {
  return useMutation({
    mutationFn: async (params) => {
      const response = await fetch('/api/functions/search/global-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.results;
    }
  });
}