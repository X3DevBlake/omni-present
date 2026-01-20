import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, FileCheck, Map, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import ThreatMap3D from '../components/security/ThreatMap3D';
import SecurityIncidentFlow3D from '../components/security/SecurityIncidentFlow3D';
import ComplianceStatusVisualizer3D from '../components/security/ComplianceStatusVisualizer3D';
import SecurityMetricsDashboard from '../components/security/SecurityMetricsDashboard';
import { toast } from 'sonner';

export default function SecurityIntelligenceHub() {
  const queryClient = useQueryClient();

  const { data: threats = [] } = useQuery({
    queryKey: ['threat-detections'],
    queryFn: () => base44.entities.ThreatDetection.filter({}).limit(200),
    refetchInterval: 15000,
    initialData: []
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: () => base44.entities.SecurityIncident.filter({}).limit(100),
    initialData: []
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['compliance-audits'],
    queryFn: () => base44.entities.ComplianceAudit.filter({}).limit(50),
    initialData: []
  });

  const detectThreatsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detect-advanced-threats', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['threat-detections']);
      toast.success(`Detected ${data.threats_detected} threats`);
    }
  });

  const analyzeComplianceMutation = useMutation({
    mutationFn: async (framework) => {
      const response = await base44.functions.invoke('analyze-compliance-status', { framework });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['compliance-audits']);
      toast.success(`Compliance: ${Math.round(data.compliance_score)}%`);
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generate-security-report', {
        report_type: 'comprehensive',
        time_range_days: 30
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Security report generated');
    }
  });

  const criticalThreats = threats.filter(t => t.severity_level === 'critical' || t.severity_level === 'high');
  const activeIncidents = incidents.filter(i => !i.resolution?.resolved);
  const avgCompliance = audits.reduce((acc, a) => acc + a.compliance_score, 0) / Math.max(audits.length, 1);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-400" />
            Security Intelligence Hub
          </h1>
          <p className="text-slate-400">AI-powered threat detection and compliance monitoring</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => detectThreatsMutation.mutate()}
            disabled={detectThreatsMutation.isPending}
            className="bg-gradient-to-r from-red-600 to-orange-600"
          >
            <Shield className={`w-4 h-4 mr-2 ${detectThreatsMutation.isPending ? 'animate-spin' : ''}`} />
            Scan Threats
          </Button>
          <Button
            onClick={() => analyzeComplianceMutation.mutate('iso27001')}
            disabled={analyzeComplianceMutation.isPending}
            variant="outline"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Audit Compliance
          </Button>
          <Button
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-slate-400 text-xs">Critical Threats</p>
                  <p className="text-white text-2xl font-bold">{criticalThreats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Incidents</p>
                  <p className="text-white text-2xl font-bold">{activeIncidents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Compliance Score</p>
                  <p className="text-white text-2xl font-bold">{Math.round(avgCompliance)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Map className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Total Threats</p>
                  <p className="text-white text-2xl font-bold">{threats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="threats">
              <Map className="w-4 h-4 mr-2" />
              Threat Map
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileCheck className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Shield className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Global Threat Map</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time visualization of detected security threats
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <ThreatMap3D threats={threats} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Incident Flow</CardTitle>
                <p className="text-slate-400 text-sm">
                  Monitor incident lifecycle and response activities
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <SecurityIncidentFlow3D incidents={incidents} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Status Visualizer</CardTitle>
                <p className="text-slate-400 text-sm">
                  Multi-framework compliance monitoring
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <ComplianceStatusVisualizer3D audits={audits} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <SecurityMetricsDashboard
              threats={threats}
              incidents={incidents}
              audits={audits}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}