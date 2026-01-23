import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Users, RefreshCw, Crown } from 'lucide-react';

export default function TeamDynamicsAnalyzer({ analysis, collaboration, onRefresh }) {
  if (!analysis) {
    return (
      <Card className="bg-black/40 border-indigo-500/50">
        <CardContent className="pt-12 pb-12 text-center">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-50" />
          <div className="text-white/60 mb-4">Select a swarm to view AI analysis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-indigo-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            AI Team Analysis
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-white text-sm font-bold mb-2">Overall Assessment</div>
          <div className="bg-black/60 border border-indigo-500/30 rounded-lg p-3">
            <div className="text-white/80 text-xs leading-relaxed">
              {analysis.team_assessment || 'Analyzing team dynamics...'}
            </div>
          </div>
        </div>

        {analysis.identified_leaders?.length > 0 && (
          <div>
            <div className="text-white text-sm font-bold mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              Identified Leaders
            </div>
            <div className="space-y-1">
              {analysis.identified_leaders.map((leader, idx) => (
                <div key={idx} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                  <div className="text-white text-xs font-bold">{leader.agent_id?.slice(0, 12)}</div>
                  <div className="text-white/60 text-xs">
                    Leadership Score: {(leader.leadership_score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-white text-sm font-bold mb-2">Key Metrics</div>
          <div className="space-y-2">
            <div className="bg-black/60 border border-indigo-500/30 rounded-lg p-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Team Synergy</span>
                <span className="text-white">{((analysis.team_synergy || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-1.5">
                <div 
                  className="bg-indigo-400 h-1.5 rounded-full"
                  style={{ width: `${(analysis.team_synergy || 0) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Communication Efficiency</span>
                <span className="text-white">{((analysis.communication_efficiency || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-1.5">
                <div 
                  className="bg-purple-400 h-1.5 rounded-full"
                  style={{ width: `${(analysis.communication_efficiency || 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {analysis.optimization_strategies?.length > 0 && (
          <div>
            <div className="text-white text-sm font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Optimization Strategies
            </div>
            <div className="space-y-1">
              {analysis.optimization_strategies.map((strategy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-2"
                >
                  <div className="text-white text-xs">{strategy.recommendation}</div>
                  <Badge className="mt-1 bg-green-500/30 text-green-300 text-xs">
                    Expected: +{(strategy.expected_improvement * 100).toFixed(0)}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}