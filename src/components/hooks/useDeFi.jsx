/**
 * useDeFi Hook
 * Manages DeFi data and operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useLiquidityPools() {
  return useQuery({
    queryKey: ['liquidityPools'],
    queryFn: () => base44.entities.LiquidityPool.list()
  });
}

export function useUserDeposits(userEmail) {
  return useQuery({
    queryKey: ['userDeposits', userEmail],
    queryFn: () => base44.entities.UserDeposit.filter({ user_email: userEmail })
  });
}

export function useDAOProposals() {
  return useQuery({
    queryKey: ['daoProposals'],
    queryFn: () => base44.entities.DAOProposal.list()
  });
}

export function useSyncBlockchainData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/sync-blockchain-data', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidityPools'] });
      queryClient.invalidateQueries({ queryKey: ['daoProposals'] });
    }
  });
}

export function useDepositToPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deposit) => base44.entities.UserDeposit.create(deposit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDeposits'] });
    }
  });
}

export function useStake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stake) => base44.entities.Stake.create(stake),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakes'] });
    }
  });
}