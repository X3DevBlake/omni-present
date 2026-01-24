import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function EthicalComplianceDashboard() {
  const { data: auditLogs } = useQuery({
    queryKey: ['ethical_audit_logs'],
    queryFn: () => base44.entities.EthicalDecisionLog.list('-created_date', 100),
    initialData: []
  });

  const { data: violations } = useQuery({
    queryKey: ['ethics_violations'],
    queryFn: () => base44.entities.ProactiveInterventionLog.filter({ 
      intervention_type: 'ethical_violation' 
    }),
    initialData: []
  });

  const complianceScore = auditLogs.length > 0 ?
    (auditLogs.filter(log => log.outcome_impact_assessment?.overall_score > 0.7).length / auditLogs.length * 100) : 100;

  const recentViolations = violations.slice(0, 5);
  
  const complianceTrend = [
    { date: '1/18', score: 92 },
    { date: '1/19', score: 89 },
    { date: '1/20', score: 91 },
    { date: '1/21', score: 88 },
    { date: '1/22', score: 93 },
    { date: '1/23', score: 94 },
    { date: '1/24', score: complianceScore }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-950/90 via-emerald-950/90 to-teal-950/90 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-green-400" />
          Ethical Compliance Dashboard
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time monitoring of AI ethical adherence
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Compliance
            </div>
            <div className="text-white text-3xl font-bold">{complianceScore.toFixed(0)}%</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Decisions Logged</div>
            <div className="text-white text-3xl font-bold">{auditLogs.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
            <div className="text-red-400 text-xs mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Violations
            </div>
            <div className="text-white text-3xl font-bold">{violations.length}</div>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4 border border-green-500/20 mb-4">
          <div className="text-green-400 text-sm font-bold mb-3">7-Day Compliance Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={complianceTrend}>
              <defs>
                <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[80, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#complianceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {recentViolations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-950/60 rounded-lg p-4 border border-red-500/30"
          >
            <div className="text-red-400 text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Recent Ethical Alerts
            </div>
            <div className="space-y-2">
              {recentViolations.map((violation, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {violation.trigger_condition || 'Ethical threshold exceeded'}
                  </span>
                  <Badge className="bg-red-600">{violation.severity || 'medium'}</Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {recentViolations.length === 0 && (
          <div className="bg-green-950/40 rounded-lg p-4 border border-green-500/30 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-green-400 text-sm">No ethical violations detected</div>
            <div className="text-gray-400 text-xs mt-1">All agents operating within guidelines</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}