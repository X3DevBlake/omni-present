/**
 * useLocationData Hook
 * Manages geospatial data and location queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useLocationData() {
  return useQuery({
    queryKey: ['locationData'],
    queryFn: () => base44.entities.LocationData.list()
  });
}

export function useLocationsByType(locationType) {
  return useQuery({
    queryKey: ['locationData', locationType],
    queryFn: () => base44.entities.LocationData.filter({ location_type: locationType })
  });
}

export function useFetchGeospatialData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ locations, mapType = 'satellite' }) => {
      const response = await fetch('/api/functions/fetch-geospatial-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, mapType, includeTerrainData: true })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locationData'] });
    }
  });
}

export function useCreateLocationData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationData) => base44.entities.LocationData.create(locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locationData'] });
    }
  });
}