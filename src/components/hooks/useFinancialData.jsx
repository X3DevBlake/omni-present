/**
 * useFinancialData Hook
 * Fetches and manages financial data for all visualizations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useTransactions(userEmail) {
  return useQuery({
    queryKey: ['transactions', userEmail],
    queryFn: () => base44.entities.FinancialTransaction.filter({ user_email: userEmail })
  });
}

export function useGoals(userEmail) {
  return useQuery({
    queryKey: ['goals', userEmail],
    queryFn: () => base44.entities.FinancialGoal.filter({ user_email: userEmail })
  });
}

export function useBudgets(userEmail) {
  return useQuery({
    queryKey: ['budgets', userEmail],
    queryFn: () => base44.entities.Budget.filter({ user_email: userEmail })
  });
}

export function useMarketData(assets = ['ETH', 'BTC']) {
  return useQuery({
    queryKey: ['marketData', assets],
    queryFn: async () => {
      const response = await fetch('/api/functions/fetch-market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets })
      });
      return response.json();
    },
    refetchInterval: 60000
  });
}

export function useCryptoAssets() {
  return useQuery({
    queryKey: ['cryptoAssets'],
    queryFn: () => base44.entities.CryptoAsset.list()
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaction) => base44.entities.FinancialTransaction.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal) => base44.entities.FinancialGoal.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}

export function useDashboardMetrics(userEmail) {
  return useQuery({
    queryKey: ['dashboardMetrics', userEmail],
    queryFn: async () => {
      const response = await fetch('/api/functions/calculate-dashboard-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      return response.json();
    }
  });
}