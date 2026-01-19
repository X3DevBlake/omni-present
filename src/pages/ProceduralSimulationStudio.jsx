import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Brain, TrendingUp, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProceduralEnvironmentGenerator3D from '../components/simulation/ProceduralEnvironmentGenerator3D';

export default function ProceduralSimulationStudio() {
  const queryClient = useQueryClient();
  const [complexity, setComplexity] = useState([5]);
  const [terrainType, setTerrainType] = useState('mixed');
  const [size, setSize] = useState('10');

  const { data: environments } = useQuery({
    queryKey: ['procedural-environments'],
    queryFn: () => base44.entities.ProceduralEnvironment.list('-created_date', 20),
  });

  const { data: predictions } = useQuery({
    queryKey: ['behavior-predictions'],
    queryFn: () => base44.entities.EmergentBehaviorPrediction.list('-prediction_confidence', 20),
  });

  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => base44.entities.Simulation.list('', 10),
  });

  const generateEnvironment = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateProceduralEnvironment', {
        complexity_level: complexity[0],
        terrain_type: terrainType,
        size_km: parseInt(size)
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedural-environments'] });
    }
  });

  const predictBehavior = useMutation({
    mutationFn: async (simulationId) => {
      const response = await base44.functions.invoke('predictEmergentBehavior', {
        simulation_id: simulationId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-predictions'] });
    }
  });

  const activePredictions = predictions?.filter(p => !p.occurred).length || 0;
  const highConfidence = predictions?.filter(p => p.prediction_confidence > 75).length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Procedural Simulation Studio
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered procedural generation and emergent behavior prediction
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{environments?.length || 0}</p>
            <p className="text-white/60 text-sm">Generated Environments</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Brain className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{activePredictions}</p>
            <p className="text-white/60 text-sm">Active Predictions</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{highConfidence}</p>
            <p className="text-white/60 text-sm">High Confidence</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <Layers className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{simulations?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Simulations</p>
          </Card>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="environments">Environments</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="visualize">3D Visualizer</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Procedural Environment Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Complexity Level: {complexity[0]}/10
                  </label>
                  <Slider
                    value={complexity}
                    onValueChange={setComplexity}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Terrain Type</label>
                  <Select value={terrainType} onValueChange={setTerrainType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Size (km²)</label>
                  <Input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button
                  onClick={() => generateEnvironment.mutate()}
                  disabled={generateEnvironment.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Generate Environment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {environments?.map((env) => (
                <Card key={env.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-purple-500">{env.terrain_config?.type}</Badge>
                      <div className="text-cyan-400 font-bold">
                        {env.complexity_level}/10
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3">{env.environment_name}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Size</div>
                        <div className="text-white font-bold">
                          {env.terrain_config?.size_km}km²
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Capacity</div>
                        <div className="text-green-400 font-bold">
                          {env.agent_capacity} agents
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                      <div className="text-purple-300 text-xs mb-1">Dynamic Elements</div>
                      <div className="text-white text-sm">
                        {env.dynamic_elements?.length || 0} active elements
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Predict Emergent Behaviors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {simulations?.slice(0, 5).map((sim) => (
                  <Button
                    key={sim.id}
                    onClick={() => predictBehavior.mutate(sim.id)}
                    disabled={predictBehavior.isPending}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    Analyze Simulation: {sim.simulation_name || sim.id}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {predictions?.map((pred) => (
                <Card key={pred.id} className={`border-2 ${
                  pred.occurred ? 'bg-green-500/10 border-green-500/50' :
                  pred.prediction_confidence > 75 ? 'bg-cyan-500/10 border-cyan-500/50' :
                  'bg-purple-500/10 border-purple-500/50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            pred.occurred ? 'bg-green-500' :
                            pred.prediction_confidence > 75 ? 'bg-cyan-500' : 'bg-purple-500'
                          }>
                            {pred.behavior_type}
                          </Badge>
                          {pred.occurred && <Badge className="bg-green-500/20">Occurred</Badge>}
                        </div>
                        <h3 className="text-white font-bold text-lg">{pred.behavior_name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm mb-1">Confidence</div>
                        <div className="text-white font-bold text-2xl">
                          {pred.prediction_confidence?.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{pred.potential_impact}</p>
                    {pred.participating_agents?.length > 0 && (
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-cyan-300 text-sm mb-1">
                          Participating Agents: {pred.participating_agents.length}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pred.participating_agents.slice(0, 5).map((agentId, i) => (
                            <Badge key={i} className="text-xs bg-cyan-500/20">
                              {agentId.slice(-6)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualize">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">3D Environment Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <ProceduralEnvironmentGenerator3D environment={environments?.[0]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}