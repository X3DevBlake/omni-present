import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Target, Play, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import EmergentGoalVisualizer3D from './EmergentGoalVisualizer3D';

export default function EmergentGoalSystem() {
  const queryClient = useQueryClient();
  const [goalDescription, setGoalDescription] = useState('');

  const { data: emergentGoals } = useQuery({
    queryKey: ['emergent-goals'],
    queryFn: async () => {
      const goals = await base44.entities.CollaborationTask.filter({ 
        task_type: 'emergent_goal'
      });
      return goals;
    },
    refetchInterval: 5000,
  });

  const createEmergentGoal = useMutation({
    mutationFn: async (goal) => {
      const response = await base44.functions.invoke('createEmergentGoal', {
        description: goal,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergent-goals'] });
      setGoalDescription('');
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Define Emergent Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Describe a high-level objective. Agents will self-organize to achieve it without explicit task assignment..."
              className="bg-white/5 border-white/10 text-white"
              rows={6}
            />

            <Button
              onClick={() => createEmergentGoal.mutate(goalDescription)}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Initiate Emergent Goal
            </Button>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-200 text-sm">
                <strong>How it works:</strong> Agents autonomously identify sub-goals, coordinate actions, and adapt strategies to collectively achieve the objective.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Active Emergent Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergentGoals?.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-orange-400" />
                    <h4 className="text-white font-medium">{goal.task_name}</h4>
                  </div>
                  <p className="text-white/60 text-sm mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white">{goal.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={goal.progress_percentage || 0} className="h-2" />
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <TrendingUp className="w-3 h-3" />
                      {goal.participating_agents?.length || 0} agents collaborating
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Emergent Collaboration Network</CardTitle>
        </CardHeader>
        <CardContent>
          <EmergentGoalVisualizer3D goals={emergentGoals || []} />
        </CardContent>
      </Card>
    </div>
  );
}