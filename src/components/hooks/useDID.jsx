/**
 * useDID Hook
 * Manages decentralized identity operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useCredentials(userEmail) {
  return useQuery({
    queryKey: ['credentials', userEmail],
    queryFn: () => base44.entities.Credential.filter({ user_email: userEmail })
  });
}

export function usePermissions(userEmail) {
  return useQuery({
    queryKey: ['permissions', userEmail],
    queryFn: () => base44.entities.Permission.filter({ user_email: userEmail })
  });
}

export function useVerifyCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userEmail, credentialType, credentialData, proof }) => {
      const response = await fetch('/api/functions/verify-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, credentialType, credentialData, proof })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    }
  });
}

export function useGrantPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permission) => base44.entities.Permission.create(permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    }
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ permissionId }) => 
      base44.entities.Permission.update(permissionId, { revoked: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    }
  });
}