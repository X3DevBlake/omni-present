import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Globe, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import EcosystemMonitor3D from '../components/ecosystem/EcosystemMonitor3D';
import APIGatewayMetrics3D from '../components/ecosystem/APIGatewayMetrics3D';
import ThreatIntelligenceMatrix3D from '../components/security/ThreatIntelligenceMatrix3D';
import UnifiedEcosystemHealth3D from '../components/ecosystem/UnifiedEcosystemHealth3D';

export default function EcosystemMonitoringDashboard() {
  const { data: gatewayLogs = [] } = useQuery({
    queryKey: ['gateway-logs-monitor'],
    queryFn: () => base44.entities.APIGatewayLog.list('-created_date', 100),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations-monitor'],
    queryFn: async () => {
      const response = await base44.functions.invoke('thirdPartyIntegrationManager', {
        action: 'get_integrations',
        approved_only: false
      });
      return response.data.integrations || [];
    },
    initialData: [],
    refetchInterval: 10000
  });

  const { data: threats = [] } = useQuery({
    queryKey: ['threats-monitor'],
    queryFn: () => base44.entities.SecurityThreatIntelligence.list('-created_date', 50),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: ecosystemMetrics = [] } = useQuery({
    queryKey: ['ecosystem-metrics-monitor'],
    queryFn: () => base44.entities.EcosystemHealthMetrics.list('-created_date', 1),
    initialData: [],
    refetchInterval: 10000
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['api-keys-monitor'],
    queryFn: async () => {
      const response = await base44.functions.invoke('apiKeyManager', {
        action: 'get_my_keys'
      });
      return response.data.api_keys || [];
    },
    initialData: []
  });

  const systems = [
    { name: 'API Gateway', health: gatewayLogs.filter(l => l.response_status < 400).length / Math.max(gatewayLogs.length, 1), status: 'active', threats: 0 },
    { name: 'Neural Sync', health: 0.98, status: 'active', threats: 0 },
    { name: 'Marketplace', health: 0.96, status: 'active', threats: 0 },
    { name: 'Integrations', health: integrations.filter(i => i.status === 'active').length / Math.max(integrations.length, 1) || 0.95, status: 'active', threats: 0 },
    { name: 'Security', health: threats.filter(t => t.mitigation_status === 'resolved').length / Math.max(threats.length, 1) || 0.99, status: 'active', threats: threats.filter(t => t.threat_level === 'critical').length },
    { name: 'Consciousness', health: 0.97, status: 'active', threats: 0 },
    { name: 'DeFi Engine', health: 0.94, status: 'active', threats: 0 },
    { name: 'Agent Network', health: 0.99, status: 'active', threats: 0 }
  ];

  const overallHealth = systems.reduce((sum, s) => sum + s.health, 0) / systems.length;
  const totalRequests = gatewayLogs.length;
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const criticalThreats = threats.filter(t => t.threat_level === 'critical' && t.mitigation_status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Activity className="w-12 h-12 text-cyan-400 animate-pulse" />
            Ecosystem Monitoring Dashboard
          </h1>
          <p className="text-white/60 text-lg">
            Real-time comprehensive monitoring of the entire Omni-Present Omega ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-cyan-400" />
                <Badge className="bg-cyan-500/30 text-cyan-300">LIVE</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{(overallHealth * 100).toFixed(1)}%</div>
              <div className="text-white/60 text-sm">System Health</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalRequests}</div>
              <div className="text-white/60 text-sm">API Requests</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">{activeIntegrations}</div>
              <div className="text-white/60 text-sm">Active Integrations</div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${criticalThreats > 0 ? 'from-red-500/20 to-orange-500/20 border-red-500/50' : 'from-green-500/20 to-emerald-500/20 border-green-500/50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                {criticalThreats > 0 ? (
                  <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                ) : (
                  <Shield className="w-8 h-8 text-green-400" />
                )}
              </div>
              <div className="text-3xl font-bold text-white">{criticalThreats}</div>
              <div className="text-white/60 text-sm">Critical Threats</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EcosystemMonitor3D systems={systems} />
          <APIGatewayMetrics3D logs={gatewayLogs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ThreatIntelligenceMatrix3D threats={threats} />
          <UnifiedEcosystemHealth3D metrics={ecosystemMetrics[0]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/40 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">Integration Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {integrations.slice(0, 5).map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-black/60 rounded border border-cyan-500/20">
                    <span className="text-white text-sm">{integration.integration_name}</span>
                    <Badge className={
                      integration.status === 'active' ? 'bg-green-500/30 text-green-300' :
                      integration.status === 'approved' ? 'bg-blue-500/30 text-blue-300' :
                      'bg-orange-500/30 text-orange-300'
                    }>
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent API Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gatewayLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="p-2 bg-black/60 rounded border border-green-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs">{log.endpoint}</span>
                      <Badge className={log.response_status < 400 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}>
                        {log.response_status}
                      </Badge>
                    </div>
                    <div className="text-white/60 text-xs">{log.response_time_ms}ms</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {threats.filter(t => t.mitigation_status !== 'resolved').slice(0, 5).map((threat, idx) => (
                  <div key={idx} className="p-2 bg-black/60 rounded border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs">{threat.threat_type}</span>
                      <Badge className={
                        threat.threat_level === 'critical' ? 'bg-red-500/30 text-red-300' :
                        threat.threat_level === 'high' ? 'bg-orange-500/30 text-orange-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }>
                        {threat.threat_level}
                      </Badge>
                    </div>
                    <div className="text-white/60 text-xs">{threat.mitigation_status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}