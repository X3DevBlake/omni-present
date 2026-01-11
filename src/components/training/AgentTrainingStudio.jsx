import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Zap, TrendingUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgentTrainingStudio({ agentId, userEmail }) {
  const [trainingType, setTrainingType] = useState('behavior_tuning');
  const [trainingData, setTrainingData] = useState('');
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['trainingSessions', agentId],
    queryFn: () => agentId ? base44.entities.AgentTrainingSession.filter({ agent_id: agentId }).catch(() => []) : []
  });

  const startTraining = useMutation({
    mutationFn: async () => {
      const examples = trainingData.split('\n').filter(line => line.trim()).map(line => ({ example: line }));
      return await base44.entities.AgentTrainingSession.create({
        user_email: userEmail,
        agent_id: agentId,
        training_type: trainingType,
        training_data: examples,
        hyperparameters: { learning_rate: 0.001, epochs: 100 },
        status: 'training'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingSessions', agentId] });
      setTrainingData('');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-white font-bold text-xl">Agent Training Studio</h3>
      </div>

      <Tabs defaultValue="train" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5">
          <TabsTrigger value="train">Train Agent</TabsTrigger>
          <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="train">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
            <Select value={trainingType} onValueChange={setTrainingType}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="behavior_tuning">Behavior Tuning</SelectItem>
                <SelectItem value="decision_making">Decision Making</SelectItem>
                <SelectItem value="communication_style">Communication Style</SelectItem>
                <SelectItem value="skill_enhancement">Skill Enhancement</SelectItem>
                <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter training examples (one per line)..."
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              className="bg-white/5 border-white/10 min-h-[200px]"
            />

            <Button
              onClick={() => startTraining.mutate()}
              disabled={!trainingData || startTraining.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {startTraining.isPending ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Training...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-2">
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold capitalize">
                      {session.training_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-white/60 text-xs">{session.epochs_completed} epochs</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    session.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {session.status}
                  </div>
                </div>

                {session.improvement_score && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">
                      +{session.improvement_score.toFixed(1)}% improvement
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}