import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import SecurityEvents3D from '@/components/security/SecurityEvents3D';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function EnhancedSecurityHub() {
  const queryClient = useQueryClient();

  const { data: securityEvents = [], isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 50)
  });

  const detectThreatMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await base44.functions.invoke('detectThreat', { event_data: eventData });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['security-events']);
    }
  });

  const activeThreats = securityEvents.filter(e => e.status === 'detected' || e.status === 'investigating');
  const criticalThreats = securityEvents.filter(e => e.severity === 'critical');
  const mitigatedThreats = securityEvents.filter(e => e.status === 'mitigated' || e.status === 'resolved');
  const avgThreatScore = securityEvents.length > 0
    ? securityEvents.reduce((sum, e) => sum + (e.ai_threat_score || 0), 0) / securityEvents.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Shield className="w-12 h-12 text-cyan-400" />
            Enhanced Security Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered threat detection and security monitoring
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Threats</p>
                  <p className="text-3xl font-bold text-white">{activeThreats.length}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Critical</p>
                  <p className="text-3xl font-bold text-white">{criticalThreats.length}</p>
                </div>
                <Shield className="w-10 h-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Mitigated</p>
                  <p className="text-3xl font-bold text-white">{mitigatedThreats.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Threat Score</p>
                  <p className="text-3xl font-bold text-white">{avgThreatScore.toFixed(0)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="3d">3D Threat Landscape</TabsTrigger>
            <TabsTrigger value="events">Event Log</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <SecurityEvents3D events={securityEvents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <Card key={event.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            event.severity === 'critical' ? 'bg-red-600' :
                            event.severity === 'high' ? 'bg-orange-600' :
                            event.severity === 'medium' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <h3 className="text-white font-semibold">
                            {event.event_type.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <Badge variant="outline" className="text-gray-400">
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Source IP: {event.source_ip || 'Unknown'}</p>
                          <p>Target: {event.target_resource || 'Unknown'}</p>
                          <p>Threat Score: {event.ai_threat_score?.toFixed(0) || 0}%</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Events</p>
                      <p className="text-3xl font-bold text-white">{securityEvents.length}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Response Rate</p>
                      <p className="text-3xl font-bold text-green-400">
                        {securityEvents.length > 0 ? ((mitigatedThreats.length / securityEvents.length) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}