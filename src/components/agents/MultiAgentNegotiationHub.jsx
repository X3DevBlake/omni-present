import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, MessageSquare, Target, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function MultiAgentNegotiationHub() {
  const queryClient = useQueryClient();
  const [goalDescription, setGoalDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);

  const { data: agents } = useQuery({
    queryKey: ['available-agents'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents;
    },
  });

  const { data: negotiations } = useQuery({
    queryKey: ['active-negotiations'],
    queryFn: async () => {
      const tasks = await base44.entities.CollaborationTask.filter({ 
        status: 'in_progress'
      });
      return tasks;
    },
  });

  const createNegotiation = useMutation({
    mutationFn: async (config) => {
      const task = await base44.entities.CollaborationTask.create({
        task_name: 'Multi-Agent Goal',
        description: config.goal,
        participating_agents: config.agents,
        task_type: 'decision_making',
        status: 'in_progress',
        progress_percentage: 0,
      });

      // Create initial negotiation messages
      await base44.entities.CollaborationChat.create({
        task_id: task.id,
        content: `Goal initialized: ${config.goal}`,
        message_type: 'system',
      });

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-negotiations'] });
      setGoalDescription('');
      setSelectedAgents([]);
    },
  });

  const handleCreateGoal = () => {
    if (!goalDescription || selectedAgents.length < 2) {
      alert('Please provide a goal and select at least 2 agents');
      return;
    }

    createNegotiation.mutate({
      goal: goalDescription,
      agents: selectedAgents,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Create Multi-Agent Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Complex Goal Description</label>
            <Textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Optimize portfolio allocation across multiple markets while minimizing risk exposure..."
              className="bg-white/5 border-white/10 text-white"
              rows={4}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Participating Agents</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {agents?.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgents(prev =>
                      prev.includes(agent.id)
                        ? prev.filter(id => id !== agent.id)
                        : [...prev, agent.id]
                    );
                  }}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedAgents.includes(agent.id)
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{agent.name}</div>
                  <div className="text-white/60 text-xs">{agent.role}</div>
                </button>
              ))}
            </div>
            <p className="text-white/60 text-xs mt-2">
              Selected: {selectedAgents.length} agents
            </p>
          </div>

          <Button
            onClick={handleCreateGoal}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Initiate Multi-Agent Collaboration
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>How it works:</strong> Agents will autonomously communicate, negotiate roles, and coordinate actions to achieve the defined goal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Negotiations */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Active Collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {negotiations?.map((negotiation) => (
              <motion.div
                key={negotiation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{negotiation.task_name}</h4>
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-white/60 text-xs mb-3 line-clamp-2">
                  {negotiation.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3 h-3 text-white/40" />
                  <span className="text-white/60 text-xs">
                    {negotiation.participating_agents?.length || 0} agents
                  </span>
                </div>
                <Progress value={negotiation.progress_percentage || 0} className="h-1" />
              </motion.div>
            ))}

            {!negotiations?.length && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No active collaborations</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}