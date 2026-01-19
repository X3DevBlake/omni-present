import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle, Lightbulb, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import AnomalyDetection3D from './AnomalyDetection3D';

export default function ProactiveAnomalyPanel() {
  const queryClient = useQueryClient();
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const detectAnomalies = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detectProactiveAnomalies', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-anomalies'] });
    },
  });

  const { data: anomalies } = useQuery({
    queryKey: ['analytics-anomalies'],
    queryFn: async () => {
      const result = await base44.entities.ProactiveAlert.filter({ status: 'active' });
      return result;
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Proactive Anomaly Detection
              </CardTitle>
              <Button
                onClick={() => detectAnomalies.mutate()}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Scan Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies?.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAnomaly(anomaly)}
                  className="bg-white/5 rounded-lg p-4 border border-orange-500/30 cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{anomaly.alert_type}</h4>
                    <Badge className="bg-orange-500/20 text-orange-400 border-0">
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{anomaly.description}</p>
                  
                  {anomaly.suggested_action && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <p className="text-cyan-200 text-xs">{anomaly.suggested_action}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {!anomalies?.length && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white/60">No anomalies detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Anomaly Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <AnomalyDetection3D anomalies={anomalies || []} selected={selectedAnomaly} />
        </CardContent>
      </Card>
    </div>
  );
}