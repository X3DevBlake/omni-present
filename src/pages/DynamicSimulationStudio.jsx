import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DynamicScenario3D from '../components/simulation/DynamicScenario3D';

export default function DynamicSimulationStudio() {
  const queryClient = useQueryClient();
  const [complexity, setComplexity] = useState([5]);
  const [selectedEnv, setSelectedEnv] = useState(null);

  const { data: environments } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.SimulationEnvironment.list(),
  });

  const { data: scenarios } = useQuery({
    queryKey: ['dynamic-scenarios'],
    queryFn: () => base44.entities.DynamicSimulationScenario.list('-created_date', 15),
  });

  const generateScenario = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('generateDynamicScenario', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-scenarios'] });
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Dynamic Simulation Studio
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-generated scenarios with adaptive rules and emergent challenges
          </p>
        </motion.div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 p-1">
            <TabsTrigger value="generate">Generate Scenario</TabsTrigger>
            <TabsTrigger value="scenarios">AI Scenarios</TabsTrigger>
            <TabsTrigger value="visualizer">3D Visualizer</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">AI Scenario Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white text-sm mb-3 block">Select Environment</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {environments?.map((env) => (
                      <div
                        key={env.id}
                        onClick={() => setSelectedEnv(env)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedEnv?.id === env.id
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-white font-bold mb-1">{env.environment_name}</div>
                        <Badge>{env.environment_type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-3 block">
                    Complexity Level: {complexity[0]}/10
                  </label>
                  <Slider
                    value={complexity}
                    onValueChange={setComplexity}
                    min={1}
                    max={10}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-white/60 text-xs">
                    <span>Simple</span>
                    <span>Complex</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (selectedEnv) {
                      generateScenario.mutate({
                        environment_id: selectedEnv.id,
                        complexity_level: complexity[0],
                      });
                    }
                  }}
                  disabled={!selectedEnv || generateScenario.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateScenario.isPending ? 'Generating...' : 'Generate AI Scenario'}
                </Button>

                {generateScenario.data && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-purple-300 font-bold text-lg mb-3">
                      {generateScenario.data.scenario_name}
                    </h3>
                    
                    <div className="bg-black/30 rounded p-3 mb-3">
                      <div className="text-white/60 text-sm mb-2">Complexity Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                            style={{ width: `${generateScenario.data.complexity * 10}%` }}
                          />
                        </div>
                        <span className="text-purple-400 font-bold">{generateScenario.data.complexity}/10</span>
                      </div>
                    </div>

                    {generateScenario.data.objectives?.length > 0 && (
                      <div>
                        <div className="text-cyan-300 text-sm mb-2">Challenge Objectives:</div>
                        {generateScenario.data.objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1">
                            <Target className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <span className="text-white/80 text-sm">{obj}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios?.map((scenario, i) => (
                <Card key={scenario.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-3">{scenario.scenario_name}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Complexity</div>
                        <div className="text-purple-400 font-bold">{scenario.complexity_level}/10</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Adaptive Rules</div>
                        <div className="text-cyan-400 font-bold">{scenario.adaptive_rules?.length || 0}</div>
                      </div>
                    </div>

                    {scenario.challenge_objectives?.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded p-3 mb-3">
                        <div className="text-purple-300 text-xs mb-2">Objectives:</div>
                        {scenario.challenge_objectives.slice(0, 2).map((obj, j) => (
                          <div key={j} className="text-white/70 text-xs">• {obj}</div>
                        ))}
                      </div>
                    )}

                    {scenario.emergent_patterns?.length > 0 && (
                      <div>
                        <div className="text-cyan-300 text-xs mb-1">Emergent Patterns:</div>
                        {scenario.emergent_patterns.map((pattern, j) => (
                          <Badge key={j} className="mr-1 mb-1 text-xs bg-cyan-500/20">{pattern}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualizer">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Dynamic Scenario Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicScenario3D scenario={scenarios?.[0]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}