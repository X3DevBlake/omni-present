import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Cpu, Users, Scale, Sparkles, Shield } from 'lucide-react';
import AgentSelfHealingVisualizer3D from '../components/agents/AgentSelfHealingVisualizer3D';
import ConsciousnessEvolutionVisualizer3D from '../components/agents/ConsciousnessEvolutionVisualizer3D';
import AgentSubProcessManager3D from '../components/agents/AgentSubProcessManager3D';
import MultiAgentNegotiationVisualizer3D from '../components/agents/MultiAgentNegotiationVisualizer3D';
import TaskDelegationNetwork3D from '../components/agents/TaskDelegationNetwork3D';

export default function AgentEnhancementHub() {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const queryClient = useQueryClient();

  const { data: selfHealingLogs = [] } = useQuery({
    queryKey: ['self-healing-logs'],
    queryFn: () => base44.entities.AgentSelfHealingLog.list('-created_date', 20),
    initialData: []
  });

  const { data: consciousnessEvolutions = [] } = useQuery({
    queryKey: ['consciousness-evolutions'],
    queryFn: () => base44.entities.ConsciousnessEvolutionEvent.list('-created_date', 15),
    initialData: []
  });

  const { data: subprocesses = [] } = useQuery({
    queryKey: ['subprocesses', selectedAgentId],
    queryFn: () => selectedAgentId 
      ? base44.entities.AgentSubProcess.filter({ parent_agent_id: selectedAgentId })
      : base44.entities.AgentSubProcess.list('-created_date', 20),
    initialData: []
  });

  const { data: negotiations = [] } = useQuery({
    queryKey: ['negotiations'],
    queryFn: () => base44.entities.AgentNegotiationProtocol.list('-created_date', 10),
    initialData: []
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations'],
    queryFn: () => base44.entities.AutonomousAgentCollaboration.filter({ collaboration_status: 'active' }),
    initialData: []
  });

  const spawnSubProcessMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('subProcessManager', {
        action: 'spawn_subprocess',
        parent_agent_id: selectedAgentId || 'agent_001',
        task_description: 'Complex matrix optimization',
        complexity: 'high'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subprocesses'] });
    }
  });

  const executeNegotiationRoundMutation = useMutation({
    mutationFn: async (negotiationId) => {
      const response = await base44.functions.invoke('multiAgentNegotiationProtocol', {
        action: 'execute_round',
        negotiation_id: negotiationId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    }
  });

  const triggerSelfHealingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('selfHealingEngine', {
        action: 'detect_and_heal',
        agent_id: selectedAgentId || 'agent_001'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-healing-logs'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
            Agent Enhancement Hub
          </h1>
          <p className="text-white/60 text-lg">
            Advanced AI functionalities: Self-Healing, Consciousness Evolution, Sub-Process Management & Multi-Agent Negotiation
          </p>
        </motion.div>

        <div className="mb-6">
          <Card className="bg-black/40 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Enter Agent ID"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="flex-1 bg-black/60 border-purple-500/30 text-white"
                />
                <Button 
                  onClick={() => triggerSelfHealingMutation.mutate()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Trigger Self-Heal
                </Button>
                <Button 
                  onClick={() => spawnSubProcessMutation.mutate()}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Cpu className="w-4 h-4 mr-2" />
                  Spawn Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="healing" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/60 border-purple-500/30">
            <TabsTrigger value="healing">Self-Healing</TabsTrigger>
            <TabsTrigger value="consciousness">Consciousness</TabsTrigger>
            <TabsTrigger value="subprocesses">Sub-Processes</TabsTrigger>
            <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
            <TabsTrigger value="delegation">Delegation</TabsTrigger>
          </TabsList>

          <TabsContent value="healing" className="mt-6">
            <AgentSelfHealingVisualizer3D healingLogs={selfHealingLogs} />
          </TabsContent>

          <TabsContent value="consciousness" className="mt-6">
            <ConsciousnessEvolutionVisualizer3D evolutionEvents={consciousnessEvolutions} />
          </TabsContent>

          <TabsContent value="subprocesses" className="mt-6">
            <AgentSubProcessManager3D 
              subprocesses={subprocesses}
              onSpawnProcess={() => spawnSubProcessMutation.mutate()}
            />
          </TabsContent>

          <TabsContent value="negotiation" className="mt-6">
            <MultiAgentNegotiationVisualizer3D 
              negotiation={negotiations[0]}
              onExecuteRound={() => negotiations[0] && executeNegotiationRoundMutation.mutate(negotiations[0].negotiation_id)}
            />
          </TabsContent>

          <TabsContent value="delegation" className="mt-6">
            <TaskDelegationNetwork3D collaboration={collaborations[0]} />
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Self-Healing Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {selfHealingLogs.filter(l => l.healing_outcome?.success).length}
              </div>
              <div className="text-white/60 text-sm">Successful repairs</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Consciousness Evolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {consciousnessEvolutions.length}
              </div>
              <div className="text-white/60 text-sm">Evolution events</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Sub-Processes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">
                {subprocesses.filter(s => s.subprocess_status === 'running').length}
              </div>
              <div className="text-white/60 text-sm">Currently running</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}