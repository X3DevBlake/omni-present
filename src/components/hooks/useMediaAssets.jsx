/**
 * useMediaAssets Hook
 * Manages media assets from various sources
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useMediaAssets(userEmail) {
  return useQuery({
    queryKey: ['mediaAssets', userEmail],
    queryFn: () => base44.entities.MediaAsset.filter({ user_email: userEmail })
  });
}

export function useMediaAssetsByEntity(entityId, entityType) {
  return useQuery({
    queryKey: ['mediaAssets', entityId],
    queryFn: () => base44.entities.MediaAsset.filter({
      associated_entity_id: entityId,
      associated_entity_type: entityType
    })
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userEmail, file, title, description, tags, entityId, entityType }) => {
      const response = await fetch('/api/functions/process-media-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          file,
          title,
          description,
          tags,
          associated_entity_id: entityId,
          associated_entity_type: entityType
        })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets', variables.userEmail] });
    }
  });
}

export function useFetchStockMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userEmail, query, mediaType = 'image', count = 5 }) => {
      const response = await fetch('/api/functions/fetch-stock-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, query, mediaType, count })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets', variables.userEmail] });
    }
  });
}

export function useDeleteMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId) => base44.entities.MediaAsset.delete(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
    }
  });
}