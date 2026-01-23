import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function AdaptiveHologramManager({ 
  pageContext, 
  userData,
  children 
}) {
  const queryClient = useQueryClient();

  const createProjectionMutation = useMutation({
    mutationFn: async (projectionData) => {
      const response = await base44.functions.invoke('holographicProjectionEngine', {
        action: 'create_projection',
        projection_data: projectionData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holographic-projections'] });
    }
  });

  useEffect(() => {
    // Auto-create contextual holograms based on page
    if (pageContext?.key_metrics) {
      Object.entries(pageContext.key_metrics).forEach(([metric, value], idx) => {
        createProjectionMutation.mutate({
          content_type: 'data_visualization',
          data: { metric, value },
          context: { page: pageContext.page_name },
          spatial_anchor: {
            x: idx * 2 - 3,
            y: 2,
            z: -5
          },
          entity_type: 'metric',
          entity_id: metric,
          realtime: true,
          persistence: 'session',
          visible_to: [userData?.id]
        });
      });
    }
  }, [pageContext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}