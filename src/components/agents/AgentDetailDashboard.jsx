import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bot, Activity, GraduationCap, Shield, Users, Play, Pause, Trash2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AgentDetailDashboard({ agentId, onClose }) {
  const queryClient = useQueryClient();
  const [agentStatus, setAgentStatus] = useState('active');

  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents.find(a => a.id === agentId);
    }
  });

  const { data: kpis } = useQuery({
    queryKey: ['agent-kpis', agentId],
    queryFn: async () => {
      const allKpis = await base44.entities.AgentKPI.list();
      return allKpis.filter(k => k.agent_id === agentId);
    }
  });

  const { data: trainingHistory } = useQuery({
    queryKey: ['training-history', agentId],
    queryFn: async () => {
      const history = await base44.entities.TrainingProgress.list();
      return history.filter(h => h.agent_id === agentId);
    }
  });

  const { data: governanceRules } = useQuery({
    queryKey: ['agent-governance', agentId],
    queryFn: async () => {
      const rules = await base44.entities.AgentGovernanceRule.list();
      return rules.filter(r => r.agent_ids?.includes(agentId));
    }
  });

  const { data: collaborations } = useQuery({
    queryKey: ['agent-collaborations', agentId],
    queryFn: async () => {
      const orchs = await base44.entities.TeamOrchestration.list();
      return orchs.filter(o => o.team_agents?.includes(agentId));
    }
  });

  const { data: simulations } = useQuery({
    queryKey: ['agent-simulations', agentId],
    queryFn: async () => {
      const sims = await base44.entities.SimulationScenario.list();
      return sims.filter(s => 
        s.agent_configurations?.some(ac => ac.agent_id === agentId)
      );
    }
  });

  const updateAgentStatus = useMutation({
    mutationFn: async (status) => {
      // Update agent status
      setAgentStatus(status);
      return status;
    },
    onSuccess: (status) => {
      toast.success(`Agent ${status}`);
    }
  });

  const deleteAgent = useMutation({
    mutationFn: async () => {
      await base44.entities.Agent.delete(agentId);
    },
    onSuccess: () => {
      toast.success('Agent deleted');
      onClose?.();
    }
  });

  // Performance chart data
  const performanceData = kpis?.slice(-10).map(k => ({
    date: new Date(k.created_date).toLocaleDateString(),
    success: k.success_rate || 0,
    speed: k.execution_time || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{agent?.name || 'Agent'}</h2>
                <p className="text-gray-600">{agent?.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={agentStatus === 'active' ? 'default' : 'secondary'}>
                    {agentStatus}
                  </Badge>
                  <Badge variant="outline">{agent?.type || 'General'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {agentStatus === 'active' ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => updateAgentStatus.mutate('paused')}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => updateAgentStatus.mutate('active')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteAgent.mutate()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <Activity className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{kpis?.length || 0}</p>
            <p className="text-xs text-gray-600">Total KPIs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <GraduationCap className="w-6 h-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{trainingHistory?.length || 0}</p>
            <p className="text-xs text-gray-600">Training Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Shield className="w-6 h-6 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{governanceRules?.length || 0}</p>
            <p className="text-xs text-gray-600">Governance Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="w-6 h-6 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{collaborations?.length || 0}</p>
            <p className="text-xs text-gray-600">Collaborations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Play className="w-6 h-6 text-pink-500 mb-2" />
            <p className="text-2xl font-bold">{simulations?.length || 0}</p>
            <p className="text-xs text-gray-600">Simulations</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="success" stroke="#3b82f6" name="Success Rate %" />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                {kpis?.slice(-3).map((kpi) => (
                  <div key={kpi.id} className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50">
                    <p className="text-sm text-gray-600">{new Date(kpi.created_date).toLocaleDateString()}</p>
                    <p className="text-xl font-bold">{kpi.success_rate}%</p>
                    <p className="text-xs">Success Rate</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainingHistory?.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Training Session</p>
                      <p className="text-sm text-gray-600">
                        Progress: {session.progress_percentage}%
                      </p>
                    </div>
                    <Badge>{session.status}</Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>Applied Governance Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {governanceRules?.map((rule) => (
                <div key={rule.id} className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{rule.rule_name}</p>
                      <Badge variant="secondary" className="mt-1">{rule.rule_type}</Badge>
                    </div>
                    <Badge variant="outline">{rule.enforcement_level}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration">
          <Card>
            <CardHeader>
              <CardTitle>Active Collaborations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {collaborations?.map((collab) => (
                <div key={collab.id} className="p-4 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{collab.name}</p>
                      <p className="text-sm text-gray-600">{collab.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {collab.team_agents?.length} agents
                      </Badge>
                    </div>
                    <Badge>{collab.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simulations?.map((sim) => (
                <div key={sim.id} className="p-4 rounded-lg border bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{sim.scenario_name}</p>
                      <p className="text-sm text-gray-600">{sim.description}</p>
                    </div>
                    <Badge>{sim.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}