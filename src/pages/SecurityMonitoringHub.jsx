import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, Activity, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import SecurityEvents3D from '../components/security/SecurityEvents3D';

export default function SecurityMonitoringHub() {
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 50),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  const detectThreats = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detectSecurityThreats', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    }
  });

  const criticalEvents = events?.filter(e => e.severity === 'critical').length || 0;
  const activeThreats = events?.filter(e => e.status === 'detected' || e.status === 'investigating').length || 0;
  const resolvedToday = events?.filter(e => e.status === 'resolved').length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Security Monitoring Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered threat detection, real-time monitoring, and 3D security visualization
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-white text-2xl font-bold">{criticalEvents}</p>
            <p className="text-white/60 text-sm">Critical Events</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30 p-4">
            <Activity className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{activeThreats}</p>
            <p className="text-white/60 text-sm">Active Threats</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <Shield className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{resolvedToday}</p>
            <p className="text-white/60 text-sm">Resolved Today</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Eye className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{auditLogs?.length || 0}</p>
            <p className="text-white/60 text-sm">Audit Logs</p>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="detect">Threat Detection</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="visualize">3D Visualizer</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-4">
              {events?.map((event) => (
                <Card key={event.id} className={`border-2 ${
                  event.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                  event.severity === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
                  event.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                  'bg-cyan-500/10 border-cyan-500/50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            event.severity === 'critical' ? 'bg-red-500' :
                            event.severity === 'high' ? 'bg-orange-500' :
                            event.severity === 'medium' ? 'bg-yellow-500' : 'bg-cyan-500'
                          }>
                            {event.severity?.toUpperCase()}
                          </Badge>
                          <Badge className="bg-purple-500/20">{event.event_type}</Badge>
                          <Badge className={
                            event.status === 'resolved' ? 'bg-green-500' :
                            event.status === 'mitigated' ? 'bg-cyan-500' : 'bg-orange-500'
                          }>
                            {event.status}
                          </Badge>
                        </div>
                        <h3 className="text-white font-bold text-lg">{event.target_resource}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm mb-1">Threat Score</div>
                        <div className={`text-2xl font-bold ${
                          event.ai_threat_score > 80 ? 'text-red-400' :
                          event.ai_threat_score > 50 ? 'text-orange-400' : 'text-yellow-400'
                        }`}>
                          {event.ai_threat_score?.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {event.source_ip && (
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Source IP</div>
                          <div className="text-white font-mono text-sm">{event.source_ip}</div>
                        </div>
                      )}
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Detection Method</div>
                        <div className="text-cyan-400 text-sm">{event.detection_method}</div>
                      </div>
                    </div>
                    {event.automated_response && (
                      <div className="bg-cyan-500/20 border border-cyan-500/30 rounded p-3">
                        <div className="text-cyan-300 text-sm mb-1">Automated Response:</div>
                        <div className="text-white/70 text-sm">
                          {event.automated_response.action_taken}
                        </div>
                        <Badge className={event.automated_response.success ? 'bg-green-500 mt-2' : 'bg-red-500 mt-2'}>
                          {event.automated_response.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detect">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">AI Threat Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/60">
                  Run AI-powered analysis on recent system activity to detect potential security threats.
                </p>
                <Button
                  onClick={() => detectThreats.mutate()}
                  disabled={detectThreats.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600"
                >
                  Run Threat Detection
                </Button>
              </CardContent>
            </Card>

            {detectThreats.data && (
              <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30">
                <CardContent className="p-6">
                  <h3 className="text-red-300 font-bold mb-4">Detection Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Threats Detected</div>
                      <div className="text-red-400 text-2xl font-bold">
                        {detectThreats.data.threats_detected}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Events Created</div>
                      <div className="text-orange-400 font-bold">
                        {detectThreats.data.events?.length || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-3">
              {auditLogs?.slice(0, 20).map((log) => (
                <Card key={log.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-cyan-500">{log.action_type}</Badge>
                        <span className="text-white text-sm">{log.user_id}</span>
                      </div>
                      <span className="text-white/60 text-xs">
                        {new Date(log.created_date).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualize">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Security Events 3D Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityEvents3D events={events} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}