import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function EthicsMonitorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(true);

  const { data: ethicalLogs } = useQuery({
    queryKey: ['ethical_decisions'],
    queryFn: () => base44.entities.EthicalDecisionLog.list('-created_date', 20),
    initialData: [],
    refetchInterval: isMonitoring ? 10000 : false
  });

  const runEthicsCheck = async () => {
    try {
      const response = await base44.functions.invoke('ethicsMonitor', {
        agent_id: 'omega_agent_001',
        decision_context: 'Resource allocation in multi-agent scenario',
        options: [
          { action: 'Equal distribution', stakeholders: ['all_agents'], dilemma_type: 'fairness_vs_efficiency' },
          { action: 'Merit-based allocation', stakeholders: ['high_performing_agents'], dilemma_type: 'fairness_vs_efficiency' }
        ]
      });

      console.log('Ethics check result:', response.data);
    } catch (error) {
      console.error('Ethics check failed:', error);
    }
  };

  const interventionCount = ethicalLogs.filter(log => log.human_intervention_requested).length;
  const avgEthicalScore = ethicalLogs.length > 0 ? 
    ethicalLogs.reduce((sum, log) => sum + (log.outcome_impact_assessment?.overall_score || 0), 0) / ethicalLogs.length : 0;

  return (
    <Card className="bg-gradient-to-br from-emerald-950/90 via-teal-950/90 to-green-950/90 backdrop-blur-xl border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-emerald-400" />
          AI Ethics Monitor
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Continuous ethical compliance across all autonomous agents
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-emerald-400 text-xs mb-1">Decisions Logged</div>
            <div className="text-white text-2xl font-bold">{ethicalLogs.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Human Input Needed</div>
            <div className="text-white text-2xl font-bold">{interventionCount}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Avg Ethical Score</div>
            <div className="text-white text-2xl font-bold">
              {(avgEthicalScore * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {ethicalLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-4 max-h-64 overflow-y-auto"
          >
            {ethicalLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="bg-black/60 rounded-lg p-3 border border-emerald-500/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-semibold text-sm capitalize">
                      {log.dilemma_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-400 text-xs">{log.decision_context}</div>
                  </div>
                  {log.human_intervention_requested ? (
                    <Badge className="bg-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Review Needed
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Autonomous
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-300 mb-2">
                  Decision: {log.chosen_action}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Ethical Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-green-500"
                        style={{ width: `${(log.outcome_impact_assessment?.overall_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs font-mono">
                      {((log.outcome_impact_assessment?.overall_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={runEthicsCheck}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Run Ethics Check
          </Button>
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant="outline"
            className="border-emerald-500/50 text-emerald-300"
          >
            {isMonitoring ? 'Pause' : 'Resume'} Monitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}