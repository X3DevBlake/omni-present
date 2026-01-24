import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EthicalFeedbackLoopViz() {
  const [loops, setLoops] = useState([]);
  const [missionImpact, setMissionImpact] = useState({ success_rate: 0, compliance_score: 0 });

  useEffect(() => {
    const unsubscribe = base44.entities.EthicalFrameworkEvolution.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        const data = event.data;
        
        // Extract feedback loops from AI suggestions
        if (data.ai_suggested_modifications) {
          setLoops(data.ai_suggested_modifications.slice(0, 5).map(mod => ({
            type: mod.modification_type,
            principle: mod.principle_affected,
            impact: mod.expected_improvement,
            stabilizing: mod.expected_improvement > 0
          })));
        }

        // Update mission impact metrics
        if (data.convergence_metrics) {
          setMissionImpact({
            success_rate: 0.85 + data.convergence_metrics.stability_score * 0.1,
            compliance_score: 0.90 - data.convergence_metrics.divergence_from_baseline * 0.2
          });
        }
      }
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-violet-950/30 via-black/40 to-purple-950/30 backdrop-blur-lg border-violet-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <RefreshCw className="w-4 h-4 text-violet-400" />
          Ethical Feedback Loops
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-950/20 border border-green-500/20 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-green-400" />
              <span className="text-gray-400 text-[10px]">Mission Success</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-green-400 text-lg font-bold">
                {Math.round(missionImpact.success_rate * 100)}%
              </div>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
          </div>

          <div className="bg-blue-950/20 border border-blue-500/20 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400 text-[10px]">Compliance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-blue-400 text-lg font-bold">
                {Math.round(missionImpact.compliance_score * 100)}%
              </div>
              {missionImpact.compliance_score > 0.85 ? 
                <TrendingUp className="w-3 h-3 text-blue-400" /> :
                <TrendingDown className="w-3 h-3 text-red-400" />
              }
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white text-xs font-bold">Active Loops:</div>
          {loops.map((loop, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-violet-950/20 border border-violet-500/20 rounded p-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3 h-3 ${loop.stabilizing ? 'text-cyan-400' : 'text-orange-400'}`} />
                  <span className="text-white text-[10px] font-bold">{loop.type}</span>
                </div>
                <Badge className={loop.stabilizing ? 'bg-cyan-600' : 'bg-orange-600'}>
                  {loop.stabilizing ? 'Stabilizing' : 'Adapting'}
                </Badge>
              </div>
              <div className="text-gray-400 text-[9px] mt-1">{loop.principle}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}