import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Zap, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CollaborationEfficiencyDashboard({ collaborationData }) {
  const efficiency = collaborationData?.team_performance?.efficiency_rating || 0.85;
  const synergy = collaborationData?.team_performance?.synergy_score || 0.78;
  const coordination = collaborationData?.team_performance?.coordination_quality || 0.92;

  const conflicts = collaborationData?.conflicts || [];
  const bottlenecks = collaborationData?.bottlenecks || [];

  return (
    <Card className="bg-black/40 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Collaboration Efficiency Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm">Efficiency Rating</span>
              <span className="text-blue-400 font-bold">{(efficiency * 100).toFixed(0)}%</span>
            </div>
            <Progress value={efficiency * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm">Synergy Score</span>
              <span className="text-purple-400 font-bold">{(synergy * 100).toFixed(0)}%</span>
            </div>
            <Progress value={synergy * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm">Coordination Quality</span>
              <span className="text-green-400 font-bold">{(coordination * 100).toFixed(0)}%</span>
            </div>
            <Progress value={coordination * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm font-bold">Conflicts</span>
              </div>
              <div className="text-white text-2xl font-bold">{conflicts.length}</div>
              {conflicts.slice(0, 2).map((conflict, idx) => (
                <div key={idx} className="text-white/60 text-xs mt-1">
                  • {conflict.type}: {conflict.severity}
                </div>
              ))}
            </div>

            <div className="bg-orange-500/20 border border-orange-500/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-bold">Bottlenecks</span>
              </div>
              <div className="text-white text-2xl font-bold">{bottlenecks.length}</div>
              {bottlenecks.slice(0, 2).map((bottleneck, idx) => (
                <div key={idx} className="text-white/60 text-xs mt-1">
                  • {bottleneck.location}: {bottleneck.impact}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-bold">Recommendations</span>
            </div>
            <div className="space-y-1">
              <div className="text-white/80 text-xs">• Optimize agent task distribution for better load balancing</div>
              <div className="text-white/80 text-xs">• Increase communication frequency for critical tasks</div>
              <div className="text-white/80 text-xs">• Implement predictive conflict resolution</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}