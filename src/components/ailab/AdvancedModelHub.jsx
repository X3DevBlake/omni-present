import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Cpu, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdvancedModelHub() {
  const { data: trainingSessions } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 10),
  });

  const { data: deployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => base44.entities.AgentDeployment.filter({ status: 'active' }),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
          <Brain className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-white text-2xl font-bold">{trainingSessions?.length || 0}</p>
          <p className="text-white/60 text-sm">Training Sessions</p>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
          <Cpu className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white text-2xl font-bold">{deployments?.length || 0}</p>
          <p className="text-white/60 text-sm">Active Deployments</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
          <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-white text-2xl font-bold">94.2%</p>
          <p className="text-white/60 text-sm">Avg Accuracy</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <p className="text-white text-2xl font-bold">1.2M</p>
          <p className="text-white/60 text-sm">Inferences</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainingSessions?.slice(0, 4).map((session) => (
          <Card key={session.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">
                  Training Session
                </CardTitle>
                <Badge className={`${
                  session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  session.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                } border-0`}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {session.convergence_data && session.convergence_data.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={session.convergence_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="epoch" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="#00ff88" fill="#00ff88" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Accuracy</div>
                  <div className="text-green-400 font-bold">{session.best_accuracy?.toFixed(1)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Loss</div>
                  <div className="text-white font-bold">{session.current_loss?.toFixed(3)}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Epochs</div>
                  <div className="text-white font-bold">{session.current_epoch}/{session.total_epochs}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}