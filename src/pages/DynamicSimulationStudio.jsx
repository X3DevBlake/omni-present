import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Play, Pause, RefreshCw, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import DynamicScenarioDesigner from '../components/simulation/DynamicScenarioDesigner';
import MultiAgentInteractionGraph from '../components/simulation/MultiAgentInteractionGraph';
import AIWorldEvolution3D from '../components/simulation/AIWorldEvolution3D';
import RealTimeInterventionPanel from '../components/simulation/RealTimeInterventionPanel';
import { toast } from 'sonner';

export default function DynamicSimulationStudio() {
  const queryClient = useQueryClient();
  const [activeSimulation, setActiveSimulation] = useState(null);

  const { data: simulations = [] } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => base44.entities.Simulation.filter({}).limit(50),
    initialData: []
  });

  const { data: scenarios = [] } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => base44.entities.SimulationScenario.filter({}).limit(50),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['sim-agents', activeSimulation],
    queryFn: () => 
      activeSimulation 
        ? base44.entities.SimulationAgent.filter({ simulation_id: activeSimulation }).limit(100)
        : Promise.resolve([]),
    enabled: !!activeSimulation,
    initialData: []
  });

  const { data: interventions = [] } = useQuery({
    queryKey: ['interventions', activeSimulation],
    queryFn: () =>
      activeSimulation
        ? base44.entities.SimulationIntervention.filter({ simulation_id: activeSimulation }).limit(50)
        : Promise.resolve([]),
    enabled: !!activeSimulation,
    initialData: []
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (scenarioConfig) => {
      const response = await base44.functions.invoke('autonomous-scenario-creator', scenarioConfig);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scenarios']);
      toast.success('AI-generated scenario created');
    }
  });

  const interventionMutation = useMutation({
    mutationFn: async (interventionData) => {
      const response = await base44.functions.invoke('real-time-intervention', interventionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      queryClient.invalidateQueries(['sim-agents']);
      toast.success('Intervention applied successfully');
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-400" />
            Dynamic Simulation Studio
          </h1>
          <p className="text-slate-400">AI-powered scenario creation and real-time intervention</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Simulations</p>
                  <p className="text-white text-2xl font-bold">
                    {simulations.filter(s => s.status === 'running').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">AI Scenarios</p>
                  <p className="text-white text-2xl font-bold">{scenarios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-xs">Interventions</p>
                  <p className="text-white text-2xl font-bold">{interventions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Agents</p>
                  <p className="text-white text-2xl font-bold">{agents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="designer" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="designer">Scenario Designer</TabsTrigger>
            <TabsTrigger value="evolution">World Evolution</TabsTrigger>
            <TabsTrigger value="interactions">Agent Interactions</TabsTrigger>
            <TabsTrigger value="interventions">Real-Time Control</TabsTrigger>
          </TabsList>

          <TabsContent value="designer">
            <DynamicScenarioDesigner
              onCreateScenario={(config) => createScenarioMutation.mutate(config)}
              scenarios={scenarios}
              isCreating={createScenarioMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="evolution">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI World Evolution Visualizer</CardTitle>
                <p className="text-slate-400 text-sm">
                  Watch emergent behaviors and environmental changes in real-time
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <AIWorldEvolution3D
                    agents={agents}
                    simulations={simulations}
                    scenarios={scenarios}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Multi-Agent Interaction Network</CardTitle>
                <p className="text-slate-400 text-sm">
                  Visualize collaboration, conflicts, and knowledge transfer
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <MultiAgentInteractionGraph agents={agents} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealTimeInterventionPanel
                  simulation={simulations.find(s => s.id === activeSimulation)}
                  agents={agents}
                  onIntervene={(data) => interventionMutation.mutate(data)}
                  isPending={interventionMutation.isPending}
                />
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Recent Interventions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {interventions.slice(0, 5).map((int, idx) => (
                      <motion.div
                        key={int.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-800/50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-white font-medium text-xs">
                            {int.intervention_type?.replace('_', ' ')}
                          </p>
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {int.triggered_by}
                          </Badge>
                        </div>
                        {int.predicted_impact && (
                          <div className="text-xs text-slate-400 space-y-1">
                            <div>Affected: {int.predicted_impact.affected_agents} agents</div>
                            <div>Cascade: {Math.round(int.predicted_impact.cascade_probability * 100)}%</div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}