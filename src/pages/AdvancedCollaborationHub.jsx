import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Network, Handshake, Zap, Users } from 'lucide-react';
import SwarmIntelligenceOrchestrator3D from '../components/agents/SwarmIntelligenceOrchestrator3D';
import NegotiationFramework3D from '../components/agents/NegotiationFramework3D';
import { toast } from 'sonner';

export default function AdvancedCollaborationHub() {
  const queryClient = useQueryClient();

  const [swarmData, setSwarmData] = React.useState(null);
  const [negotiationData, setNegotiationData] = React.useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-collab'],
    queryFn: () => base44.entities.Agent.list('-created_date', 20),
    initialData: []
  });

  const initializeSwarmMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('swarmIntelligenceEngine', {
        action: 'initialize_swarm',
        problem_description: 'Complex multi-dimensional optimization',
        swarm_size: 12
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSwarmData(data.swarm_data);
      toast.success('Swarm intelligence initialized!');
    }
  });

  const optimizeSwarmMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('swarmIntelligenceEngine', {
        action: 'optimize_swarm'
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Swarm optimized!');
    }
  });

  const initiateNegotiationMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('negotiationProtocol', {
        action: 'initiate_negotiation',
        agent_ids: agents.slice(0, 5).map(a => a.id),
        resources: [
          { resource_type: 'CPU', quantity: 100 },
          { resource_type: 'Memory', quantity: 500 }
        ]
      });
      return response.data;
    },
    onSuccess: (data) => {
      setNegotiationData(data.negotiation_data);
      toast.success('Negotiation initiated!');
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
            <Network className="w-12 h-12 text-purple-400 animate-pulse" />
            Advanced Multi-Agent Collaboration
          </h1>
          <p className="text-white/60 text-lg">
            Swarm intelligence, negotiation protocols, and emergent collective behavior
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Network className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{agents.length}</div>
              <div className="text-white/60 text-sm">Active Agents</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {swarmData?.agents?.length || 0}
              </div>
              <div className="text-white/60 text-sm">Swarm Agents</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 border-blue-500/50">
            <CardContent className="pt-6">
              <Handshake className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {negotiationData?.participating_agents?.length || 0}
              </div>
              <div className="text-white/60 text-sm">Negotiating</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500/20 to-green-500/20 border-teal-500/50">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-teal-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {swarmData?.emergent_behaviors?.length || 0}
              </div>
              <div className="text-white/60 text-sm">Emergent Patterns</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SwarmIntelligenceOrchestrator3D
            swarmData={swarmData}
            onOptimizeSwarm={() => {
              if (!swarmData) {
                initializeSwarmMutation.mutate();
              } else {
                optimizeSwarmMutation.mutate();
              }
            }}
          />

          <NegotiationFramework3D
            negotiationData={negotiationData}
            onInitiateNegotiation={() => initiateNegotiationMutation.mutate()}
          />
        </div>
      </div>
    </div>
  );
}