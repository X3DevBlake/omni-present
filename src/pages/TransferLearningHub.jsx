import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Brain, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';

export default function TransferLearningHub() {
  const queryClient = useQueryClient();
  const [sourceAgent, setSourceAgent] = useState(null);
  const [targetAgent, setTargetAgent] = useState(null);
  const [sourceSimulation, setSourceSimulation] = useState(null);
  const [targetSimulation, setTargetSimulation] = useState(null);
  const [knowledgeType, setKnowledgeType] = useState('skill');
  const [transferMethod, setTransferMethod] = useState('direct_copy');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => base44.entities.Simulation.list(),
  });

  const { data: transfers } = useQuery({
    queryKey: ['knowledge-transfers'],
    queryFn: () => base44.entities.AgentKnowledgeTransfer.list('-created_date', 20),
  });

  const executeTransfer = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('transferAgentKnowledge', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-transfers'] });
      setSourceAgent(null);
      setTargetAgent(null);
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Transfer Learning Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Transfer knowledge and state between agents and simulation environments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Configure Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Source Agent</label>
                  <Select value={sourceAgent?.id || ''} onValueChange={(id) => {
                    const agent = agents?.find(a => a.id === id);
                    setSourceAgent(agent);
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Target Agent</label>
                  <Select value={targetAgent?.id || ''} onValueChange={(id) => {
                    const agent = agents?.find(a => a.id === id);
                    setTargetAgent(agent);
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.filter(a => a.id !== sourceAgent?.id).map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Knowledge Type</label>
                  <Select value={knowledgeType} onValueChange={setKnowledgeType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skill">Skills</SelectItem>
                      <SelectItem value="memory">Memories</SelectItem>
                      <SelectItem value="strategy">Strategies</SelectItem>
                      <SelectItem value="model_weights">Model Weights</SelectItem>
                      <SelectItem value="full_state">Full State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Transfer Method</label>
                  <Select value={transferMethod} onValueChange={setTransferMethod}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct_copy">Direct Copy</SelectItem>
                      <SelectItem value="fine_tuning">Fine Tuning</SelectItem>
                      <SelectItem value="distillation">Distillation</SelectItem>
                      <SelectItem value="embedding_transfer">Embedding Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Source Simulation (Optional)</label>
                  <Select value={sourceSimulation?.id || ''} onValueChange={(id) => {
                    const sim = simulations?.find(s => s.id === id);
                    setSourceSimulation(sim);
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {simulations?.map(sim => (
                        <SelectItem key={sim.id} value={sim.id}>
                          {sim.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Target Simulation (Optional)</label>
                  <Select value={targetSimulation?.id || ''} onValueChange={(id) => {
                    const sim = simulations?.find(s => s.id === id);
                    setTargetSimulation(sim);
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {simulations?.map(sim => (
                        <SelectItem key={sim.id} value={sim.id}>
                          {sim.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (sourceAgent && targetAgent) {
                    executeTransfer.mutate({
                      source_agent_id: sourceAgent.id,
                      target_agent_id: targetAgent.id,
                      source_simulation_id: sourceSimulation?.id,
                      target_simulation_id: targetSimulation?.id,
                      knowledge_type: knowledgeType,
                      transfer_method: transferMethod,
                    });
                  }
                }}
                disabled={!sourceAgent || !targetAgent || executeTransfer.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {executeTransfer.isPending ? 'Transferring...' : 'Execute Transfer'}
              </Button>

              {executeTransfer.data && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-bold">Transfer Complete</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    {executeTransfer.data.items_transferred} items transferred
                  </p>
                  <p className="text-green-400 text-sm">
                    Performance improvement: {executeTransfer.data.performance_improvement}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {transfers?.map((transfer, i) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{transfer.knowledge_type}</Badge>
                      <Badge className={`${
                        transfer.transfer_status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        transfer.transfer_status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      } border-0`}>
                        {transfer.transfer_status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                      <span>{transfer.source_agent_id?.slice(0, 8)}</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                      <span>{transfer.target_agent_id?.slice(0, 8)}</span>
                    </div>

                    {transfer.transfer_status === 'completed' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Success Rate</div>
                          <div className="text-white font-bold">{transfer.success_rate}%</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Performance</div>
                          <div className="text-green-400 font-bold">+{transfer.performance_delta}%</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
}