import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityMetricsDashboard({ threats, incidents, audits }) {
  const criticalThreats = threats.filter(t => t.severity_level === 'critical');
  const mitigatedThreats = threats.filter(t => t.status === 'mitigated' || t.status === 'resolved');
  const resolvedIncidents = incidents.filter(i => i.resolution?.resolved);
  const avgResolutionTime = incidents
    .filter(i => i.resolution?.resolution_time_hours)
    .reduce((acc, i) => acc + i.resolution.resolution_time_hours, 0) / Math.max(incidents.length, 1);

  return (
    <div className="space-y-6">
      {/* Security Posture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Threat Landscape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Threats</span>
              <span className="text-white font-bold">{threats.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Critical</span>
              <Badge className="bg-red-500/20 text-red-400">{criticalThreats.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Mitigated</span>
              <Badge className="bg-green-500/20 text-green-400">{mitigatedThreats.length}</Badge>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                style={{ width: `${(mitigatedThreats.length / Math.max(threats.length, 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Incident Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Incidents</span>
              <span className="text-white font-bold">{incidents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Resolved</span>
              <Badge className="bg-green-500/20 text-green-400">{resolvedIncidents.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Avg Resolution Time</span>
              <span className="text-cyan-400 text-sm">{avgResolutionTime.toFixed(1)}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Threats */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Recent Critical Threats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalThreats.slice(0, 5).map((threat, idx) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-xs font-medium mb-1">{threat.threat_type}</p>
                <p className="text-slate-400 text-xs">
                  {threat.threat_intelligence?.attack_vector || 'Analyzing...'}
                </p>
              </div>
              <Badge className={`${
                threat.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                threat.status === 'mitigated' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              } text-xs`}>
                {threat.status}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {audits.map((audit, idx) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 rounded-lg p-3 text-center"
              >
                <p className="text-slate-400 text-xs mb-2">{audit.compliance_framework?.toUpperCase()}</p>
                <p className="text-white text-2xl font-bold mb-1">
                  {Math.round(audit.compliance_score)}%
                </p>
                {audit.compliance_score >= 80 ? (
                  <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}