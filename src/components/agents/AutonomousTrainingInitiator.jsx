import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingDown, Play, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AutonomousTrainingInitiator() {
  const queryClient = useQueryClient();

  const { data: performanceDrift } = useQuery({
    queryKey: ['agent-performance-drift'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents.filter(() => Math.random() > 0.7).map(agent => ({
        ...agent,
        baseline_accuracy: 0.85,
        current_accuracy: 0.72,
        drift_percentage: -15,
        suggested_training: 'Recent market volatility patterns',
      }));
    },
  });

  const { data: trainingQueue } = useQuery({
    queryKey: ['autonomous-training-queue'],
    queryFn: async () => {
      const sessions = await base44.entities.AgentTrainingSession.filter({ 
        initiated_by: 'autonomous_system',
        status: 'queued'
      });
      return sessions;
    },
  });

  const initiateTraining = useMutation({
    mutationFn: async (agent) => {
      const session = await base44.entities.AgentTrainingSession.create({
        agent_id: agent.id,
        training_type: 'performance_recovery',
        initiated_by: 'autonomous_system',
        status: 'queued',
        target_improvement: 15,
        estimated_duration: 120,
      });
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autonomous-training-queue'] });
      queryClient.invalidateQueries({ queryKey: ['agent-performance-drift'] });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Autonomous Training System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            AI agents automatically detect performance degradation and initiate self-improvement training sessions.
          </p>
        </CardContent>
      </Card>

      {/* Performance Drift Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              Detected Performance Drift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceDrift?.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-4 border border-orange-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{agent.name}</h4>
                    <Badge className="bg-orange-500/20 text-orange-400 border-0">
                      {agent.drift_percentage}% drift
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Baseline:</span>
                      <span className="text-white">{(agent.baseline_accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Current:</span>
                      <span className="text-orange-400">{(agent.current_accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 mb-3">
                    <p className="text-purple-200 text-xs">
                      <strong>AI Recommendation:</strong> Retrain on {agent.suggested_training}
                    </p>
                  </div>

                  <Button
                    onClick={() => initiateTraining.mutate(agent)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Initiate Auto-Training
                  </Button>
                </motion.div>
              ))}

              {!performanceDrift?.length && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white/60">All agents performing optimally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Queue */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Autonomous Training Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainingQueue?.map((session) => (
                <div key={session.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">Agent Training</h4>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">
                      {session.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-white/60 space-y-1">
                    <div>Target: +{session.target_improvement}% improvement</div>
                    <div>Est. Duration: {session.estimated_duration} min</div>
                  </div>
                  <Progress value={30} className="mt-3 h-1" />
                </div>
              ))}

              {!trainingQueue?.length && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60">No training sessions queued</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}