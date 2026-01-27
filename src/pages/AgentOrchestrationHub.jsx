import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AgentOrchestration3D from '../components/orchestration/AgentOrchestration3D';
import AgentTeamFormation3D from '../components/agents/AgentTeamFormation3D';
import PredictiveTrajectory3D from '../components/simulation/PredictiveTrajectory3D';
import CrossHubResourceBroker from '../components/orchestration/CrossHubResourceBroker';
import PredictiveMissionDashboard from '../components/orchestration/PredictiveMissionDashboard';
import MissionForecasterDashboard from '../components/orchestration/MissionForecasterDashboard';
import NegotiationVisualizer3D from '../components/orchestration/NegotiationVisualizer3D';
import { Network, TrendingUp, Zap, Plus, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentOrchestrationHub() {
  const [taskInput, setTaskInput] = useState('');
  const queryClient = useQueryClient();

  const { data: orchestrationData } = useQuery({
    queryKey: ['orchestration-visuals'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getOrchestrationVisuals', {});
      return response.data.orchestration_data;
    },
    refetchInterval: 10000
  });

  const { data: teamDynamics } = useQuery({
    queryKey: ['team-dynamics'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAgentTeamDynamics', {});
      return response.data;
    },
    refetchInterval: 10000
  });

  const { data: predictions } = useQuery({
    queryKey: ['simulation-predictions'],
    queryFn: async () => {
      const sims = await base44.entities.Simulation.filter({ status: 'running' });
      if (sims.length === 0) return [];
      
      return await base44.entities.PredictiveSimulation.filter({ 
        simulation_id: sims[0].id 
      });
    }
  });

  const allocateTasks = useMutation({
    mutationFn: async (tasks) => {
      const response = await base44.functions.invoke('allocateTasksToTeams', { tasks });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Allocated ${data.allocations.length} tasks`);
      queryClient.invalidateQueries({ queryKey: ['orchestration-visuals'] });
    }
  });

  const handleAllocate = () => {
    const tasks = taskInput.split('\n').filter(t => t.trim()).map((task, i) => ({
      task_id: `task-${Date.now()}-${i}`,
      description: task,
      priority: 1,
      complexity: 'medium'
    }));

    if (tasks.length > 0) {
      allocateTasks.mutate(tasks);
      setTaskInput('');
    }
  };

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Agent Orchestration Hub</h1>
          <p className="text-white/70 text-xl">
            AI-Powered Task Allocation & Team Coordination
          </p>
        </div>

        {orchestrationData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-400/50 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="text-white/60 text-xs">Active Teams</div>
                <div className="text-white text-3xl font-bold">{orchestrationData.teams?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-900/80 to-blue-900/80 border-cyan-400/50 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="text-white/60 text-xs">Tasks in Queue</div>
                <div className="text-white text-3xl font-bold">{orchestrationData.task_flow?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-green-400/50 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="text-white/60 text-xs">Success Rate</div>
                <div className="text-white text-3xl font-bold">
                  {((orchestrationData.performance?.success_rate || 0) * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-900/80 to-yellow-900/80 border-orange-400/50 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="text-white/60 text-xs">Optimization Score</div>
                <div className="text-white text-3xl font-bold">
                  {((orchestrationData.performance?.optimization_score || 0) * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orchestration" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="orchestration">
              <Network className="w-4 h-4 mr-2" />
              Orchestration
            </TabsTrigger>
            <TabsTrigger value="allocation">
              <Zap className="w-4 h-4 mr-2" />
              Task Allocation
            </TabsTrigger>
            <TabsTrigger value="predictions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Network className="w-4 h-4 mr-2" />
              Resource Broker
            </TabsTrigger>
            <TabsTrigger value="negotiation">
              <Bot className="w-4 h-4 mr-2" />
              Auto-Negotiation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orchestration" className="space-y-6 mt-6">
            <AgentOrchestration3D
              orchestrationData={orchestrationData}
              onTeamSelect={(team) => toast.info(`Team: ${team.team_name}`)}
              onTaskSelect={(task) => toast.info(`Task: ${task.task_id}`)}
            />

            {orchestrationData?.recommendations && orchestrationData.recommendations.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 border-purple-400/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {orchestrationData.recommendations.map((rec, i) => (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <p className="text-white text-sm">{rec.recommendation}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-purple-600 text-xs">
                            {(rec.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <span className="text-white/60 text-xs">{rec.impact} impact</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Allocate Tasks to Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Enter tasks (one per line)
                  </label>
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Analyze market trends&#10;Generate quarterly report&#10;Optimize portfolio allocation"
                    className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                  />
                </div>
                <Button
                  onClick={handleAllocate}
                  disabled={!taskInput.trim() || allocateTasks.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {allocateTasks.isPending ? 'Allocating...' : 'Allocate with AI'}
                </Button>
              </CardContent>
            </Card>

            {teamDynamics?.team_dynamics?.map((team, i) => (
              <Card key={i} className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{team.team_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Members</span>
                      <p className="text-white font-semibold">{team.members?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Health Score</span>
                      <p className="text-white font-semibold">{(team.health_score * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <span className="text-white/60">Tasks</span>
                      <p className="text-white font-semibold">{team.performance?.tasks_completed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictiveMissionDashboard />
              <MissionForecasterDashboard />
            </div>
            
            {predictions && predictions.map((pred, i) => (
              <div key={i}>
                <PredictiveTrajectory3D prediction={pred} />
                
                <Card className="bg-white/10 border-white/20 backdrop-blur-md mt-4">
                  <CardHeader>
                    <CardTitle className="text-white">Outcome Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pred.predicted_outcomes?.map((outcome, j) => (
                        <div key={j} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{outcome.scenario}</h4>
                            <Badge className="bg-green-600">
                              {(outcome.probability * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-white/70 text-sm">
                            Expected Value: {outcome.expected_value?.toFixed(2)}
                          </div>
                          {outcome.confidence_interval && (
                            <div className="text-white/60 text-xs mt-1">
                              CI: [{outcome.confidence_interval.lower?.toFixed(2)}, {outcome.confidence_interval.upper?.toFixed(2)}]
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {(!predictions || predictions.length === 0) && (
              <div className="text-center text-white/60 py-12">
                No predictions available. Run a simulation to generate forecasts.
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 mt-6">
            <CrossHubResourceBroker missionId="mission-default-001" />
          </TabsContent>

          <TabsContent value="negotiation" className="space-y-6 mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NegotiationVisualizer3D sessionData={{
                    mission_id: "NEG-AUTO-001",
                    negotiation_log: [
                        { agent: "Alpha-Lead", action: "Proposal", detail: "Requesting 500 Compute Units from Gamma-Node" },
                        { agent: "Gamma-Node", action: "Counter", detail: "Offering 350 Units + 20% Storage" },
                        { agent: "Alpha-Lead", action: "Analysis", detail: "Forecasting impact: 89% mission success with counter-offer" },
                        { agent: "Alpha-Lead", action: "Accept", detail: "Terms accepted. Reallocating..." }
                    ]
                }} />
                <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                    <CardHeader><CardTitle className="text-white">Active Negotiations</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                                <span className="text-white">Mission Alpha Resource Realloc</span>
                                <Badge className="bg-yellow-600">In Progress</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                                <span className="text-white">Gamma Node Compute Share</span>
                                <Badge className="bg-green-600">Completed</Badge>
                            </div>
                        </div>
                        <Button className="w-full mt-4" onClick={() => base44.functions.invoke('orchestration/autonomousNegotiation', { mission_id: 'new' })}>
                            Initiate New Negotiation
                        </Button>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}