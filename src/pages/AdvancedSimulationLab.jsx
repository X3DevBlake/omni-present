import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Play, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RLTrainingVisualizer3D from '../components/simulation/RLTrainingVisualizer3D';

export default function AdvancedSimulationLab() {
  const queryClient = useQueryClient();
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [numAgents, setNumAgents] = useState('4');

  const { data: environments } = useQuery({
    queryKey: ['simulation-environments'],
    queryFn: () => base44.entities.SimulationEnvironment.list(),
  });

  const { data: rlSessions } = useQuery({
    queryKey: ['rl-sessions'],
    queryFn: () => base44.entities.RLTrainingSession.list('-created_date', 10),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const startRLTraining = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('runMultiAgentRL', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rl-sessions'] });
    },
  });

  const analyzeBehavior = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('analyzeAgentBehavior', params);
      return response.data;
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
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced Simulation Lab
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Multi-agent RL, transfer learning, and emergent behavior analysis
          </p>
        </motion.div>

        <Tabs defaultValue="environments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="environments">Environments</TabsTrigger>
            <TabsTrigger value="training">RL Training</TabsTrigger>
            <TabsTrigger value="visualizer">3D Visualizer</TabsTrigger>
            <TabsTrigger value="analysis">Behavior Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="environments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {environments?.map((env, i) => (
                <Card key={env.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{env.environment_name}</h3>
                        <Badge>{env.environment_type}</Badge>
                      </div>
                      <Badge className={env.transfer_learning_enabled ? 'bg-purple-500' : 'bg-gray-500'}>
                        {env.transfer_learning_enabled ? 'Transfer Learning' : 'Standard'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Population</div>
                        <div className="text-white font-bold">{env.parameters?.population_size || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Active Agents</div>
                        <div className="text-cyan-400 font-bold">{env.active_agents?.length || 0}</div>
                      </div>
                    </div>

                    {env.multi_agent_rl_config && (
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded p-3 mb-3">
                        <div className="text-purple-300 text-xs mb-1">Multi-Agent RL Config:</div>
                        <div className="text-white text-sm">
                          Algorithm: {env.multi_agent_rl_config.algorithm?.toUpperCase()}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setSelectedEnv(env)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Select Environment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Start Multi-Agent RL Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedEnv && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded p-4 mb-4">
                    <p className="text-white font-medium">Selected: {selectedEnv.environment_name}</p>
                    <p className="text-white/60 text-sm">{selectedEnv.environment_type} environment</p>
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-2 block">Number of Agents</label>
                  <Input
                    type="number"
                    value={numAgents}
                    onChange={(e) => setNumAgents(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button
                  onClick={() => {
                    if (selectedEnv) {
                      const selectedAgentIds = agents?.slice(0, parseInt(numAgents)).map(a => a.id) || [];
                      startRLTraining.mutate({
                        environment_id: selectedEnv.id,
                        agent_ids: selectedAgentIds,
                        episodes: 100,
                        algorithm: selectedEnv.multi_agent_rl_config?.algorithm || 'maddpg',
                      });
                    }
                  }}
                  disabled={!selectedEnv || startRLTraining.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {startRLTraining.isPending ? 'Training...' : 'Start Training'}
                </Button>

                {startRLTraining.data && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
                    <p className="text-white font-bold mb-2">Training Complete!</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Final Reward</div>
                        <div className="text-green-400 font-bold">{startRLTraining.data.final_reward?.toFixed(1)}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Best Reward</div>
                        <div className="text-cyan-400 font-bold">{startRLTraining.data.best_reward?.toFixed(1)}</div>
                      </div>
                    </div>
                    {startRLTraining.data.emergent_behaviors?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-purple-300 text-xs mb-1">Emergent Behaviors:</div>
                        {startRLTraining.data.emergent_behaviors.map((behavior, i) => (
                          <Badge key={i} className="mr-1 mb-1 text-xs">{behavior}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Recent Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rlSessions?.map((session, i) => (
                    <div key={session.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <Badge>{session.algorithm?.toUpperCase()}</Badge>
                        <Badge className={`${
                          session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        } border-0`}>
                          {session.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Episodes</div>
                          <div className="text-white font-bold">{session.episodes_completed}/{session.total_episodes}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Avg Reward</div>
                          <div className="text-cyan-400 font-bold">{session.average_reward?.toFixed(1) || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Agents</div>
                          <div className="text-white font-bold">{session.participating_agents?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualizer">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">RL Training Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <RLTrainingVisualizer3D session={rlSessions?.[0]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            {analyzeBehavior.data && (
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Agent Behavior Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded p-4">
                      <div className="text-white/60 text-sm mb-1">Learning Speed</div>
                      <div className="text-white font-bold capitalize">{analyzeBehavior.data.learning_speed}</div>
                    </div>
                    <div className="bg-white/5 rounded p-4">
                      <div className="text-white/60 text-sm mb-1">Cooperation</div>
                      <div className="text-cyan-400 font-bold">{analyzeBehavior.data.cooperation_tendency}%</div>
                    </div>
                  </div>

                  <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
                    <h4 className="text-green-400 font-bold mb-2">Strengths</h4>
                    {analyzeBehavior.data.strengths?.map((s, i) => (
                      <div key={i} className="text-white/80 text-sm">• {s}</div>
                    ))}
                  </div>

                  <div className="bg-orange-500/20 border border-orange-500/30 rounded p-4">
                    <h4 className="text-orange-400 font-bold mb-2">Areas for Improvement</h4>
                    {analyzeBehavior.data.weaknesses?.map((w, i) => (
                      <div key={i} className="text-white/80 text-sm">• {w}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}