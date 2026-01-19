import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle, Lightbulb, Play, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ProactiveAnomalyDetector() {
  const queryClient = useQueryClient();

  const { data: anomalies } = useQuery({
    queryKey: ['proactive-anomalies'],
    queryFn: async () => {
      const alerts = await base44.entities.ProactiveAlert.filter({ status: 'active' });
      return alerts;
    },
    refetchInterval: 10000,
  });

  const applySolution = useMutation({
    mutationFn: async (solution) => {
      await base44.entities.ProactiveAlert.update(solution.alert_id, {
        status: 'resolved',
        solution_applied: solution.description,
      });
      return solution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-anomalies'] });
    },
  });

  const dismissAnomaly = useMutation({
    mutationFn: async (alertId) => {
      await base44.entities.ProactiveAlert.update(alertId, {
        status: 'dismissed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-anomalies'] });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Active Anomalies & AI-Proposed Solutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 mb-4">
            AI agents autonomously monitor system performance and propose solutions for detected issues.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {anomalies?.map((anomaly, index) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">{anomaly.alert_type}</h3>
                      <Badge className="bg-orange-500/20 text-orange-400 border-0">
                        {anomaly.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-white/80 mb-3">{anomaly.description}</p>
                    
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-white font-medium">AI-Proposed Solution</h4>
                      </div>
                      <p className="text-white/70 text-sm mb-3">
                        {anomaly.suggested_action || 'Optimize query patterns and implement caching layer to reduce response time by 35%'}
                      </p>
                      
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3 mb-3">
                        <p className="text-cyan-200 text-xs">
                          <strong>Estimated Impact:</strong> {anomaly.estimated_impact || '+35% performance, -40% latency'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => applySolution.mutate({
                            alert_id: anomaly.id,
                            description: anomaly.suggested_action
                          })}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Apply Solution
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissAnomaly.mutate(anomaly.id)}
                          className="border-white/10"
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {!anomalies?.length && (
          <Card className="bg-black/40 border-white/10">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">All Systems Optimal</h3>
              <p className="text-white/60">No anomalies detected. AI agents are monitoring continuously.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}