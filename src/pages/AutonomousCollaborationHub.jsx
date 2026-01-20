import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import TeamStructure3D from '@/components/collaboration/TeamStructure3D';
import CommunicationFlow3D from '@/components/collaboration/CommunicationFlow3D';
import { Users, Sparkles, Network, CheckCircle } from 'lucide-react';

export default function AutonomousCollaborationHub() {
  const [taskDesc, setTaskDesc] = useState('');
  const queryClient = useQueryClient();

  const { data: negotiations = [] } = useQuery({
    queryKey: ['agent-negotiations'],
    queryFn: () => base44.entities.AgentNegotiation.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['autonomous-teams'],
    queryFn: () => base44.entities.AgentTeam.list()
  });

  const proposeCollabMutation = useMutation({
    mutationFn: async ({ agent_id, task }) => {
      const response = await base44.functions.invoke('proposeCollaboration', {
        agent_id,
        task_description: task
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-negotiations']);
    }
  });

  const openNegotiations = negotiations.filter(n => n.status === 'open').length;
  const acceptedCollabs = negotiations.filter(n => n.status === 'accepted').length;
  const activeTeams = teams.filter(t => t.status === 'active').length;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-cyan-400" />
            Autonomous Collaboration Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI agents self-organizing into teams for complex tasks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Open Negotiations</p>
                  <p className="text-3xl font-bold text-white">{openNegotiations}</p>
                </div>
                <Network className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Accepted</p>
                  <p className="text-3xl font-bold text-white">{acceptedCollabs}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Teams</p>
                  <p className="text-3xl font-bold text-white">{activeTeams}</p>
                </div>
                <Users className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">All Negotiations</p>
                  <p className="text-3xl font-bold text-white">{negotiations.length}</p>
                </div>
                <Sparkles className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="negotiations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
            <TabsTrigger value="teams">Team Structures</TabsTrigger>
            <TabsTrigger value="propose">Propose Collab</TabsTrigger>
          </TabsList>

          <TabsContent value="negotiations">
            <div className="space-y-3">
              {negotiations.map((negotiation) => (
                <Card key={negotiation.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            negotiation.status === 'accepted' ? 'bg-green-600' :
                            negotiation.status === 'open' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }>
                            {negotiation.status}
                          </Badge>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                            {negotiation.negotiation_type}
                          </Badge>
                        </div>
                        <p className="text-white mb-2">Initiator: {negotiation.initiator_agent_id}</p>
                        <p className="text-sm text-gray-400">
                          Participants: {negotiation.participant_agent_ids?.length || 0} agents
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams">
            {teams.length > 0 ? (
              <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
                <CardContent className="p-0 h-full">
                  <TeamStructure3D team={teams[0]} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6 text-center text-gray-400">
                  No teams formed yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="propose">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Propose Agent Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe the task requiring collaboration..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
                
                <Button
                  onClick={() => proposeCollabMutation.mutate({
                    agent_id: 'agent_1',
                    task: taskDesc
                  })}
                  disabled={!taskDesc || proposeCollabMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {proposeCollabMutation.isPending ? 'Analyzing...' : 'Propose Collaboration'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}