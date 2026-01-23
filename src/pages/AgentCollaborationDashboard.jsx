import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Brain, TrendingUp, Zap, MessageCircle, Award, AlertCircle } from 'lucide-react';
import SwarmInteractionVisualizer3D from '../components/collaboration/SwarmInteractionVisualizer3D';
import CollectiveDecisionMaker3D from '../components/collaboration/CollectiveDecisionMaker3D';
import EmergentBehaviorDetector3D from '../components/collaboration/EmergentBehaviorDetector3D';
import TeamDynamicsAnalyzer from '../components/collaboration/TeamDynamicsAnalyzer';
import { toast } from 'sonner';

export default function AgentCollaborationDashboard() {
  const queryClient = useQueryClient();
  const [selectedSwarm, setSelectedSwarm] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const { data: collaborations = [] } = useQuery({
    queryKey: ['agent-collaborations'],
    queryFn: () => base44.entities.AutonomousAgentCollaboration.list('-created_date', 20),
    initialData: [],
    refetchInterval: realTimeEnabled ? 3000 : false
  });

  const { data: emergentBehaviors = [] } = useQuery({
    queryKey: ['emergent-behaviors'],
    queryFn: () => base44.entities.EmergentBehavior.list('-created_date', 15),
    initialData: [],
    refetchInterval: realTimeEnabled ? 5000 : false
  });

  const { data: teamOrchestrations = [] } = useQuery({
    queryKey: ['team-orchestrations'],
    queryFn: () => base44.entities.TeamOrchestration.list('-created_date', 10),
    initialData: []
  });

  const { data: aiAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['collaboration-analysis', selectedSwarm?.id],
    queryFn: async () => {
      if (!selectedSwarm) return null;
      const response = await base44.functions.invoke('swarmCollaborationAnalyzer', {
        action: 'analyze_team_dynamics',
        collaboration_id: selectedSwarm.collaboration_id
      });
      return response.data;
    },
    enabled: !!selectedSwarm,
    initialData: null
  });

  const analyzeSwarmMutation = useMutation({
    mutationFn: async (collaboration_id) => {
      const response = await base44.functions.invoke('swarmCollaborationAnalyzer', {
        action: 'analyze_team_dynamics',
        collaboration_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Analysis complete! Team synergy: ${(data.team_synergy * 100).toFixed(0)}%`);
      refetchAnalysis();
    }
  });

  const optimizeCollaborationMutation = useMutation({
    mutationFn: async (collaboration_id) => {
      const response = await base44.functions.invoke('swarmCollaborationAnalyzer', {
        action: 'optimize_collaboration',
        collaboration_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-collaborations'] });
      toast.success(`Optimization applied! ${data.improvements_made} improvements made`);
    }
  });

  const avgSynergy = collaborations.length > 0
    ? collaborations.reduce((sum, c) => sum + (c.collaboration_metrics?.synergy_score || 0), 0) / collaborations.length
    : 0;

  const totalInteractions = collaborations.reduce((sum, c) => 
    sum + (c.interaction_history?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Users className="w-12 h-12 text-indigo-400 animate-pulse" />
            AI Agent Collaboration Dashboard
          </h1>
          <p className="text-white/60 text-lg">
            Real-time monitoring of swarm intelligence, collective decisions, and emergent behaviors
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-indigo-400 mb-2" />
              <div className="text-3xl font-bold text-white">{collaborations.length}</div>
              <div className="text-white/60 text-sm">Active Swarms</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{(avgSynergy * 100).toFixed(0)}%</div>
              <div className="text-white/60 text-sm">Avg Synergy</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <MessageCircle className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">{totalInteractions}</div>
              <div className="text-white/60 text-sm">Interactions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/50">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-orange-400 mb-2" />
              <div className="text-3xl font-bold text-white">{emergentBehaviors.length}</div>
              <div className="text-white/60 text-sm">Emergent</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <Award className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">{teamOrchestrations.length}</div>
              <div className="text-white/60 text-sm">Orchestrations</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Badge className={realTimeEnabled ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}>
              {realTimeEnabled ? 'Real-time Monitoring Active' : 'Real-time Paused'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              {realTimeEnabled ? 'Pause' : 'Resume'} Monitoring
            </Button>
          </div>

          {selectedSwarm && (
            <Button
              onClick={() => optimizeCollaborationMutation.mutate(selectedSwarm.collaboration_id)}
              disabled={optimizeCollaborationMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Selected Swarm
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2 bg-black/40 border-indigo-500/50">
            <CardHeader>
              <CardTitle className="text-white">Active Swarms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collaborations.map((collab) => (
                  <motion.button
                    key={collab.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedSwarm(collab);
                      analyzeSwarmMutation.mutate(collab.collaboration_id);
                    }}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedSwarm?.id === collab.id
                        ? 'bg-indigo-500/30 border-indigo-400'
                        : 'bg-black/60 border-indigo-500/30 hover:bg-indigo-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-bold">{collab.collaboration_id}</div>
                      <Badge className="bg-indigo-500/30 text-indigo-300">
                        {collab.participating_agents?.length || 0} Agents
                      </Badge>
                    </div>
                    <div className="text-white/60 text-xs mb-2">
                      Goal: {collab.collective_goal || 'Collaborative Task'}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Synergy: {((collab.collaboration_metrics?.synergy_score || 0) * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Decisions: {collab.decision_history?.length || 0}
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          <TeamDynamicsAnalyzer 
            analysis={aiAnalysis}
            collaboration={selectedSwarm}
            onRefresh={() => selectedSwarm && analyzeSwarmMutation.mutate(selectedSwarm.collaboration_id)}
          />
        </div>

        <Tabs defaultValue="swarm" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border-indigo-500/30">
            <TabsTrigger value="swarm">Swarm Interactions</TabsTrigger>
            <TabsTrigger value="decisions">Collective Decisions</TabsTrigger>
            <TabsTrigger value="emergent">Emergent Behaviors</TabsTrigger>
          </TabsList>

          <TabsContent value="swarm" className="mt-6">
            {selectedSwarm ? (
              <SwarmInteractionVisualizer3D collaboration={selectedSwarm} />
            ) : (
              <Card className="bg-black/40 border-indigo-500/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <div className="text-white/60">Select a swarm to visualize interactions</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decisions" className="mt-6">
            {selectedSwarm ? (
              <CollectiveDecisionMaker3D collaboration={selectedSwarm} />
            ) : (
              <Card className="bg-black/40 border-purple-500/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <div className="text-white/60">Select a swarm to view collective decisions</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergent" className="mt-6">
            <EmergentBehaviorDetector3D behaviors={emergentBehaviors} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}