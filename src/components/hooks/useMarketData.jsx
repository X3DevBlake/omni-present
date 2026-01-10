/**
 * useMarketData Hook
 * Fetches real-time stock and financial market data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useMarketAssets(symbols) {
  return useQuery({
    queryKey: ['marketAssets', symbols],
    queryFn: () => base44.entities.MarketAsset.list()
  });
}

export function useFetchMarketData(symbols = ['AAPL', 'MSFT', 'GOOGL']) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/fetch-financial-market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, includeNews: true })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketAssets'] });
    }
  });
}

export function useMarketAssetDetail(symbol) {
  return useQuery({
    queryKey: ['marketAsset', symbol],
    queryFn: async () => {
      const results = await base44.entities.MarketAsset.filter({ symbol });
      return results[0] || null;
    }
  });
}