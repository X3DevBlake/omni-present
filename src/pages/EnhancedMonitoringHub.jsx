import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import RealTimeAnomalyDetector3D from '@/components/analytics/RealTimeAnomalyDetector3D';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function EnhancedMonitoringHub() {
  const queryClient = useQueryClient();

  const { data: dataStreams = [] } = useQuery({
    queryKey: ['data-streams'],
    queryFn: () => base44.entities.RealTimeDataStream.list()
  });

  const detectAnomalyMutation = useMutation({
    mutationFn: async (streamName) => {
      const response = await base44.functions.invoke('detectRealTimeAnomaly', {
        stream_name: streamName,
        threshold_multiplier: 2
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['data-streams']);
    }
  });

  const activeStreams = dataStreams.filter(s => s.is_active).length;
  const anomalyStreams = dataStreams.filter(s => s.anomaly_detected).length;
  const avgQuality = dataStreams.length > 0
    ? dataStreams.reduce((sum, s) => sum + (s.data_quality_score || 0), 0) / dataStreams.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Activity className="w-12 h-12 text-cyan-400" />
            Real-Time Monitoring Hub
          </h1>
          <p className="text-xl text-gray-300">
            Monitor data streams and detect anomalies in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Streams</p>
                  <p className="text-3xl font-bold text-white">{activeStreams}</p>
                </div>
                <Zap className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Anomalies</p>
                  <p className="text-3xl font-bold text-white">{anomalyStreams}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Data Quality</p>
                  <p className="text-3xl font-bold text-white">{avgQuality.toFixed(0)}%</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="3d">3D Anomaly View</TabsTrigger>
            <TabsTrigger value="streams">Data Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <RealTimeAnomalyDetector3D streams={dataStreams} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams">
            <div className="space-y-3">
              {dataStreams.map((stream) => (
                <Card key={stream.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{stream.stream_name}</h3>
                          <Badge className={stream.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                            {stream.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {stream.anomaly_detected && (
                            <Badge className="bg-red-600">Anomaly</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          <p>Type: {stream.stream_type}</p>
                          <p>Quality: {stream.data_quality_score?.toFixed(0)}%</p>
                          <p>Update Frequency: {stream.update_frequency_ms}ms</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => detectAnomalyMutation.mutate(stream.stream_name)}
                        disabled={detectAnomalyMutation.isPending}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Scan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}