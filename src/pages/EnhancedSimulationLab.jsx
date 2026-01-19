import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import ProceduralWorld3D from '@/components/simulation/ProceduralWorld3D';
import MultiAgentRL3D from '@/components/simulation/MultiAgentRL3D';
import { Cpu, Play, Globe, Brain } from 'lucide-react';

export default function EnhancedSimulationLab() {
  const [selectedEnv, setSelectedEnv] = useState(null);
  const queryClient = useQueryClient();

  const { data: environments = [] } = useQuery({
    queryKey: ['simulation-environments'],
    queryFn: () => base44.entities.SimulationEnvironmentConfig.list()
  });

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['rl-training-sessions'],
    queryFn: () => base44.entities.RLTrainingSession.list()
  });

  const generateWorldMutation = useMutation({
    mutationFn: async (config) => {
      const response = await base44.functions.invoke('generateProceduralWorld', { config });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['simulation-environments']);
    }
  });

  const startRLTrainingMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('runMultiAgentRL', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rl-training-sessions']);
    }
  });

  const activeEnvs = environments.filter(e => e.is_active).length;
  const activeSessions = trainingSessions.filter(s => s.status === 'running').length;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Cpu className="w-12 h-12 text-cyan-400" />
            Enhanced Simulation Lab
          </h1>
          <p className="text-xl text-gray-300">
            Build, train, and test AI agents in procedurally generated worlds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Environments</p>
                  <p className="text-3xl font-bold text-white">{environments.length}</p>
                </div>
                <Globe className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Sims</p>
                  <p className="text-3xl font-bold text-white">{activeEnvs}</p>
                </div>
                <Play className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">RL Sessions</p>
                  <p className="text-3xl font-bold text-white">{trainingSessions.length}</p>
                </div>
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Training</p>
                  <p className="text-3xl font-bold text-white">{activeSessions}</p>
                </div>
                <Activity className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="worlds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="worlds">Procedural Worlds</TabsTrigger>
            <TabsTrigger value="training">RL Training</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="worlds">
            {selectedEnv ? (
              <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
                <CardHeader>
                  <CardTitle className="text-white">{selectedEnv.environment_name}</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <ProceduralWorld3D
                    environmentConfig={selectedEnv}
                    resources={selectedEnv.resource_distribution?.nodes || []}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {environments.map((env) => (
                  <Card key={env.id} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">{env.environment_name}</h3>
                            <Badge className={env.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                              {env.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                              {env.environment_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            <p>Max Agents: {env.max_agents}</p>
                            <p>Time Scale: {env.time_scale}x</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedEnv(env)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View 3D
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="training">
            {trainingSessions.length > 0 ? (
              <>
                <Card className="bg-slate-900/50 border-slate-700 h-[400px] mb-4">
                  <CardContent className="p-0 h-full">
                    <MultiAgentRL3D session={trainingSessions[0]} />
                  </CardContent>
                </Card>
                
                <div className="grid gap-4">
                  {trainingSessions.map((session) => (
                    <Card key={session.id} className="bg-slate-900/50 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            session.status === 'running' ? 'bg-green-600' :
                            session.status === 'completed' ? 'bg-blue-600' :
                            'bg-red-600'
                          }>
                            {session.status}
                          </Badge>
                          <span className="text-white">
                            Episode {session.current_episode}/{session.total_episodes}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Avg Reward: {session.metrics?.avg_reward?.toFixed(2) || 0}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6 text-center text-gray-400">
                  No active training sessions
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generate Procedural World</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateWorldMutation.mutate({
                    environment_type: 'cooperative',
                    terrain_config: { type: 'procedural', size: 100 },
                    max_agents: 50
                  })}
                  disabled={generateWorldMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {generateWorldMutation.isPending ? 'Generating...' : 'Generate New World'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}