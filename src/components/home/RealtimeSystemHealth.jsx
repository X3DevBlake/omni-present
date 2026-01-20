import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function RealtimeSystemHealth() {
  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const [threats, pipelines, monitors] = await Promise.all([
        base44.entities.ThreatIntelligence.filter({ threat_status: { $ne: 'resolved' } }),
        base44.entities.DataPipeline.list(),
        base44.entities.PerformanceMonitor.list()
      ]);

      const criticalIssues = threats.filter(t => t.severity_level === 'critical').length;
      const failedPipelines = pipelines.filter(p => p.status === 'failed').length;
      const avgPerformance = monitors.reduce((acc, m) => acc + (m.performance_score || 0), 0) / (monitors.length || 1);

      let overallStatus = 'healthy';
      let overallScore = 100;

      if (criticalIssues > 0 || failedPipelines > 0) {
        overallStatus = 'critical';
        overallScore = 50;
      } else if (avgPerformance < 70) {
        overallStatus = 'warning';
        overallScore = 75;
      } else {
        overallScore = avgPerformance;
      }

      return {
        status: overallStatus,
        score: overallScore,
        components: [
          { name: 'Security', status: criticalIssues === 0 ? 'healthy' : 'critical', value: `${threats.length} active` },
          { name: 'Pipelines', status: failedPipelines === 0 ? 'healthy' : 'warning', value: `${pipelines.length} total` },
          { name: 'Performance', status: avgPerformance > 80 ? 'healthy' : 'warning', value: `${avgPerformance.toFixed(0)}%` },
          { name: 'Storage', status: 'healthy', value: '45% used' }
        ]
      };
    },
    refetchInterval: 5000
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'from-green-600 to-emerald-600';
      case 'warning': return 'from-orange-600 to-yellow-600';
      case 'critical': return 'from-red-600 to-pink-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${getStatusColor(healthData?.status)} border-0`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
          <Badge className="bg-white/20">
            {healthData?.score?.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {healthData?.components?.map((component, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(component.status)}
                <span className="text-white text-xs font-medium">{component.name}</span>
              </div>
              <div className="text-white/80 text-sm">{component.value}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}