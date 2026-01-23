import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const HolographicContext = createContext({
  projectionsEnabled: true,
  activeProjections: [],
  toggleProjections: () => {},
  createProjection: () => {},
  updateProjection: () => {}
});

export const useHolographic = () => useContext(HolographicContext);

export function HolographicProvider({ children }) {
  const [projectionsEnabled, setProjectionsEnabled] = useState(true);

  const { data: activeProjections = [] } = useQuery({
    queryKey: ['active-projections'],
    queryFn: async () => {
      const response = await base44.functions.invoke('holographicProjectionEngine', {
        action: 'query_projections',
        projection_data: {}
      });
      return response.data.projections || [];
    },
    refetchInterval: 2000,
    enabled: projectionsEnabled
  });

  const createProjection = async (data) => {
    try {
      const response = await base44.functions.invoke('holographicProjectionEngine', {
        action: 'create_projection',
        projection_data: data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create projection:', error);
      return null;
    }
  };

  const updateProjection = async (projectionId, updates) => {
    try {
      const response = await base44.functions.invoke('holographicProjectionEngine', {
        action: 'update_projection',
        projection_data: { projection_id: projectionId, updates }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update projection:', error);
      return null;
    }
  };

  const value = {
    projectionsEnabled,
    activeProjections,
    toggleProjections: () => setProjectionsEnabled(!projectionsEnabled),
    createProjection,
    updateProjection
  };

  return (
    <HolographicContext.Provider value={value}>
      {children}
    </HolographicContext.Provider>
  );
}